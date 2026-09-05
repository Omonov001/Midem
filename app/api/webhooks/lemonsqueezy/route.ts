import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Game from "@/models/game.model";
import Purchase from "@/models/purchase.model";
import User from "@/models/user.model";

function calculateAvailableAt(createdAt: Date) {
  const date = new Date(createdAt);

  // Lemon Squeezy hold: 13 kun
  date.setDate(date.getDate() + 13);

  const day = date.getDate();

  // Keyingi payout availability:
  // 14 yoki 28
  if (day <= 14) {
    date.setDate(14);
  } else if (day <= 28) {
    date.setDate(28);
  } else {
    date.setMonth(date.getMonth() + 1);
    date.setDate(14);
  }

  // Bank payout uchun taxminiy 5 kun
  date.setDate(date.getDate() + 5);

  return date;
}

function isDuplicateError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // =========================
    // 1. SIGNATURE
    // =========================

    const signature = req.headers.get("x-signature") ?? "";
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    if (!secret) {
      console.error("❌ LEMONSQUEEZY_WEBHOOK_SECRET topilmadi");

      return NextResponse.json(
        { error: "Webhook secret sozlanmagan" },
        { status: 500 },
      );
    }

    const hmac = crypto.createHmac("sha256", secret);
    const digest = hmac.update(rawBody).digest("hex");

    const isValid =
      signature.length === digest.length &&
      crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));

    if (!isValid) {
      console.error("❌ Invalid signature");

      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // =========================
    // 2. PARSE WEBHOOK
    // =========================

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let payload: any;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const eventName = payload.meta?.event_name;

    console.log("🍋 Lemon Squeezy event:", eventName);

    await connectToDatabase();

    // =========================================================
    // ORDER CREATED
    // =========================================================

    if (eventName === "order_created") {
      const order = payload.data?.attributes;
      const orderId = payload.data?.id;

      if (!order || !orderId) {
        console.error("❌ Invalid order data");

        return NextResponse.json(
          { error: "Invalid order data" },
          { status: 400 },
        );
      }

      // Lemon Squeezy custom data
      const gameId = payload.meta?.custom_data?.gameId;
      const buyerId = payload.meta?.custom_data?.buyerId;

      console.log("🛒 ORDER CREATED:", {
        orderId,
        gameId,
        buyerId,
      });

      if (!gameId || !buyerId) {
        console.error("❌ Missing custom_data:", payload.meta?.custom_data);

        return NextResponse.json(
          { error: "Missing custom_data" },
          { status: 400 },
        );
      }

      // =========================
      // GAME
      // =========================

      const game = await Game.findById(gameId);

      if (!game) {
        console.error("❌ Game not found:", gameId);

        return NextResponse.json({ error: "Game not found" }, { status: 404 });
      }

      // =========================
      // AMOUNT
      // =========================

      // Eski ishlagan koddagi kabi.
      const totalAmount = Number(order.total) / 100;

      const currency = String(order.currency || "USD").toUpperCase();

      if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
        console.error("❌ Invalid order amount:", order.total);

        return NextResponse.json(
          { error: "Invalid order amount" },
          { status: 400 },
        );
      }

      // =========================
      // COMMISSION
      // =========================

      const commission = +(totalAmount * 0.2).toFixed(2);

      const developerShare = +(totalAmount * 0.8).toFixed(2);

      // =========================
      // AVAILABLE DATE
      // =========================

      const createdAt = new Date();

      const availableAt = calculateAvailableAt(createdAt);

      // =========================
      // PURCHASE
      // =========================

      try {
        await Purchase.create({
          buyerId,
          gameId,
          developerId: game.developerId,

          lemonSqueezyOrderId: String(orderId),

          amount: totalAmount,
          currency,

          commission,
          developerShare,

          status: "paid",

          availableAt,

          releasedAt: null,
        });

        console.log("✅ PURCHASE CREATED:", {
          orderId: String(orderId),
          buyerId,
          gameId,
          developerId: String(game.developerId),
          amount: totalAmount,
          developerShare,
          availableAt,
        });
      } catch (error) {
        // Lemon Squeezy webhookni qayta yuborishi mumkin
        if (isDuplicateError(error)) {
          console.log("⚠️ Duplicate order ignored:", orderId);

          return NextResponse.json({
            received: true,
            duplicate: true,
          });
        }

        throw error;
      }

      // =========================
      // DEVELOPER BALANCE
      // =========================

      await User.findByIdAndUpdate(game.developerId, {
        $inc: {
          pendingBalance: developerShare,
          totalEarnings: developerShare,
        },
      });

      console.log("💰 Developer pending balance updated");

      // =========================
      // BUYER PURCHASED GAMES
      // =========================

      const updatedBuyer = await User.findByIdAndUpdate(
        buyerId,
        {
          $addToSet: {
            purchasedGames: game._id,
          },

          $inc: {
            gamesCount: 1,
          },
        },
        {
          new: true,
        },
      );

      if (!updatedBuyer) {
        console.error("❌ Buyer User topilmadi:", buyerId);

        return NextResponse.json(
          { error: "Buyer user not found" },
          { status: 500 },
        );
      }

      console.log("🎮 GAME ADDED TO BUYER:", {
        buyerId,
        gameId: game._id.toString(),
      });
    }

    // =========================================================
    // ORDER REFUNDED
    // =========================================================

    if (eventName === "order_refunded") {
      const orderId = payload.data?.id;

      if (!orderId) {
        return NextResponse.json(
          { error: "Missing order ID" },
          { status: 400 },
        );
      }

      const purchase = await Purchase.findOneAndUpdate(
        {
          lemonSqueezyOrderId: String(orderId),
          status: "paid",
        },
        {
          $set: {
            status: "refunded",
          },
        },
        {
          new: true,
        },
      );

      if (!purchase) {
        console.log("⚠️ Refund uchun Purchase topilmadi:", orderId);

        return NextResponse.json({
          received: true,
        });
      }

      // =========================
      // DEVELOPER BALANCE
      // =========================

      if (!purchase.releasedAt) {
        // Hali availableBalance ga o'tmagan
        await User.findByIdAndUpdate(purchase.developerId, {
          $inc: {
            pendingBalance: -purchase.developerShare,

            totalEarnings: -purchase.developerShare,
          },
        });
      } else {
        // Already available balance ga o'tgan
        await User.findByIdAndUpdate(purchase.developerId, {
          $inc: {
            availableBalance: -purchase.developerShare,

            totalEarnings: -purchase.developerShare,
          },
        });
      }

      // =========================
      // BUYER
      // =========================

      await User.findByIdAndUpdate(purchase.buyerId, {
        $pull: {
          purchasedGames: purchase.gameId,
        },

        $inc: {
          gamesCount: -1,
        },
      });

      console.log("🔄 REFUND PROCESSED:", {
        orderId: String(orderId),
        purchaseId: purchase._id.toString(),
        buyerId: purchase.buyerId.toString(),
        gameId: purchase.gameId.toString(),
        developerShare: purchase.developerShare,
        wasReleased: Boolean(purchase.releasedAt),
      });
    }

    // =========================
    // DONE
    // =========================

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error("❌ Lemon Squeezy Webhook Error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Webhook processing failed",
      },
      {
        status: 500,
      },
    );
  }
}
