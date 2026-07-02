import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { supabaseAdmin } from "@/lib/supabase";

const stateColor: Record<string, string> = {
  green: "#2ed9a0",
  amber: "#ffc93c",
  red: "#ff5a36",
};

export default async function Dashboard() {
  const { userId } = auth();

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  let ads: any[] = [];
  if (user) {
    const { data: accounts } = await supabaseAdmin
      .from("ad_accounts")
      .select("id")
      .eq("user_id", user.id);

    const accountIds = (accounts || []).map((a) => a.id);

    if (accountIds.length > 0) {
      const { data } = await supabaseAdmin
        .from("ad_metrics")
        .select("*")
        .in("ad_account_id", accountIds)
        .order("checked_at", { ascending: false })
        .limit(20);
      ads = data || [];
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 24 }}>Your ads</h1>
        <UserButton />
      </div>

      {ads.length === 0 ? (
        <div style={{ padding: 32, background: "white", borderRadius: 12, textAlign: "center" }}>
          <p style={{ marginBottom: 16 }}>No ad account connected yet.</p>
          <a href="/api/meta/connect" className="btn">
            Connect your Meta ad account
          </a>
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: 12, overflow: "hidden" }}>
          {ads.map((ad) => (
            <div
              key={ad.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid #eee",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: stateColor[ad.fatigue_state] || "#ccc",
                  }}
                />
                <span>{ad.ad_name}</span>
              </div>
              <span style={{ color: "#777", fontSize: 14 }}>
                {ad.days_to_fatigue} day(s) left
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
