/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { News } from "@/models/new.model";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const { slug, author, selectedGame, visibility, translations } = body;

    if (!slug || !author) {
      return NextResponse.json(
        { success: false, message: "Slug va Author maydonlari majburiy!" },
        { status: 400 },
      );
    }

    const newNews = await News.create({
      slug,
      author,
      selectedGame: selectedGame || undefined,
      visibility: visibility || "public",
      translations,
    });

    return NextResponse.json({ success: true, data: newNews }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
