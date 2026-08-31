import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/r2";

// MASALAN: NextAuth yoki Clerk ishlatayotgan bo'lsangiz sessiyani serverda tekshirasiz
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileName, gameId } = body;

    // 1. Fayl nomi borligini tekshirish
    if (!fileName) {
      return NextResponse.json(
        { error: "Fayl nomi kiritilmagan!" },
        { status: 400 },
      );
    }

    // 2. Bucket nomi mavjudligini tekshirish
    if (!process.env.R2_BUCKET_NAME) {
      console.error("R2_BUCKET_NAME env o'zgaruvchisi topilmadi!");
      return NextResponse.json(
        { error: "Server sozlamalarida xatolik!" },
        { status: 500 },
      );
    }

    /* ========================================================
      🔒 PRO MAX XAVFSIZLIK TEKSHIRUVI (SERVER-SIDE)
      ========================================================
      Klientdan kelayotgan 'userHasBought' va 'isPaid' ga ishonmang!
      Ushbu ma'lumotlarni bazadan (DB) yoki sessiyadan oling.
    */

    // A) Foydalanuvchi avtorizatsiyasini tekshirish (Masalan: NextAuth)
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json({ error: "Avval tizimga kiring!" }, { status: 401 });
    // }

    // B) Bazadan o'yin va foydalanuvchi xaridlarini tekshirish
    // const game = await db.game.findUnique({ where: { id: gameId } });
    // if (game?.isPaid) {
    //   const hasBought = await db.purchase.findFirst({
    //     where: { userId: session.user.id, gameId: game.id }
    //   });
    //   if (!hasBought) {
    //     return NextResponse.json(
    //       { error: "O'yinni yuklab olish uchun avval sotib oling!" },
    //       { status: 403 }
    //     );
    //   }
    // }

    // 3. R2 GetObject Buyrug'i
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      // Fayl yuklanganda to'g'ri nom bilan tushishi uchun (xohishga ko'ra):
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(fileName)}"`,
    });

    // 4. Presigned URL (Vaqtinchalik link - 5 minut amal qiladi)
    // Link muddati o'tgach, uni qayta ishlatib bo'lmaydi va fayl xavfsiz qoladi.
    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 300 });

    return NextResponse.json({ downloadUrl: signedUrl });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("R2 Download Error:", error?.message || error);
    return NextResponse.json(
      { error: "Havola yaratishda xatolik yuz berdi" },
      { status: 500 },
    );
  }
}
