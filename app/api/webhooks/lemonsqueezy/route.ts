import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Game from "@/models/game.model";
import Purchase from "@/models/purchase.model";
import User from "@/models/user.model";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // 1. Signature tekshirish — soxta so'rovlarni bloklaydi
  const signature = req.headers.get("x-signature") ?? "";
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(rawBody).digest("hex");

  const isValid =
    signature.length === digest.length &&
    crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const eventName = payload.meta?.event_name;

  await connectToDatabase();

  if (eventName === "order_created") {
    const order = payload.data.attributes;
    const orderId = payload.data.id;

    const gameId = payload.meta?.custom_data?.gameId;
    const buyerId = payload.meta?.custom_data?.buyerId;

    if (!gameId || !buyerId) {
      console.error(
        "Missing custom_data in webhook",
        payload.meta?.custom_data,
      );
      return NextResponse.json(
        { error: "Missing custom_data" },
        { status: 400 },
      );
    }

    const game = await Game.findById(gameId);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const totalAmount = order.total / 100; // sentdan dollarga
    const currency = order.currency;
    const commission = +(totalAmount * 0.2).toFixed(2);
    const developerShare = +(totalAmount * 0.8).toFixed(2);

    try {
      // Xuddi shu order ikki marta yozilmasligi uchun unique index himoya qiladi
      await Purchase.create({
        buyerId,
        gameId,
        developerId: game.developerId,
        lemonSqueezyOrderId: orderId,
        amount: totalAmount,
        currency,
        commission,
        developerShare,
        status: "paid",
      });

      // Developer balansini oshirish
      await User.findByIdAndUpdate(game.developerId, {
        $inc: { balance: developerShare },
      });

      // Xaridorning "sotib olingan o'yinlar" ro'yxatiga qo'shish
      await User.findByIdAndUpdate(buyerId, {
        $addToSet: { purchasedGames: gameId },
        $inc: { gamesCount: 1 },
      });
    } catch (err: unknown) {
      // Agar duplicate order kelsa (Lemon Squeezy webhookni qayta yuborishi mumkin)
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: number }).code === 11000
      ) {
        console.log("Duplicate order, ignoring:", orderId);
        return NextResponse.json({ received: true });
      }
      throw err;
    }
  }

  if (eventName === "order_refunded") {
    const orderId = payload.data.id;
    const purchase = await Purchase.findOneAndUpdate(
      { lemonSqueezyOrderId: orderId },
      { status: "refunded" },
    );

    if (purchase) {
      // Developer balansidan ayirib qo'yamiz
      await User.findByIdAndUpdate(purchase.developerId, {
        $inc: { balance: -purchase.developerShare },
      });

      // Xaridorning ro'yxatidan olib tashlaymiz
      await User.findByIdAndUpdate(purchase.buyerId, {
        $pull: { purchasedGames: purchase.gameId },
        $inc: { gamesCount: -1 },
      });
    }
  }

  return NextResponse.json({ received: true });
}
