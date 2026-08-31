/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongoose";
import { News } from "@/models/new.model";
import User from "@/models/user.model";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// .env dagi R2_ kalitlaringizga moslashtirilgan S3Client
const s3 = new S3Client({
  region: "auto",
  endpoint:
    process.env.R2_ENDPOINT ||
    `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true,
});

// Yangiliklar rasmlarini R2'dan o'chirish uchun yordamchi funksiya
async function deleteFromR2(fileKey: string) {
  try {
    let cleanKey = fileKey;
    if (fileKey.startsWith("http://") || fileKey.startsWith("https://")) {
      const urlObj = new URL(fileKey);
      cleanKey = decodeURIComponent(
        urlObj.pathname.startsWith("/")
          ? urlObj.pathname.slice(1)
          : urlObj.pathname,
      );
    } else {
      cleanKey = decodeURIComponent(fileKey);
    }

    cleanKey = cleanKey.replace(/^\/+/, "");

    // Agar key boshida bucket nomi chiqib qolsa tozalaymiz
    const bucketName = "midem-assets";
    if (cleanKey.startsWith(`${bucketName}/`)) {
      cleanKey = cleanKey.replace(`${bucketName}/`, "");
    }

    if (!cleanKey) return;

    console.log(`[R2 Deleting]: Bucket: ${bucketName}, Key: ${cleanKey}`);

    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: cleanKey,
      }),
    );
    console.log(`[R2 Success]: ${cleanKey} muvaffaqiyatli o'chirildi!`);
  } catch (err: any) {
    console.error(
      `[R2 Error] ${fileKey} o'chirishda xatolik:`,
      err.message || err,
    );
  }
}

export async function POST(req: Request) {
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
        { success: false, message: "MongoDB'dan mos foydalanuvchi topilmadi!" },
        { status: 404 },
      );
    }

    const body = await req.json();
    const { slug, selectedGame, visibility, request, translations } = body;

    if (!slug || !translations) {
      return NextResponse.json(
        { success: false, message: "Slug va matnlar majburiy!" },
        { status: 400 },
      );
    }

    const newNews = await News.create({
      slug,
      ...(selectedGame && { selectedGame }),
      authorId: new mongoose.Types.ObjectId(mongoUser._id),
      visibility: visibility || "public",
      request: request || "requested",
      translations,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Yangilik muvofaqqiyatli yaratildi!",
        data: newNews,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("API xatoligi:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Bu URL (slug) allaqachon mavjud." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Serverda xatolik yuz berdi",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
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

    const news = await News.find({
      authorId: new mongoose.Types.ObjectId(mongoUser._id),
    }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: news }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID ko'rsatilmagan!" },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Noto'g'ri formatdagi ID!" },
        { status: 400 },
      );
    }

    const newsItem = await News.findById(id);

    if (!newsItem) {
      return NextResponse.json(
        { success: false, message: "O'chiriladigan yangilik topilmadi!" },
        { status: 404 },
      );
    }

    const rawKeysToDelete: string[] = [];

    if (newsItem.translations) {
      const langs = Object.keys(newsItem.translations);
      langs.forEach((langKey) => {
        const langObj = newsItem.translations[langKey];
        if (langObj && Array.isArray(langObj.banners)) {
          langObj.banners.forEach((bannerUrl: string) => {
            if (bannerUrl) {
              rawKeysToDelete.push(bannerUrl);
            }
          });
        }
      });
    }

    const uniqueKeys = Array.from(new Set(rawKeysToDelete)).filter(Boolean);

    console.log("========================================");
    console.log(`[NEWS DELETE]: R2 dan topilgan rasmlar: ${uniqueKeys.length}`);
    console.log("Fayllar ro'yxati:", uniqueKeys);
    console.log("========================================");

    if (uniqueKeys.length > 0) {
      await Promise.all(uniqueKeys.map((file) => deleteFromR2(file)));
    }

    await News.findByIdAndDelete(id);

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
