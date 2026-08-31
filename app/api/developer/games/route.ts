import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongoose";
import Game from "@/models/game.model";
import User from "@/models/user.model"; // 👈 User modelini import qiling

export async function GET() {
  try {
    // 1. Bazaga ulanish
    await connectToDatabase();

    // 2. Auth tekshiruvi (Clerk ID)
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { message: "Aktiv sessiya topilmadi (Unauthenticated)" },
        { status: 401 },
      );
    }

    // 3. Clerk ID bo'yicha bazadan foydalanuvchini topamiz
    // (Eslatma: User modelida Clerk ID qaysi nomda saqlangan bo'lsa o'shani yozing, masalan clerkId yoki clerkUserId)
    const dbUser = await User.findOne({ clerkId: clerkId });

    if (!dbUser) {
      return NextResponse.json(
        { message: "Foydalanuvchi bazadan topilmadi" },
        { status: 404 },
      );
    }

    // 4. Endi foydalanuvchining MongoDBdagi ObjectId (_id) si bo'yicha o'yinlarni olamiz
    const games = await Game.find({ developerId: dbUser._id })
      .sort({ createdAt: -1 })
      .lean();

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
