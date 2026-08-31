/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectToDatabase } from "@/lib/mongoose";
import Game from "@/models/game.model";
import User from "@/models/user.model";
import { NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// 🛠️ Cloudflare R2 Client
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  forcePathStyle: true, // AWS domenlariga adashib ulanmasligi uchun
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

/**
 * 🛠️ URL yoki Key ichidan R2 fayl yo'lini toza ajratib beruvchi funksiya
 * JPG, PNG, SVG, WEBP — barchasini o'z holicha saqlab qoladi!
 */
function extractR2Key(fileUrlOrKey: string): string {
  if (!fileUrlOrKey || typeof fileUrlOrKey !== "string") return "";

  let key = fileUrlOrKey.trim();

  // 1. Agar to'liq URL bo'lsa (https://pub-xxx.r2.dev/images/avatar.png)
  if (key.startsWith("http://") || key.startsWith("https://")) {
    try {
      const parsedUrl = new URL(key);
      key = parsedUrl.pathname; // "/images/avatar.png"
    } catch {
      // ignore
    }
  }

  // 2. Boshidagi ortiqcha "/" belgilarni tozalaymiz ("images/avatar.png")
  key = key.replace(/^\/+/, "");

  return decodeURIComponent(key);
}

/**
 * 🗑️ R2 Bucket'dan faylni tegishli bucket nomiga qarab o'chirish
 */
async function deleteFromR2(fileKey: string) {
  const key = extractR2Key(fileKey);
  if (!key) return;

  // 🎯 Bucket'ni avtomatik aniqlaymiz:
  // "images/" bilan boshlansa -> midem-assets
  // Aks holda ("games/") -> midem-games
  const targetBucket = key.startsWith("images/")
    ? "midem-assets"
    : "midem-games";

  console.log(`[R2 REQ]: Bucket: "${targetBucket}" | Key: "${key}"`);

  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: targetBucket,
        Key: key,
      }),
    );
    console.log(
      `✅ [R2 OK]: Muvaffaqiyatli o'chirildi ("${targetBucket}") -> "${key}"`,
    );
  } catch (err) {
    console.error(`❌ [R2 ERROR]: O'chirishda xatolik ("${key}"):`, err);
  }
}

// 🟢 GET METODI
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } },
) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    // `.lean()` qo'shildi — Mongoose Map va Schema modellarini oddiy JS ob'ektiga o'giradi
    const game = await Game.findOne({ slug: slug })
      .populate({
        path: "developerId",
        model: User,
        select: "username name email _id",
      })
      .lean();

    if (!game) {
      return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error("GET Game Error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

// 🟡 PUT METODI
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } },
) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const body = await request.json();

    // 🔄 Tahrirlanganda statusni majburiy ravishda "requested" ga o'zgartiramiz
    const updatedData = {
      ...body,
      request: "requested", // Admin qaytadan tekshirishi uchun status yangilanadi
    };

    const updatedGame = await Game.findOneAndUpdate(
      { slug: slug },
      { $set: updatedData },
      { new: true, runValidators: true },
    );

    if (!updatedGame) {
      return NextResponse.json(
        { error: "O'yin topilmadi va yangilanmadi" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "O'yin muvaffaqiyatli yangilandi va tekshiruvga yuborildi",
      game: updatedGame,
    });
  } catch (error) {
    console.error("PUT Game Error:", error);
    return NextResponse.json(
      { error: "O'yinni saqlashda server xatosi yuz berdi" },
      { status: 500 },
    );
  }
}

// 🔴 DELETE METODI
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } },
) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    const body = await request.json();
    const { confirmTitle } = body;

    // 1. O'yinni bazadan izlaymiz
    const game = await Game.findOne({ slug });

    if (!game) {
      return NextResponse.json(
        { error: "O'yin bazadan topilmadi!" },
        { status: 404 },
      );
    }

    // 🛡️ 2. XAVFSIZLIK TEKSHIRUVI
    const titles = [
      slug,
      game.langData?.uz?.title,
      game.langData?.ru?.title,
      game.langData?.en?.title,
      game.langData?.tr?.title,
    ].filter(Boolean);

    if (!titles.includes(confirmTitle)) {
      return NextResponse.json(
        { error: "Kiritilgan o'yin nomi mos kelmadi. O'chirish rad etildi!" },
        { status: 400 },
      );
    }

    // 🔍 3. R2 FAYLLARINI YIG'ISH (barcha formatlar)
    const rawKeysToDelete: string[] = [];

    // A) LangData ichidagi Rasmlar (.jpg, .png, .svg va h.k.)
    if (game.langData) {
      const langs = ["uz", "ru", "en", "tr"] as const;
      langs.forEach((langKey) => {
        const langObj = game.langData[langKey];
        if (langObj) {
          if (langObj.iconPreview) {
            rawKeysToDelete.push(langObj.iconPreview);
          }
          if (Array.isArray(langObj.screenshotPreviews)) {
            langObj.screenshotPreviews.forEach((img: string) => {
              if (img) rawKeysToDelete.push(img);
            });
          }
        }
      });
    }

    // B) OSDetails ichidagi O'yin fayllari
    if (game.osDetails) {
      const osDetailsObj =
        game.osDetails instanceof Map
          ? Object.fromEntries(game.osDetails)
          : game.osDetails;

      Object.values(osDetailsObj).forEach((detail: any) => {
        if (detail?.fileName) {
          rawKeysToDelete.push(detail.fileName);
        }
      });
    }

    // Takroriy yoki bo'sh fayllarni olib tashlaymiz
    const uniqueKeys = Array.from(new Set(rawKeysToDelete)).filter(Boolean);

    console.log("========================================");
    console.log(
      `[DELETE PROCESS]: Topilgan fayllar soni: ${uniqueKeys.length}`,
    );
    console.log("Fayllar ro'yxati:", uniqueKeys);
    console.log("========================================");

    // 🗑️ 4. CLOUDFLARE R2 DAGI FAYLLARNI O'CHIRISH
    if (uniqueKeys.length > 0) {
      await Promise.all(uniqueKeys.map((file) => deleteFromR2(file)));
    }

    // 🗑️ 5. MONGODB DAN BUTUNLAY O'CHIRISH
    await Game.deleteOne({ _id: game._id });

    return NextResponse.json(
      { message: "O'yin va barcha bog'liq fayllar muvaffaqiyatli o'chirildi!" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("DELETE Game Error:", error);
    return NextResponse.json(
      { error: error.message || "Serverda xatolik yuz berdi" },
      { status: 500 },
    );
  }
}
