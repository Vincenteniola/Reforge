import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { buildAnalyzerPrompt } from "@/lib/analyzer-prompt";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  try {
    const prompt = buildAnalyzerPrompt(body);

    // Call Claude via fetch (no SDK needed)
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-6",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data: any = await response.json();

    if (!response.ok) {
      console.error("Claude API error:", data);
      throw new Error(data.error?.message || "Claude API failed");
    }

    const textContent = data.content?.find((c: any) => c.type === "text");
    if (!textContent) throw new Error("No text response from Claude");

    const result = JSON.parse(textContent.text);

    // Store in DB
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (user) {
      await supabaseAdmin.from("ad_analyses").insert({
        user_id: user.id,
        ad_name: body.adName,
        creative_description: body.creativeDescription,
        notes: body.notes,
        age_range_min: body.ageMin,
        age_range_max: body.ageMax,
        demographic: body.demographic,
        duration_seconds: body.durationSeconds,
        platform: body.platform,
        performance_score: result.performance_score,
        creative_quality: result.creative_quality,
        audience_fit: result.audience_fit,
        copy_strength: result.copy_strength,
        cta_clarity: result.cta_clarity,
        platform_fit: result.platform_fit,
        fatigue_risk: result.fatigue_risk,
        gaps: result.gaps,
        keyword_suggestions: result.keyword_suggestions,
        improvements: result.improvements,
      });
    }

    return NextResponse.json({ ...result, ad_name: body.adName });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
        }
