import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/sign-in`);
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=no_code`);
  }

  try {
    // Step 1: exchange the temporary code for a short-lived access token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
        `client_id=${process.env.META_APP_ID}` +
        `&client_secret=${process.env.META_APP_SECRET}` +
        `&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/api/meta/callback` +
        `&code=${code}`
    );
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("Meta token exchange failed:", tokenData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=token_exchange_failed`);
    }

    // Step 2: exchange that for a long-lived token (~60 days instead of ~1-2 hours)
    const longLivedRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
        `grant_type=fb_exchange_token` +
        `&client_id=${process.env.META_APP_ID}` +
        `&client_secret=${process.env.META_APP_SECRET}` +
        `&fb_exchange_token=${tokenData.access_token}`
    );
    const longLivedData = await longLivedRes.json();
    const accessToken = longLivedData.access_token || tokenData.access_token;

    // Step 3: ask Meta which ad account(s) this token can access
    const adAccountsRes = await fetch(
      `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name&access_token=${accessToken}`
    );
    const adAccountsData = await adAccountsRes.json();

    if (!adAccountsData.data || adAccountsData.data.length === 0) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=no_ad_accounts`);
    }

    // MVP: take the first ad account found. If someone has multiple,
    // a future version should let them choose instead of picking automatically.
    const firstAccount = adAccountsData.data[0];

    // Step 4: make sure this person has a row in our own `users` table
    // (nothing else currently creates this on sign-up, so we do it here as a safety net)
    const clerkUser = await (await import("@clerk/nextjs/server")).currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress || "unknown@example.com";

    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    let internalUserId = existingUser?.id;

    if (!internalUserId) {
      const { data: newUser, error: userErr } = await supabaseAdmin
        .from("users")
        .insert({ clerk_user_id: userId, email })
        .select("id")
        .single();

      if (userErr) throw userErr;
      internalUserId = newUser.id;
    }

    // Step 5: save the ad account + token
    await supabaseAdmin.from("ad_accounts").insert({
      user_id: internalUserId,
      meta_account_id: firstAccount.id,
      meta_access_token: accessToken,
      account_name: firstAccount.name,
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?connected=true`);
  } catch (err: any) {
    console.error("Meta callback error:", err.message);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=connection_failed`);
  }
}
