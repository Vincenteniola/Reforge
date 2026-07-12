import { NextResponse } from "next/server";

export async function GET() {
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/meta/callback`;

  const metaAuthUrl =
    `https://www.facebook.com/v19.0/dialog/oauth` +
    `?client_id=${process.env.META_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent("ads_read,ads_management")}`;

  return NextResponse.redirect(metaAuthUrl);
}
