export function buildAnalyzerPrompt(input: {
  adName: string;
  creativeDescription: string;
  notes: string;
  ageMin: number;
  ageMax: number;
  demographic: string;
  durationSeconds: number;
  platform: "meta" | "tiktok" | "google";
}) {
  const { adName, creativeDescription, notes, ageMin, ageMax, demographic, durationSeconds, platform } = input;

  return `You are an expert performance marketer analyzing an ad BEFORE it launches. Your job is to flag weaknesses that will cause FATIGUE quickly.

AD DETAILS:
- Name: ${adName}
- Platform: ${platform}
- Target Age: ${ageMin}-${ageMax}
- Target Demographic: ${demographic}
- Duration: ${durationSeconds} seconds
- Creative: ${creativeDescription}
- Notes: ${notes}

Analyze across these 6 dimensions (score each 0-10):

1. CREATIVE QUALITY: Production value, hook strength (first 1-2 sec critical), visual uniqueness, editing pacing
2. AUDIENCE FIT: Does the creative resonate with stated demographic? Age match? Cultural fit?
3. COPY STRENGTH: Urgency, specificity, emotional pull, clarity of benefit
4. CTA CLARITY: Is the ask obvious? Compelling? Matches platform norm?
5. PLATFORM FIT: Does this STYLE match platform? (TikTok=fast/raw, Meta=polished, Google=clear/direct)
6. FATIGUE RISK (0-10, where 10=fatigues in 3 days): How quickly will audiences get tired of this? Assess:
   - Hook novelty: Overused hook = high fatigue risk
   - Message repetition: Is the core message repetitive/thin? High risk
   - Visual wear: Will the visual/color/product look stale fast? 
   - Frequency tolerance: Low-novelty ads fatigue faster; highly differentiated ads last longer
   - Audience saturation: Broad demographic = faster fatigue; niche = slower

CRITICAL: Creative quality directly predicts fatigue. Low creative quality = ad fatigues 2x faster.

Return ONLY valid JSON (no markdown, no preamble):
{
  "performance_score": <0-100 overall likelihood to pull numbers>,
  "creative_quality": <0-10>,
  "audience_fit": <0-10>,
  "copy_strength": <0-10>,
  "cta_clarity": <0-10>,
  "platform_fit": <0-10>,
  "fatigue_risk": <0-10 where 10 = fatigues in 2-3 days>,
  "estimated_days_to_fatigue": <number, based on risk: risk 8+ = 3-5 days, 5-7 = 7-14 days, <5 = 21+ days>,
  "gaps": [
    "Most critical weakness (use this to fix fatigue)",
    "Secondary gap",
    "Tertiary gap"
  ],
  "fatigue_warnings": [
    "Specific reason this will fatigue fast (if risk >= 6)",
    "Second fatigue driver (if applicable)"
  ],
  "keyword_suggestions": [
    "kw1",
    "kw2",
    "kw3",
    "kw4"
  ],
  "improvements": [
    "Specific fix to reduce fatigue (make it actionable)",
    "Second improvement",
    "Third improvement"
  ],
  "reasoning": "2-3 sentence summary of why this fatigue risk + how to avoid it"
}`;
}
