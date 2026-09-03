import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/models/user.model";
import PayoutRequest from "@/models/payout-request.model";

const MIN_PAYOUT = 20;

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { message: "Tizimga kirmagansiz!" },
        { status: 401 },
      );
    }

    const { cardNumber, cardholderName } = await req.json();

    if (!cardNumber || !cardholderName) {
      return NextResponse.json(
        { message: "Karta malumotlari toliq emas!" },
        { status: 400 },
      );
    }

    const cleanCardNumber = String(cardNumber).replace(/\D/g, "");
    if (!/^\d{16}$/.test(cleanCardNumber)) {
      return NextResponse.json(
        { message: "Karta raqami 16 xonali bolishi kerak!" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const dbUser = await User.findOne({ clerkId: clerkUser.id });
    if (!dbUser) {
      return NextResponse.json(
        { message: "Foydalanuvchi topilmadi!" },
        { status: 404 },
      );
    }

    if (dbUser.balance < MIN_PAYOUT) {
      return NextResponse.json(
        { message: `Minimal yechish summasi $${MIN_PAYOUT}!` },
        { status: 400 },
      );
    }

    const amount = dbUser.balance;

    // Balansni darhol "band" qilamiz (qayta-qayta so'rov yubormasligi uchun)
    dbUser.balance = 0;
    await dbUser.save();

    const payoutRequest = await PayoutRequest.create({
      developerId: dbUser._id,
      amount,
      status: "pending",
    });

    // Telegramga yuboramiz
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const text =
      `💸 *Yangi Payout So'rovi*\n\n` +
      `👤 Developer: ${dbUser.name}\n` +
      `📧 Email: ${dbUser.email}\n` +
      `💰 Summa: $${amount}\n\n` +
      `💳 Karta: \`${cleanCardNumber}\`\n` +
      `🧑 Egasi: ${cardholderName}\n\n` +
      `🆔 So'rov ID: ${payoutRequest._id}`;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✅ To'landi",
                callback_data: `paid_${payoutRequest._id}`,
              },
              {
                text: "❌ Rad etish",
                callback_data: `reject_${payoutRequest._id}`,
              },
            ],
          ],
        },
      }),
    });

    return NextResponse.json(
      { success: true, message: "Sorov yuborildi!" },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Payout Request Error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Xatolik yuz berdi" },
      { status: 500 },
    );
  }
}
