/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectToDatabase } from "@/lib/mongoose";
import Game from "@/models/game.model";
import User from "@/models/user.model";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// 🛠️ Cloudflare R2 Client
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

function extractR2Key(fileUrlOrKey: string): string {
  if (!fileUrlOrKey || typeof fileUrlOrKey !== "string") return "";

  let key = fileUrlOrKey.trim();

  if (key.startsWith("http://") || key.startsWith("https://")) {
    try {
      const parsedUrl = new URL(key);
      key = parsedUrl.pathname;
    } catch {
      // ignore
    }
  }

  key = key.replace(/^\/+/, "");

  return decodeURIComponent(key);
}

async function deleteFromR2(fileKey: string) {
  const key = extractR2Key(fileKey);
  if (!key) return;

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

    // Foydalanuvchi ushbu o'yinni sotib olganini tekshiramiz
    let userHasBought = false;

    const clerkUser = await currentUser();
    if (clerkUser) {
      const dbUser = await User.findOne({ clerkId: clerkUser.id })
        .select("purchasedGames")
        .lean();

      if (dbUser) {
        userHasBought =
          (dbUser as any).purchasedGames?.some(
            (id: any) => id.toString() === (game as any)._id.toString(),
          ) || false;
      }
    }

    return NextResponse.json({ ...game, userHasBought });
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

    const updatedData = {
      ...body,
      request: "requested",
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

    const game = await Game.findOne({ slug });

    if (!game) {
      return NextResponse.json(
        { error: "O'yin bazadan topilmadi!" },
        { status: 404 },
      );
    }

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

    const rawKeysToDelete: string[] = [];

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

    const uniqueKeys = Array.from(new Set(rawKeysToDelete)).filter(Boolean);

    console.log("========================================");
    console.log(
      `[DELETE PROCESS]: Topilgan fayllar soni: ${uniqueKeys.length}`,
    );
    console.log("Fayllar ro'yxati:", uniqueKeys);
    console.log("========================================");

    if (uniqueKeys.length > 0) {
      await Promise.all(uniqueKeys.map((file) => deleteFromR2(file)));
    }

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
