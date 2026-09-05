import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/models/user.model";
import Payout from "@/models/payout.model";

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

    const { cardNumber, cardholderName, cardExpiry, country } =
      await req.json();

    if (!cardNumber || !cardholderName || !country) {
      return NextResponse.json(
        { message: "Karta ma'lumotlari to'liq emas!" },
        { status: 400 },
      );
    }

    const cleanCardNumber = String(cardNumber).replace(/\D/g, "");

    if (!/^\d{16}$/.test(cleanCardNumber)) {
      return NextResponse.json(
        { message: "Karta raqami 16 xonali bo'lishi kerak!" },
        { status: 400 },
      );
    }

    if (country !== "UZ" && !/^\d{2}\/\d{2}$/.test(cardExpiry || "")) {
      return NextResponse.json(
        {
          message: "Xalqaro kartalar uchun amal qilish muddati kerak!",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const dbUser = await User.findOne({
      clerkId: clerkUser.id,
    });

    if (!dbUser) {
      return NextResponse.json(
        { message: "Foydalanuvchi topilmadi!" },
        { status: 404 },
      );
    }

    // Faqat AVAILABLE balans yechiladi
    if (dbUser.availableBalance < MIN_PAYOUT) {
      return NextResponse.json(
        {
          message: `Minimal yechish summasi $${MIN_PAYOUT}!`,
        },
        { status: 400 },
      );
    }

    const amount = dbUser.availableBalance;

    // Balansni atomik ravishda kamaytirish
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: dbUser._id,
        availableBalance: { $gte: MIN_PAYOUT },
      },
      {
        $inc: {
          availableBalance: -amount,
        },
      },
      {
        new: true,
      },
    );

    if (!updatedUser) {
      return NextResponse.json(
        {
          message: "Balans o'zgargan. Iltimos, qaytadan urinib ko'ring.",
        },
        { status: 409 },
      );
    }

    // Payout yaratish
    const payout = await Payout.create({
      userId: dbUser._id,
      amount,
      currency: "USD",
      status: "pending",
      method: "card",
      requestedAt: new Date(),
    });

    // Telegram
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (token && chatId) {
      // Xavfsizlik uchun to'liq karta raqamini Telegramga yubormaymiz
      const maskedCard = `**** **** **** ${cleanCardNumber.slice(-4)}`;

      const text =
        `💸 *Yangi Payout So'rovi*\n\n` +
        `👤 Developer: ${dbUser.name}\n` +
        `📧 Email: ${dbUser.email}\n` +
        `💰 Summa: $${amount.toFixed(2)}\n\n` +
        `🌍 Davlat: ${country === "UZ" ? "O'zbekiston" : "Xalqaro"}\n` +
        `💳 Karta: \`${maskedCard}\`\n` +
        (cardExpiry ? `📅 Muddat: ${cardExpiry}\n` : "") +
        `🧑 Egasi: ${cardholderName}\n\n` +
        `🆔 Payout ID: ${payout._id}`;

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✅ To'landi",
                  callback_data: `paid_${payout._id}`,
                },
                {
                  text: "❌ Rad etish",
                  callback_data: `reject_${payout._id}`,
                },
              ],
            ],
          },
        }),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payout so'rovi yuborildi!",
        payoutId: payout._id,
        amount,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Payout Request Error:", error);

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Xatolik yuz berdi",
      },
      { status: 500 },
    );
  }
}
