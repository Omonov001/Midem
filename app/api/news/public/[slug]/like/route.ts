/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { News } from "@/models/new.model";
import User from "@/models/user.model"; // Sizning user modelingiz
import { getAuth } from "@clerk/nextjs/server"; // Clerk orqali user aniqlash

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await connectToDatabase();
    const { slug } = await params;

    // Clerk orqali kirgan foydalanuvchining clerkId sini olish
    const { userId: clerkId } = getAuth(req as any);

    if (!clerkId) {
      return NextResponse.json(
        { success: false, message: "Iltimos, oldin tizimga kiring!" },
        { status: 401 },
      );
    }

    // ClerkId bo'yicha bazadan o'zimizning User modelidagi foydalanuvchini topamiz
    const dbUser = await User.findOne({ clerkId });
    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: "Foydalanuvchi bazadan topilmadi!" },
        { status: 404 },
      );
    }

    const userId = dbUser._id; // User ning MongoDB dagi _id si

    const newsItem = await News.findOne({ slug });
    if (!newsItem) {
      return NextResponse.json(
        { success: false, message: "Yangilik topilmadi!" },
        { status: 404 },
      );
    }

    // User allaqachon like bosganligini tekshirish
    const hasLiked = newsItem.likedUsers.some(
      (id: any) => id.toString() === userId.toString(),
    );

    if (hasLiked) {
      // Like'ni olib tashlash (Unlike)
      newsItem.likedUsers = newsItem.likedUsers.filter(
        (id: any) => id.toString() !== userId.toString(),
      );
      newsItem.likes = Math.max(0, newsItem.likes - 1);
    } else {
      // Like qo'shish
      newsItem.likedUsers.push(userId);
      newsItem.likes += 1;
    }

    await newsItem.save();

    return NextResponse.json(
      {
        success: true,
        likes: newsItem.likes,
        hasLiked: !hasLiked,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Like Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server xatoligi" },
      { status: 500 },
    );
  }
}
