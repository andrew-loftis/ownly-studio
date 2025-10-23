import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.ZAPIER_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: "Zapier webhook URL not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { email, features, plan, ts } = body;

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, features, plan, ts }),
    });

    if (!response.ok) {
      throw new Error(`Zapier webhook failed: ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Zapier webhook error", err);
    return NextResponse.json({ error: err.message || "Failed to call Zapier webhook" }, { status: 500 });
  }
}
