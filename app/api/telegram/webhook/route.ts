import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import PayoutRequest from "@/models/payout-request.model";
import User from "@/models/user.model";

const token = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const callback = body.callback_query;

    if (!callback) {
      return NextResponse.json({ ok: true });
    }

    const data: string = callback.data;
    const messageId = callback.message.message_id;
    const chatId = callback.message.chat.id;

    await connectToDatabase();

    let resultText = "";

    if (data.startsWith("paid_")) {
      const requestId = data.replace("paid_", "");
      const payoutRequest = await PayoutRequest.findById(requestId);

      if (payoutRequest && payoutRequest.status === "pending") {
        payoutRequest.status = "paid";
        await payoutRequest.save();
        resultText = `✅ To'landi — $${payoutRequest.amount}`;
      } else {
        resultText = "⚠️ Bu so'rov allaqachon qayta ishlangan.";
      }
    }

    if (data.startsWith("reject_")) {
      const requestId = data.replace("reject_", "");
      const payoutRequest = await PayoutRequest.findById(requestId);

      if (payoutRequest && payoutRequest.status === "pending") {
        payoutRequest.status = "rejected";
        await payoutRequest.save();

        // Pulni balansga qaytaramiz
        await User.findByIdAndUpdate(payoutRequest.developerId, {
          $inc: { balance: payoutRequest.amount },
        });

        resultText = `❌ Rad etildi — pul balansga qaytarildi`;
      } else {
        resultText = "⚠️ Bu so'rov allaqachon qayta ishlangan.";
      }
    }

    // Xabarni yangilaymiz (tugmalarni olib tashlab, natijani ko'rsatamiz)
    await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: `${callback.message.text}\n\n${resultText}`,
      }),
    });

    // Telegramga "qabul qildim" deb javob beramiz
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callback.id }),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ ok: true });
  }
}
