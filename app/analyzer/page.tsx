"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function Analyzer() {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [form, setForm] = useState({
    adName: "",
    creativeDescription: "",
    notes: "",
    ageMin: 18,
    ageMax: 65,
    demographic: "",
    durationSeconds: 15,
    platform: "meta" as const,
  });

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/analyzer/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  const fatigueColor = result?.fatigue_risk >= 7 ? "#ff5a36" : result?.fatigue_risk >= 5 ? "#ffc93c" : "#2ed9a0";

  return (
    <main style={{ maxWidth: 920, margin: "40px auto", padding: "0 24px" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Ads Analyzer</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>
        Catch weak creative before launch. Predict fatigue. Improve targeting.
      </p>

      {!result ? (
        <form onSubmit={handleAnalyze} style={{ background: "white", padding: 32, borderRadius: 12 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Ad Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Summer Sale - Reels v1"
              value={form.adName}
              onChange={(e) => setForm({ ...form, adName: e.target.value })}
              style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6 }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Creative Description</label>
            <textarea
              required
              placeholder="Describe the video/image in detail. e.g., 'Woman opening skincare product, 3-sec hook of glowing skin before/after, upbeat music, white background, pink text overlay with price'"
              value={form.creativeDescription}
              onChange={(e) => setForm({ ...form, creativeDescription: e.target.value })}
              style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6, minHeight: 100, fontFamily: "monospace", fontSize: 13 }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Additional Notes (offer, CTA, urgency)</label>
            <textarea
              placeholder="e.g., 'Limited time offer - 50% off, CTA is 'Shop Now' button, targeting women who bought skincare in last 30 days'"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6, minHeight: 60 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 13 }}>Age Min</label>
              <input
                type="number"
                required
                value={form.ageMin}
                onChange={(e) => setForm({ ...form, ageMin: parseInt(e.target.value) })}
                style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6 }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 13 }}>Age Max</label>
              <input
                type="number"
                required
                value={form.ageMax}
                onChange={(e) => setForm({ ...form, ageMax: parseInt(e.target.value) })}
                style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6 }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 13 }}>Duration (sec)</label>
              <input
                type="number"
                required
                value={form.durationSeconds}
                onChange={(e) => setForm({ ...form, durationSeconds: parseInt(e.target.value) })}
                style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Demographic</label>
            <input
              type="text"
              required
              placeholder="e.g., Women 25-40 interested in skincare, fitness, wellness"
              value={form.demographic}
              onChange={(e) => setForm({ ...form, demographic: e.target.value })}
              style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6 }}
            />
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Platform</label>
            <select
              required
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value as any })}
              style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6 }}
            >
              <option value="meta">Meta (Facebook/Instagram/Reels)</option>
              <option value="tiktok">TikTok</option>
              <option value="google">Google Ads</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 14,
              background: loading ? "#ccc" : "#0b0f14",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: loading ? "default" : "pointer",
              fontSize: 15,
            }}
          >
            {loading ? "Analyzing..." : "Analyze Ad"}
          </button>
        </form>
      ) : (
        <div style={{ background: "white", padding: 32, borderRadius: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <h2 style={{ fontSize: 24, margin: 0 }}>Results for "{result.ad_name || form.adName}"</h2>
            <button
              onClick={() => setResult(null)}
              style={{
                padding: "8px 16px",
                background: "#f4f6f8",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              New Analysis
            </button>
          </div>

          {/* Overall Score */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div style={{ background: "#f4f6f8", padding: 20, borderRadius: 12 }}>
              <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>Performance Score</div>
              <div style={{ fontSize: 48, fontWeight: 700, color: "#0b0f14" }}>
                {result.performance_score}
                <span style={{ fontSize: 16, color: "#666", marginLeft: 4 }}>/100</span>
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
                {result.performance_score >= 70
                  ? "Strong potential to pull numbers"
                  : result.performance_score >= 50
                  ? "Moderate potential, but fixable"
                  : "Weak — needs significant improvement"}
              </div>
            </div>

            <div style={{ background: fatigueColor, padding: 20, borderRadius: 12, color: "white" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>Fatigue Risk</div>
              <div style={{ fontSize: 48, fontWeight: 700 }}>
                {result.fatigue_risk}
                <span style={{ fontSize: 16, marginLeft: 4 }}>/10</span>
              </div>
              <div style={{ fontSize: 12, marginTop: 8, color: "rgba(255,255,255,0.9)" }}>
                Will likely fatigue in ~{result.estimated_days_to_fatigue} days
              </div>
            </div>
          </div>

          {/* Critical: Fatigue Warnings */}
          {result.fatigue_warnings?.length > 0 && (
            <div style={{ background: "#fff3cd", border: "1px solid #ffc93c", padding: 16, borderRadius: 8, marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#856404", textTransform: "uppercase", marginBottom: 8 }}>⚠️ Fatigue Drivers</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {result.fatigue_warnings.map((w: string, i: number) => (
                  <li key={i} style={{ fontSize: 13, color: "#856404", marginBottom: i < result.fatigue_warnings.length - 1 ? 6 : 0 }}>
                    • {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Score Breakdown */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16, fontWeight: 600 }}>Score Breakdown</h3>
            {[
              { label: "Creative Quality", score: result.creative_quality, critical: true },
              { label: "Audience Fit", score: result.audience_fit },
              { label: "Copy Strength", score: result.copy_strength },
              { label: "CTA Clarity", score: result.cta_clarity },
              { label: "Platform Fit", score: result.platform_fit },
            ].map((item) => (
              <div key={item.label} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: item.critical ? 600 : 400 }}>
                    {item.label} {item.critical ? "⭐" : ""}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{item.score}/10</span>
                </div>
                <div style={{ height: 6, background: "#eee", borderRadius: 3, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${(item.score / 10) * 100}%`,
                      background: item.score >= 7 ? "#2ed9a0" : item.score >= 5 ? "#ffc93c" : "#ff5a36",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Critical Gaps */}
          {result.gaps?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 12, fontWeight: 600, color: "#ff5a36" }}>Critical Issues</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {result.gaps.map((gap: string, i: number) => (
                  <li
                    key={i}
                    style={{
                      padding: "12px 0",
                      borderBottom: i < result.gaps.length - 1 ? "1px solid #eee" : "none",
                      fontSize: 13,
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "#ff5a36" }}>{i + 1}.</span> {gap}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Keyword Suggestions */}
          {result.keyword_suggestions?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 12, fontWeight: 600 }}>Suggested Keywords</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {result.keyword_suggestions.map((kw: string, i: number) => (
                  <span
                    key={i}
                    style={{
                      background: "#f4f6f8",
                      padding: "7px 14px",
                      borderRadius: 20,
                      fontSize: 12,
                      border: "1px solid #e0e4e8",
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Improvements */}
          {result.improvements?.length > 0 && (
            <div style={{ background: "#f0fdf4", padding: 16, borderRadius: 8 }}>
              <h3 style={{ fontSize: 16, marginBottom: 12, fontWeight: 600, color: "#2ed9a0" }}>✓ How to Fix This</h3>
              <ol style={{ paddingLeft: 20, margin: 0 }}>
                {result.improvements.map((imp: string, i: number) => (
                  <li key={i} style={{ marginBottom: 10, fontSize: 13, color: "#1a5f3f" }}>
                    <span style={{ fontWeight: 600 }}>{imp.split(":")[0]}:</span> {imp.includes(":") ? imp.split(":")[1].trim() : imp}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Summary */}
          {result.reasoning && (
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #eee", fontSize: 13, color: "#666", fontStyle: "italic" }}>
              {result.reasoning}
            </div>
          )}
        </div>
      )}
    </main>
  );
    }
