import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Game from "@/models/game.model";

export async function GET() {
  try {
    // 1. Bazaga ulanish
    await connectToDatabase();

    // 2. Hech qanday tekshiruvsiz bazadagi barcha o'yinlarni olish
    const games = await Game.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json(games, { status: 200 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Xatolikni terminalda ko'rish uchun:
    console.error("=== GET /api/developer/games ERROR ===");
    console.error(error);
    console.error("======================================");

    return NextResponse.json(
      {
        message: "Serverda xatolik yuz berdi",
        error: error?.message || String(error),
      },
      { status: 500 },
    );
  }
}
