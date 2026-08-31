/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { News } from "@/models/new.model";
import "@/models/user.model"; // User modeli ro'yxatdan o'tgan bo'lishi shart

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await connectToDatabase();
    const { slug } = await params;

    // Slug bo'yicha qidirib, views ni oshiramiz va authorId ni populate qilamiz
    const newsItem = await News.findOneAndUpdate(
      { slug, visibility: "public", request: "approved" },
      { $inc: { views: 1 } },
      { new: true },
    ).populate({
      path: "authorId",
      select: "name username picture", // Foydalanuvchining kerakli maydonlari
    });

    if (!newsItem) {
      return NextResponse.json(
        { success: false, message: "Yangilik topilmadi!" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: newsItem,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Fetch Single News Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server xatoligi" },
      { status: 500 },
    );
  }
}
