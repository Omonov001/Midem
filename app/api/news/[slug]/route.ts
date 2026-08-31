/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongoose";
import { News } from "@/models/new.model";
import User from "@/models/user.model";

// Bitta yangilikni slug bo'yicha olish (GET)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    await connectToDatabase();

    const newsItem = await News.findOne({ slug });

    if (!newsItem) {
      return NextResponse.json(
        { success: false, message: "Yangilik topilmadi!" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: newsItem },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// Bitta yangilikni slug bo'yicha tahrirlash (PUT)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Tizimga kirmagansiz!" },
        { status: 401 },
      );
    }

    await connectToDatabase();

    const mongoUser = await User.findOne({ clerkId: user.id });

    if (!mongoUser) {
      return NextResponse.json(
        { success: false, message: "Foydalanuvchi topilmadi!" },
        { status: 404 },
      );
    }

    const { slug } = await params;
    const body = await req.json();

    const updatedNews = await News.findOneAndUpdate(
      { slug },
      {
        ...body,
        request: "requested",
        authorId: new mongoose.Types.ObjectId(mongoUser._id),
      },
      { new: true },
    );

    if (!updatedNews) {
      return NextResponse.json(
        { success: false, message: "Yangilash uchun yangilik topilmadi!" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Muvaffaqiyatli yangilandi!",
        data: updatedNews,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
