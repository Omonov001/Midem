/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import mongoose from "mongoose"; // 👈 ObjectId ga o'tkazish uchun import qilindi
import { connectToDatabase } from "@/lib/mongoose";
import { News } from "@/models/new.model";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get("authorId");

    if (!authorId) {
      return NextResponse.json(
        { success: false, message: "Author ID ko'rsatilmagan!" },
        { status: 400 },
      );
    }

    // Bazaga ulanish
    await connectToDatabase();

    // 👈 URL'dan kelgan string authorId ni ObjectId ga o'tkazib qidiramiz
    const news = await News.find({
      authorId: new mongoose.Types.ObjectId(authorId),
    }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: news }, { status: 200 });
  } catch (error: any) {
    console.error("GET News Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// Yangilikni o'chirish (DELETE)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("_id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID topilmadi" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // ID yaroqli ObjectId ekanligini tekshirish (ixtiyoriy, lekin xavfsizlik uchun yaxshi)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Noto'g'ri formatdagi ID!" },
        { status: 400 },
      );
    }

    // Bazadan o'chirish
    const deletedNews = await News.findByIdAndDelete(id);

    if (!deletedNews) {
      return NextResponse.json(
        { success: false, message: "O'chiriladigan yangilik topilmadi!" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Muvaffaqiyatli o'chirildi!" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("DELETE News Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
