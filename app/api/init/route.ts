import { NextResponse } from "next/server";
import { initializeBot } from "../../../bot";

export async function GET() {
  try {
    await initializeBot();
    return NextResponse.json({
      status: "OK",
      message: "Bot initialized successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Initialization error:", error);
    return NextResponse.json(
      {
        error: "Failed to initialize bot",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
