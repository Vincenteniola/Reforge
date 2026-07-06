import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reforge — Ad fatigue, predicted",
  description: "See which ads are about to fatigue, before your ROAS drops.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <nav style={{ borderBottom: "1px solid #eee", padding: "16px 24px" }}>
            <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", gap: 32, alignItems: "center" }}>
              <Link href="/" style={{ fontWeight: 700, fontSize: 18, textDecoration: "none", color: "#0b0f14" }}>
                Reforge
              </Link>
              <div style={{ display: "flex", gap: 24, fontSize: 14 }}>
                <Link href="/dashboard" style={{ textDecoration: "none", color: "#666" }}>
                  Fatigue Monitor
                </Link>
                <Link href="/analyzer" style={{ textDecoration: "none", color: "#666" }}>
                  Ad Analyzer
                </Link>
              </div>
            </div>
          </nav>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
