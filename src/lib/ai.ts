import OpenAI from "openai";

function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export interface TrendAnalysis {
  opportunityScore: number;
  prediction: string;
  bestNiches: string[];
  contentAngle: string;
  timing: "now" | "24h" | "48h" | "wait";
  riskLevel: "low" | "medium" | "high";
}

interface TrendInput {
  title: string;
  description: string;
  category: string;
  growthRate: number;
  views: string;
  creators: number;
  tags: string[];
}

function safeJsonParse(text: string): unknown {
  // Extract JSON from markdown code blocks if present
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) return JSON.parse(match[1]);
  return JSON.parse(text);
}

export async function analyzeTrend(trend: TrendInput): Promise<TrendAnalysis> {
  const completion = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a TikTok trend intelligence analyst. You evaluate trends for creator opportunity. " +
          "Respond ONLY with a JSON object matching this schema:\n" +
          '{"opportunityScore": number (0-100), "prediction": string (1 sentence), "bestNiches": string[], "contentAngle": string, "timing": "now" | "24h" | "48h" | "wait", "riskLevel": "low" | "medium" | "high"}',
      },
      {
        role: "user",
        content: `Analyze this TikTok trend:

Title: ${trend.title}
Category: ${trend.category}
Growth: +${trend.growthRate}% in 72h
Views: ${trend.views}
Creators: ${trend.creators.toLocaleString()}
Description: ${trend.description}
Tags: ${trend.tags.join(", ")}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const text = completion.choices[0].message.content ?? "{}";
  const parsed = safeJsonParse(text) as TrendAnalysis;

  // Validate and clamp
  return {
    opportunityScore: Math.max(0, Math.min(100, parsed.opportunityScore ?? 50)),
    prediction: parsed.prediction ?? "Trend trajectory uncertain.",
    bestNiches: Array.isArray(parsed.bestNiches) ? parsed.bestNiches : [],
    contentAngle: parsed.contentAngle ?? "Standard approach recommended.",
    timing: ["now", "24h", "48h", "wait"].includes(parsed.timing) ? parsed.timing : "24h",
    riskLevel: ["low", "medium", "high"].includes(parsed.riskLevel) ? parsed.riskLevel : "medium",
  };
}

export interface Opportunity {
  type: "hashtag" | "sound" | "format" | "niche" | "timing";
  title: string;
  description: string;
  urgency: "immediate" | "today" | "this_week";
  difficulty: "easy" | "medium" | "hard";
  potentialViews: string;
}

export async function scanOpportunities(context?: string): Promise<Opportunity[]> {
  const completion = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a TikTok growth strategist. Generate exactly 5 specific, actionable opportunities " +
          "for creators to gain views TODAY. Respond ONLY with a JSON object: " +
          '{"opportunities": [{"type": "hashtag" | "sound" | "format" | "niche" | "timing", "title": string, "description": string, "urgency": "immediate" | "today" | "this_week", "difficulty": "easy" | "medium" | "hard", "potentialViews": string}]}',
      },
      {
        role: "user",
        content: context
          ? `Based on this context, generate 5 creator opportunities:\n${context}`
          : "Generate 5 high-urgency TikTok creator opportunities for today. Focus on underexploited trends, emerging formats, and algorithm gaps.",
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const text = completion.choices[0].message.content ?? "{\"opportunities\": []}";
  const parsed = safeJsonParse(text) as { opportunities: Opportunity[] };
  return parsed.opportunities ?? [];
}

export async function generateTrendBrief(trends: TrendInput[]): Promise<string> {
  const trendList = trends
    .map(
      (t, i) =>
        `${i + 1}. ${t.title} (${t.category}, +${t.growthRate}%, ${t.views} views)`
    )
    .join("\n");

  const completion = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Write a compelling, concise TikTok trend intelligence brief. " +
          "Style: sharp, urgent, creator-focused. No fluff. Use short paragraphs. 3-4 paragraphs max.",
      },
      {
        role: "user",
        content: `Write today's trend brief based on these signals:\n${trendList}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return completion.choices[0].message.content ?? "No brief generated.";
}
