/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Game from "@/models/game.model";
import Purchase from "@/models/purchase.model";
import User from "@/models/user.model";

function calculateAvailableAt(createdAt: Date) {
  const date = new Date(createdAt);

  // Lemon Squeezy: 13 kunlik hold
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

  // Bankka tushish uchun maksimal 5 kun
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
    // =========================================================
    // 1. RAW BODY + SIGNATURE
    // =========================================================

    const rawBody = await req.text();

    const signature = req.headers.get("x-signature") ?? "";

    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    if (!secret) {
      console.error("❌ LEMONSQUEEZY_WEBHOOK_SECRET topilmadi");

      return NextResponse.json(
        {
          error: "Webhook secret sozlanmagan",
        },
        { status: 500 },
      );
    }

    const digest = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const isValid =
      signature.length === digest.length &&
      crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));

    if (!isValid) {
      console.error("❌ Invalid Lemon Squeezy signature");

      return NextResponse.json(
        {
          error: "Invalid signature",
        },
        { status: 401 },
      );
    }

    // =========================================================
    // 2. PARSE PAYLOAD
    // =========================================================

    let payload: any;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON",
        },
        { status: 400 },
      );
    }

    const eventName = payload?.meta?.event_name;

    console.log("🍋 Lemon Squeezy event:", eventName);

    await connectToDatabase();

    // =========================================================
    // 3. ORDER CREATED
    // =========================================================

    if (eventName === "order_created") {
      const order = payload?.data?.attributes;
      const orderId = payload?.data?.id;

      if (!order || !orderId) {
        console.error("❌ Invalid order data");

        return NextResponse.json(
          {
            error: "Invalid order data",
          },
          { status: 400 },
        );
      }

      // Lemon Squeezy checkout_data.custom
      // webhookda meta.custom_data bo'lib keladi
      const customData = payload?.meta?.custom_data ?? {};

      const gameId = customData.gameId;
      const buyerId = customData.buyerId;

      console.log("🛒 ORDER CREATED:", {
        orderId,
        gameId,
        buyerId,
      });

      if (!gameId || !buyerId) {
        console.error("❌ Missing custom_data:", customData);

        return NextResponse.json(
          {
            error: "Missing gameId or buyerId",
          },
          { status: 400 },
        );
      }

      // =======================================================
      // GAME
      // =======================================================

      const game = await Game.findById(gameId);

      if (!game) {
        console.error("❌ Game not found:", gameId);

        return NextResponse.json(
          {
            error: "Game not found",
          },
          { status: 404 },
        );
      }

      // =======================================================
      // AMOUNT
      // =======================================================

      const totalAmount = Number(order.total) / 100;

      const currency = String(order.currency || "USD").toUpperCase();

      if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
        console.error("❌ Invalid order amount:", order.total);

        return NextResponse.json(
          {
            error: "Invalid order amount",
          },
          { status: 400 },
        );
      }

      // =======================================================
      // DEVELOPER EARNINGS
      // =======================================================

      const commission = +(totalAmount * 0.2).toFixed(2);

      const developerShare = +(totalAmount * 0.8).toFixed(2);

      // =======================================================
      // AVAILABLE DATE
      // =======================================================

      const createdAt = new Date();

      const availableAt = calculateAvailableAt(createdAt);

      // =======================================================
      // PURCHASE
      // =======================================================

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
      } catch (error) {
        // Lemon Squeezy bir xil webhookni qayta yuborsa
        if (isDuplicateError(error)) {
          console.log("⚠️ Duplicate order ignored:", orderId);

          return NextResponse.json({
            received: true,
            duplicate: true,
          });
        }

        throw error;
      }

      // =======================================================
      // DEVELOPER BALANCE
      // =======================================================

      await User.findByIdAndUpdate(game.developerId, {
        $inc: {
          pendingBalance: developerShare,
          totalEarnings: developerShare,
        },
      });

      // =======================================================
      // BUYER PURCHASED GAMES
      // =======================================================

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

        // Purchase yaratilgan, lekin buyer update bo'lmadi.
        // Webhook 500 qaytaradi, Lemon Squeezy qayta urinadi.
        return NextResponse.json(
          {
            error: "Buyer user not found",
          },
          { status: 500 },
        );
      }

      console.log("✅ PURCHASE SAVED:", {
        orderId: String(orderId),

        buyerId: buyerId.toString(),

        gameId: game._id.toString(),

        developerId: game.developerId.toString(),

        amount: totalAmount,

        developerShare,

        purchasedGames: updatedBuyer.purchasedGames,

        gamesCount: updatedBuyer.gamesCount,

        availableAt,
      });
    }

    // =========================================================
    // 4. ORDER REFUNDED
    // =========================================================

    if (eventName === "order_refunded") {
      const orderId = payload?.data?.id;

      if (!orderId) {
        return NextResponse.json(
          {
            error: "Missing order ID",
          },
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

      // =======================================================
      // AGAR PUL HALI PENDING BO'LSA
      // =======================================================

      if (!purchase.releasedAt) {
        await User.findByIdAndUpdate(purchase.developerId, {
          $inc: {
            pendingBalance: -purchase.developerShare,

            totalEarnings: -purchase.developerShare,
          },
        });
      }

      // =======================================================
      // AGAR PUL AVAILABLE BALANCE'GA CHIQQAN BO'LSA
      // =======================================================
      else {
        await User.findByIdAndUpdate(purchase.developerId, {
          $inc: {
            availableBalance: -purchase.developerShare,

            totalEarnings: -purchase.developerShare,
          },
        });
      }

      // =======================================================
      // BUYERDAN O'YINNI O'CHIRISH
      // =======================================================

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

    // =========================================================
    // 5. RESPONSE
    // =========================================================

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
      { status: 500 },
    );
  }
}
