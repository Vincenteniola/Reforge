import { NextResponse } from "next/server";

export async function GET() {
  const metaAuthUrl =
    `https://www.facebook.com/v19.0/dialog/oauth` +
    `?client_id=${process.env.META_APP_ID}` +
    `&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/api/meta/callback` +
    `&scope=ads_read,ads_management`;

  return NextResponse.redirect(metaAuthUrl);
}
