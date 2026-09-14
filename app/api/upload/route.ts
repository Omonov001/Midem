import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/r2";
import crypto from "crypto";

// ============================================================
// LIMITS
// ============================================================

const MAX_GAME_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB
const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20 MB

// ============================================================
// POST /api/upload
// ============================================================

export async function POST(req: Request) {
  try {
    const { fileName, fileType, fileSize } = await req.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "Fayl nomi va turi ko'rsatilmagan" },
        { status: 400 },
      );
    }

    // ========================================================
    // FILE SIZE CHECK
    // ========================================================

    if (typeof fileSize !== "number" || fileSize <= 0) {
      return NextResponse.json(
        { error: "Fayl hajmi noto'g'ri ko'rsatilgan" },
        { status: 400 },
      );
    }

    const isImage = fileType.startsWith("image/");

    // ========================================================
    // IMAGE LIMIT — 20 MB
    // ========================================================

    if (isImage && fileSize > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Rasm maksimal 20 MB bo'lishi mumkin" },
        { status: 413 },
      );
    }

    // ========================================================
    // GAME LIMIT — 5 GB
    // ========================================================

    if (!isImage && fileSize > MAX_GAME_SIZE) {
      return NextResponse.json(
        { error: "Game maksimal 5 GB bo'lishi mumkin" },
        { status: 413 },
      );
    }

    // ========================================================
    // BUCKET
    // ========================================================

    const bucketName = isImage ? "midem-assets" : "midem-games";
    const folderPath = isImage ? "images" : "games";

    // ========================================================
    // UNIQUE FILE ID
    // ========================================================

    const uniqueId = crypto.randomUUID();

    const fileKey = `${folderPath}/${uniqueId}-${fileName}`;

    // ========================================================
    // R2 COMMAND
    // ========================================================

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: fileType,
      ContentLength: fileSize,
    });

    // ========================================================
    // SIGNED URL
    // ========================================================

    const uploadUrl = await getSignedUrl(r2, command, {
      expiresIn: 900,
    });

    // ========================================================
    // RESPONSE
    // ========================================================

    return NextResponse.json({
      uploadUrl,
      fileKey,
      maxSize: isImage ? MAX_IMAGE_SIZE : MAX_GAME_SIZE,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      { error: "Yuklash havolasini yaratishda xatolik" },
      { status: 500 },
    );
  }
}
