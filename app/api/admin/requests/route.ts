/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectToDatabase } from "@/lib/mongoose";
import Game from "@/models/game.model";
import { News } from "@/models/new.model";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    // 1. request: "requested" bo'lgan o'yinlarni olish
    const games = await Game.find({ request: "requested" })
      .populate({
        path: "developerId",
        model: User,
        select: "username name email _id",
      })
      .sort({ createdAt: -1 });

    // 2. request: "requested" bo'lgan yangiliklarni olish (authorId orqali User ni bog'laymiz)
    const news = await News.find({ request: "requested" })
      .populate({
        path: "authorId", // 👈 Modelda authorId ekanligi aniq ko'rsatilgan
        model: User,
        select: "username name email _id",
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, games, news });
  } catch (error) {
    console.error("GET Requests Error:", error);
    return NextResponse.json(
      { success: false, message: "Xatolik" },
      { status: 500 },
    );
  }
}
