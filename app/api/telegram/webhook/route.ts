import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Payout from "@/models/payout.model";
import User from "@/models/user.model";

const token = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const callback = body.callback_query;

    if (!callback) {
      return NextResponse.json({ ok: true });
    }

    const data: string = callback.data || "";
    const messageId = callback.message?.message_id;
    const chatId = callback.message?.chat?.id;

    await connectToDatabase();

    let resultText = "";

    // =========================
    // ✅ PAYOUT TO'LANDI
    // =========================
    if (data.startsWith("paid_")) {
      const payoutId = data.replace("paid_", "");

      const payout = await Payout.findOneAndUpdate(
        {
          _id: payoutId,
          status: "pending",
        },
        {
          $set: {
            status: "paid",
            processedAt: new Date(),
            paidAt: new Date(),
          },
        },
        {
          new: true,
        },
      );

      if (payout) {
        resultText = `✅ To'landi — $${payout.amount.toFixed(2)}`;
      } else {
        resultText = "⚠️ Bu payout allaqachon qayta ishlangan yoki topilmadi.";
      }
    }

    // =========================
    // ❌ PAYOUT RAD ETILDI
    // =========================
    if (data.startsWith("reject_")) {
      const payoutId = data.replace("reject_", "");

      // Faqat pending payout rad qilinadi.
      // Shuning uchun ikki marta bosilsa pul ikki marta qaytmaydi.
      const payout = await Payout.findOneAndUpdate(
        {
          _id: payoutId,
          status: "pending",
        },
        {
          $set: {
            status: "failed",
            processedAt: new Date(),
            failureReason: "Admin tomonidan rad etildi",
          },
        },
        {
          new: true,
        },
      );

      if (payout) {
        // Pul developerning AVAILABLE balansiga qaytariladi.
        await User.findByIdAndUpdate(payout.userId, {
          $inc: {
            availableBalance: payout.amount,
          },
        });

        resultText =
          `❌ Rad etildi — $${payout.amount.toFixed(2)} ` +
          `balansga qaytarildi.`;
      } else {
        resultText = "⚠️ Bu payout allaqachon qayta ishlangan yoki topilmadi.";
      }
    }

    // =========================
    // TELEGRAM MESSAGE UPDATE
    // =========================
    if (token && messageId && chatId) {
      const originalText = callback.message?.text || "Payout so'rovi";

      await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text: `${originalText}\n\n${resultText}`,
        }),
      });

      // Tugmalarni olib tashlaymiz
      // editMessageText reply_markup yuborilmasa,
      // ayrim holatlarda eski keyboard qolishi mumkin.
      await fetch(
        `https://api.telegram.org/bot${token}/editMessageReplyMarkup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [],
            },
          }),
        },
      );

      // Telegram callback loading holatini yopamiz
      await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          callback_query_id: callback.id,
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram Webhook Error:", error);

    // Telegram webhook xato bo'lsa ham 200 qaytargani yaxshi,
    // aks holda Telegram qayta-qayta yuborishi mumkin.
    return NextResponse.json({ ok: true });
  }
}
