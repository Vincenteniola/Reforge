import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { calculateFatigueScore } from "@/lib/fatigue";
import { sendFatigueAlert } from "@/lib/resend";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: accounts } = await supabaseAdmin.from("ad_accounts").select("*");

  for (const account of accounts || []) {
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
  }

  return NextResponse.json({ ok: true });
}

async function fetchMetaAdMetrics(account: { meta_access_token: string }) {
  return [] as {
    adId: string;
    adName: string;
    frequency: number;
    ctr: number;
    cpm: number;
    ctrSlope7d: number;
    cpmDrift7d: number;
  }[];
}
