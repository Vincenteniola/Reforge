// v1 fatigue model — a transparent weighted formula, not machine learning.
// This is intentional: with no historical data yet, a formula you can explain
// out loud to a customer is more trustworthy than a black-box model.

type MetricInput = {
  frequency: number;      // how many times avg person has seen this ad
  ctrSlope7d: number;     // % change in CTR over the last 7 days (negative = declining)
  cpmDrift7d: number;     // % change in CPM over the last 7 days (positive = getting pricier)
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

// Turns a raw metric into a 0-100 "badness" score
function normalizeFrequency(freq: number) {
  // healthy below 1.5, critical above 4.0 — tune per-account later
  return clamp(((freq - 1.5) / (4.0 - 1.5)) * 100);
}
function normalizeCtrSlope(slope: number) {
  // 0% change = healthy, -40% or worse = critical
  return clamp((-slope / 40) * 100);
}
function normalizeCpmDrift(drift: number) {
  // 0% change = healthy, +40% or worse = critical
  return clamp((drift / 40) * 100);
}

export function calculateFatigueScore(input: MetricInput) {
  const score =
    0.35 * normalizeFrequency(input.frequency) +
    0.30 * normalizeCtrSlope(input.ctrSlope7d) +
    0.20 * normalizeCpmDrift(input.cpmDrift7d) +
    0.15 * 0; // placeholder for sentiment signal — add once you have that data source

  const rounded = Math.round(score);

  let fatigueState: "green" | "amber" | "red" = "green";
  if (rounded >= 70) fatigueState = "red";
  else if (rounded >= 40) fatigueState = "amber";

  // Rough linear projection: how many days until score would hit 100
  // at the current rate of decline (bounded so it doesn't show silly numbers)
  const dailyRateEstimate = Math.max(rounded / 10, 1);
  const daysToFatigue = clamp(Math.round((100 - rounded) / dailyRateEstimate), 0, 30);

  return { fatigueScore: rounded, fatigueState, daysToFatigue };
}
