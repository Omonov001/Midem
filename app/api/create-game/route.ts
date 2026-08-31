import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import mongoose from "mongoose";

import Game from "@/models/game.model";
import Card from "@/models/card.model";
import User from "@/models/user.model";
import { connectToDatabase } from "@/lib/mongoose";

export async function POST(req: Request) {
  try {
    // 1. Clerk user
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Tizimga kirmagansiz!" },
        { status: 401 },
      );
    }

    await connectToDatabase();

    // 2. MongoDB user
    const mongoUser = await User.findOne({ clerkId: user.id });

    if (!mongoUser) {
      return NextResponse.json(
        { message: "MongoDB'dan mos foydalanuvchi topilmadi!" },
        { status: 404 },
      );
    }

    // 3. Body
    const body = await req.json();

    const { slug, payoutCardId, priceType, price, ...gameData } = body;

    // 4. Slug
    if (!slug) {
      return NextResponse.json(
        { message: "Slug generatsiya qilinmagan!" },
        { status: 400 },
      );
    }

    // 5. Duplicate slug
    const existingGame = await Game.findOne({ slug });

    if (existingGame) {
      return NextResponse.json(
        { message: "Ushbu slug bilan o'yin allaqachon mavjud!" },
        { status: 409 },
      );
    }

    // 6. Agar o'yin pullik bo'lsa, payout card majburiy
    if (priceType === "paid") {
      if (!payoutCardId) {
        return NextResponse.json(
          {
            message: "Pullik o'yin uchun payout kartani tanlashingiz kerak!",
          },
          { status: 400 },
        );
      }

      if (!mongoose.Types.ObjectId.isValid(payoutCardId)) {
        return NextResponse.json(
          { message: "Noto'g'ri payoutCardId!" },
          { status: 400 },
        );
      }

      // 7. Karta aynan shu developerga tegishlimi?
      const card = await Card.findOne({
        _id: payoutCardId,
        userId: user.id,
        verified: true,
      });

      if (!card) {
        return NextResponse.json(
          {
            message: "Payout karta topilmadi yoki tasdiqlanmagan!",
          },
          { status: 403 },
        );
      }
    }

    // 8. Faqat kerakli ma'lumotlarni saqlaymiz
    const newGame = await Game.create({
      ...gameData,

      slug,
      priceType: priceType || "free",
      price: priceType === "paid" ? price : "0$",

      // Developerning haqiqiy MongoDB ID'si
      developerId: mongoUser._id,

      // Faqat tekshirilgan karta ID'si
      payoutCardId: priceType === "paid" ? payoutCardId : null,

      request: "requested",
    });

    return NextResponse.json(
      {
        success: true,
        message: "O'yin so'rovi muvaffaqiyatli saqlandi!",
        data: newGame,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Create Game API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Serverda xatolik yuz berdi",
      },
      { status: 500 },
    );
  }
}
