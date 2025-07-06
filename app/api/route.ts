import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "OK",
    message: "Telegram Watermark Bot is running",
    timestamp: new Date().toISOString(),
  });
}
