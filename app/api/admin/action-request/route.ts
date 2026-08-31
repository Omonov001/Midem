/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectToDatabase } from "@/lib/mongoose";
import Game from "@/models/game.model";
import { News } from "@/models/new.model";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();

    // Body'dan ma'lumotlarni olamiz
    const { targetId, targetType, action } = await req.json();

    // ID yoki kerakli parametrlar kelmagan bo'lsa tekshiramiz
    if (!targetId || !action) {
      return NextResponse.json(
        { success: false, message: "Ma'lumotlar to'liq emas" },
        { status: 400 },
      );
    }

    const newStatus = action === "approve" ? "approved" : "rejected";

    if (targetType === "games") {
      const updatedGame = await Game.findByIdAndUpdate(
        targetId,
        { request: newStatus },
        { new: true },
      );

      if (!updatedGame) {
        return NextResponse.json(
          { success: false, message: "O'yin topilmadi" },
          { status: 404 },
        );
      }
    }
    // 💥 2. Yangiliklar (News) uchun shartni qo'shamiz
    else if (targetType === "news") {
      const updatedNews = await News.findByIdAndUpdate(
        targetId,
        { request: newStatus },
        { new: true },
      );

      if (!updatedNews) {
        return NextResponse.json(
          { success: false, message: "Yangilik topilmadi" },
          { status: 404 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `So'rov muvaffaqiyatli ${
        action === "approve"
          ? "tasdiqlandi (approved)"
          : "rad etildi (rejected)"
      }!`,
    });
  } catch (error: any) {
    console.error("Action Request Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Serverda xatolik yuz berdi",
      },
      { status: 500 },
    );
  }
}
