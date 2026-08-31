/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { News } from "@/models/new.model";

export async function GET() {
  try {
    // 1. Bazaga ulanish
    await connectToDatabase();

    // 2. Hech qanday shartlarsiz barcha yangiliklarni olish (eng yangisi birinchi keladi)
    const news = await News.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: news,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("GET All News Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Serverda xatolik yuz berdi",
      },
      { status: 500 },
    );
  }
}
