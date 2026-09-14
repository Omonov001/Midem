import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, telegram, message } = await req.json();

    if (!name || !telegram || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "Barcha maydonlarni to'ldiring.",
        },
        { status: 400 },
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error("Telegram environment variables topilmadi.");

      return NextResponse.json(
        {
          success: false,
          message: "Server konfiguratsiyasida xatolik.",
        },
        { status: 500 },
      );
    }

    // MIDEM'ning rasmiy aloqa emaili
    const siteEmail = "maxkamovibrohimjon070@gmail.com";

    const text = [
      "🚀 Yangi xabar!",
      "",
      `👤 Ism: ${name}`,
      `📱 Telegram username: ${telegram}`,
      `📧 MIDEM Email: ${siteEmail}`,
      "",
      `📝 Xabar:`,
      message,
    ].join("\n");

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
        }),
      },
    );

    const data = await telegramResponse.json();

    if (!telegramResponse.ok || !data.ok) {
      console.error("Telegram API error:", data);

      return NextResponse.json(
        {
          success: false,
          message: "Telegramga yuborishda xatolik.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("CONTACT API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server xatosi.",
      },
      { status: 500 },
    );
  }
}
