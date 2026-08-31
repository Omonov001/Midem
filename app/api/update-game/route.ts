import { NextResponse } from "next/server";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/r2";

export async function POST(req: Request) {
  try {
    const { oldFileKey, newFileName, fileType } = await req.json();

    // Fayl nomiga timestamp qo'shib unikal qilamiz (keshlash muammosi bo'lmasligi uchun)
    const uniqueFileName = `${Date.now()}-${newFileName}`;
    const newFileKey = `games/${uniqueFileName}`;

    // 1. Agar eski fayl mavjud bo'lsa, R2 dan o'chiramiz
    if (oldFileKey && oldFileKey !== newFileKey) {
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: oldFileKey,
        });
        await r2.send(deleteCommand);
      } catch (err) {
        console.warn(
          "Eski faylni o'chirishda xatolik (o'tkazib yuborildi):",
          err,
        );
      }
    }

    // 2. Yangi fayl uchun PutObject buyrug'i
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: newFileKey,
      ContentType: fileType,
    });

    // 15 daqiqalik xavfsiz URL yaratamiz
    const uploadUrl = await getSignedUrl(r2, uploadCommand, { expiresIn: 900 });

    return NextResponse.json({ uploadUrl, newFileKey });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "O'yinni yangilashda xatolik yuz berdi" },
      { status: 500 },
    );
  }
}
