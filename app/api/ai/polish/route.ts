import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  try {
    const { text } = await req.json();
    if (!text || text.length > 400) {
      return NextResponse.json({ error: "Text is required and must be ≤ 400 characters" }, { status: 400 });
    }

    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: `Polish the following text:\n\n${text}`,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const polishedText = data.choices?.[0]?.text?.trim();

    return NextResponse.json({ polished: polishedText });
  } catch (err: any) {
    console.error("AI polish error", err);
    return NextResponse.json({ error: err.message || "Failed to polish text" }, { status: 500 });
  }
}
