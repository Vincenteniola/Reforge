import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { calculateFatigueScore } from "@/lib/fatigue";
import { sendFatigueAlert } from "@/lib/resend";

export const runtime = "nodejs"; // this SDK needs Node, not the edge runtime

const bizSdk = require("facebook-nodejs-business-sdk");
const FacebookAdsApi = bizSdk.FacebookAdsApi;
const AdAccount = bizSdk.AdAccount;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: accounts } = await supabaseAdmin.from("ad_accounts").select("*");
  const results = [];

  for (const account of accounts || []) {
    try {
      const liveAdMetrics = await fetchMetaAdMetrics(account);

      for (const metric of liveAdMetrics) {
        const { fatigueScore, fatigueState, daysToFatigue } = calculateFatigueScore({
          frequency: metric.frequency,
          ctrSlope7d: metric.ctrSlope7d,
          cpmDrift7d: metric.cpmDrift7d,
        });

        await supabaseAdmin.from("ad_metrics").insert({
          ad_account_id: account.id,
          meta_ad_id: metric.adId,
          ad_name: metric.adName,
          frequency: metric.frequency,
          ctr: metric.ctr,
          cpm: metric.cpm,
          fatigue_score: fatigueScore,
          fatigue_state: fatigueState,
          days_to_fatigue: daysToFatigue,
        });

        if (fatigueState === "amber" || fatigueState === "red") {
          const { data: user } = await supabaseAdmin
            .from("users")
            .select("email")
            .eq("id", account.user_id)
            .single();

          if (user) {
            await sendFatigueAlert({
              to: user.email,
              adName: metric.adName,
              daysToFatigue,
              fatigueState,
            });
          }
        }
      }

      results.push({ accountId: account.id, status: "ok", adsChecked: liveAdMetrics.length });
    } catch (err: any) {
      console.error(`Failed to check account ${account.id}:`, err.message);
      results.push({ accountId: account.id, status: "error", message: err.message });
    }
  }

  return NextResponse.json({ ok: true, results });
}

async function fetchMetaAdMetrics(account: {
  id: string;
  meta_account_id: string;
  meta_access_token: string;
}) {
  FacebookAdsApi.init(account.meta_access_token);
  const adAccount = new AdAccount(account.meta_account_id);

  // Pull yesterday's performance for every currently active ad
  const insights = await adAccount.getInsights(
    ["ad_id", "ad_name", "frequency", "ctr", "cpm"],
    {
      level: "ad",
      date_preset: "yesterday",
      filtering: [{ field: "ad.effective_status", operator: "IN", value: ["ACTIVE"] }],
    }
  );

  const metrics = [];

  for (const row of insights) {
    const adId = row.ad_id;
    const adName = row.ad_name;
    const frequency = parseFloat(row.frequency || "0");
    const ctr = parseFloat(row.ctr || "0");
    const cpm = parseFloat(row.cpm || "0");

    // Find this same ad's reading from about a week ago to measure real change
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 8);

    const { data: pastMetric } = await supabaseAdmin
      .from("ad_metrics")
      .select("ctr, cpm, checked_at")
      .eq("ad_account_id", account.id)
      .eq("meta_ad_id", adId)
      .gte("checked_at", sevenDaysAgo.toISOString())
      .order("checked_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    let ctrSlope7d = 0;
    let cpmDrift7d = 0;

    if (pastMetric?.ctr > 0) {
      ctrSlope7d = ((ctr - pastMetric.ctr) / pastMetric.ctr) * 100;
    }
    if (pastMetric?.cpm > 0) {
      cpmDrift7d = ((cpm - pastMetric.cpm) / pastMetric.cpm) * 100;
    }

    metrics.push({ adId, adName, frequency, ctr, cpm, ctrSlope7d, cpmDrift7d });
  }

  return metrics;
    }
