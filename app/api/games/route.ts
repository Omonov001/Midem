/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectToDatabase } from "@/lib/mongoose";
import Game from "@/models/game.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    // 🎯 Ham "approved", ham "public" bo'lgan o'yinlarni olib kelamiz
    const games = await Game.find({
      request: "approved",
      visibility: "public",
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(games, { status: 200 });
  } catch (error: any) {
    console.error("GET All Games Error:", error);
    return NextResponse.json(
      { error: "O'yinlarni olishda xatolik" },
      { status: 500 },
    );
  }
}
