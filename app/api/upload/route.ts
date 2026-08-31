import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/r2";
import crypto from "crypto"; // Node.js'ning o'zidagi xavfsiz ID generator

export async function POST(req: Request) {
  try {
    const { fileName, fileType } = await req.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "Fayl nomi va turi ko'rsatilmagan" },
        { status: 400 },
      );
    }

    const isImage = fileType.startsWith("image/");
    const bucketName = isImage ? "midem-assets" : "midem-games";
    const folderPath = isImage ? "images" : "games";

    // 💡 ENG XAVFSIZ YO'L: Unikal Random ID (UUID)
    const uniqueId = crypto.randomUUID();
    // Natija: "a1b2c3d4-e5f6-7890-1234-56789abcdef0-game.exe"
    const fileKey = `${folderPath}/${uniqueId}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 900 });

    return NextResponse.json({ uploadUrl, fileKey });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Yuklash havolasini yaratishda xatolik" },
      { status: 500 },
    );
  }
}
