import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Game from "@/models/game.model";
import Purchase from "@/models/purchase.model";
import User from "@/models/user.model";

function calculateAvailableAt(createdAt: Date) {
  const date = new Date(createdAt);

  // Lemon Squeezy 13 kunlik hold
  date.setDate(date.getDate() + 13);

  // Keyingi payout sanasi: 14 yoki 28
  const day = date.getDate();

  if (day <= 14) {
    date.setDate(14);
  } else if (day <= 28) {
    date.setDate(28);
  } else {
    date.setMonth(date.getMonth() + 1);
    date.setDate(14);
  }

  // Payoutdan keyin bankka kelishi uchun maksimal 5 kun
  date.setDate(date.getDate() + 5);

  return date;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Signature tekshirish
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

  // =========================================================
  // ORDER CREATED
  // =========================================================

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

    const totalAmount = order.total / 100;
    const currency = order.currency;

    const commission = +(totalAmount * 0.2).toFixed(2);
    const developerShare = +(totalAmount * 0.8).toFixed(2);

    const createdAt = new Date();
    const availableAt = calculateAvailableAt(createdAt);

    try {
      // Purchase yaratish
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
        availableAt,
      });

      // Developer earnings
      // Hali available emas -> pending
      await User.findByIdAndUpdate(game.developerId, {
        $inc: {
          pendingBalance: developerShare,
          totalEarnings: developerShare,
        },
      });

      // Xaridorning sotib olingan o'yinlariga qo'shish
      await User.findByIdAndUpdate(buyerId, {
        $addToSet: {
          purchasedGames: gameId,
        },
        $inc: {
          gamesCount: 1,
        },
      });
    } catch (err: unknown) {
      // Duplicate webhook
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: number }).code === 11000
      ) {
        console.log("Duplicate order, ignoring:", orderId);

        return NextResponse.json({
          received: true,
        });
      }

      console.error("Webhook order_created error:", err);

      return NextResponse.json(
        { error: "Webhook processing failed" },
        { status: 500 },
      );
    }
  }

  // =========================================================
  // ORDER REFUNDED
  // =========================================================

  if (eventName === "order_refunded") {
    const orderId = payload.data.id;

    const purchase = await Purchase.findOneAndUpdate(
      {
        lemonSqueezyOrderId: orderId,
        status: "paid",
      },
      {
        status: "refunded",
      },
    );

    if (purchase) {
      await User.findByIdAndUpdate(purchase.developerId, {
        $inc: {
          pendingBalance: -purchase.developerShare,
          totalEarnings: -purchase.developerShare,
        },
      });

      await User.findByIdAndUpdate(purchase.buyerId, {
        $pull: {
          purchasedGames: purchase.gameId,
        },
        $inc: {
          gamesCount: -1,
        },
      });
    }
  }

  return NextResponse.json({
    received: true,
  });
}
