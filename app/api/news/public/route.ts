/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { News } from "@/models/new.model";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all"; // all, best, newest, oldest

    // Faqat tasdiqlangan va ommaviy yangiliklarni qidiramiz
    const query: any = {
      visibility: "public",
      request: "approved",
    };

    // Sortirovka shartlari
    let sortOption: any = { createdAt: -1 }; // Standart: Eng yangisi

    if (filter === "newest") {
      sortOption = { createdAt: -1 };
    } else if (filter === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (filter === "best") {
      // Masalan, eng ko'p ko'rilgan yoki boshqa mezonga ko'ra (agar views maydoni bo'lsa)
      sortOption = { views: -1, createdAt: -1 };
    }

    const newsList = await News.find(query).sort(sortOption);

    return NextResponse.json(
      {
        success: true,
        data: newsList,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Public News Fetch Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Serverda xatolik yuz berdi",
      },
      { status: 500 },
    );
  }
}
