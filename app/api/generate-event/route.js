import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Per-user rate limit: 5 requests / minute. This is process-local (a Map),
// so on Vercel it only holds within a single serverless instance — good
// enough to stop one signed-in account looping the endpoint, but not a
// distributed limit. A real production fix would be Upstash Redis +
// @upstash/ratelimit, shared across instances.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;
const requestLog = new Map(); // userId -> timestamps[]

function isRateLimited(userId) {
  const now = Date.now();
  const timestamps = (requestLog.get(userId) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS
  );
  timestamps.push(now);
  requestLog.set(userId, timestamps);
  return timestamps.length > RATE_LIMIT;
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "You must be signed in to use AI event generation" },
        { status: 401 }
      );
    }

    if (isRateLimited(userId)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `You are an event planning assistant. Generate event details based on the user's description.

CRITICAL: Return ONLY valid JSON with properly escaped strings. No newlines in string values - use spaces instead.

Return this exact JSON structure:
{
  "title": "Event title (catchy and professional, single line)",
  "description": "Detailed event description in a single paragraph. Use spaces instead of line breaks. Make it 2-3 sentences describing what attendees will learn and experience.",
  "category": "One of: tech, music, sports, art, food, business, health, education, gaming, networking, outdoor, community",
  "suggestedCapacity": 50,
  "suggestedTicketType": "free"
}

User's event idea: ${prompt}

Rules:
- Return ONLY the JSON object, no markdown, no explanation
- All string values must be on a single line with no line breaks
- Use spaces instead of \\n or line breaks in description
- Make title catchy and under 80 characters
- Description should be 2-3 sentences, informative, single paragraph
- suggestedTicketType should be either "free" or "paid"
`;

    const result = await model.generateContent(systemPrompt);

    const response = await result.response;
    const text = response.text();

    if (!text || !text.trim().startsWith("{")) {
      throw new Error("AI response was not valid JSON");
    }

    // Clean the response (remove markdown code blocks if present)
    let cleanedText = text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/```\n?/g, "");
    }
 
    let eventData;
    try {
      eventData = JSON.parse(cleanedText);
    } catch {
      throw new Error("Failed to parse AI response");
    }

    return NextResponse.json(eventData);
  } catch (error) {
    console.error("Error generating event:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "AI service temporarily unavailable. Please try again later.",
      },
      { status: 500 }
    );
  }
}
