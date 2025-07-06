import { NextRequest, NextResponse } from "next/server";
import { handleWebhook } from "../../../bot";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Call the existing webhook handler logic
    await handleWebhook(body);

    return NextResponse.json({ status: "OK" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Handle GET requests for health checks
export async function GET() {
  return NextResponse.json({
    status: "OK",
    message: "Telegram Watermark Bot is running",
    timestamp: new Date().toISOString(),
  });
}
