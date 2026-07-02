type MetricInput = {
  frequency: number;
  ctrSlope7d: number;
  cpmDrift7d: number;
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function normalizeFrequency(freq: number) {
  return clamp(((freq - 1.5) / (4.0 - 1.5)) * 100);
}
function normalizeCtrSlope(slope: number) {
  return clamp((-slope / 40) * 100);
}
function normalizeCpmDrift(drift: number) {
  return clamp((drift / 40) * 100);
}

export function calculateFatigueScore(input: MetricInput) {
  const score =
    0.35 * normalizeFrequency(input.frequency) +
    0.30 * normalizeCtrSlope(input.ctrSlope7d) +
    0.20 * normalizeCpmDrift(input.cpmDrift7d) +
    0.15 * 0;

  const rounded = Math.round(score);

  let fatigueState: "green" | "amber" | "red" = "green";
  if (rounded >= 70) fatigueState = "red";
  else if (rounded >= 40) fatigueState = "amber";

  const dailyRateEstimate = Math.max(rounded / 10, 1);
  const daysToFatigue = clamp(Math.round((100 - rounded) / dailyRateEstimate), 0, 30);

  return { fatigueScore: rounded, fatigueState, daysToFatigue };
}
