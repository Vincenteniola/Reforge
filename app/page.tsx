import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: "80px auto", padding: "0 24px" }}>
      <h1 style={{ fontSize: 40, marginBottom: 12 }}>Reforge</h1>
      <p style={{ fontSize: 18, color: "#555", marginBottom: 32 }}>
        See which ads are about to fatigue, before your ROAS drops.
      </p>
      <Link href="/sign-up" className="btn">
        Start free trial
      </Link>
      <span style={{ marginLeft: 16 }}>
        <Link href="/sign-in">Log in</Link>
      </span>
    </main>
  );
}
