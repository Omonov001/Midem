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
    // RAW BODY
    // =========================================================

    const rawBody = await req.text();

    // =========================================================
    // SIGNATURE TEKSHIRISH
    // =========================================================

    const signature = req.headers.get("x-signature") ?? "";

    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    if (!secret) {
      console.error("LEMONSQUEEZY_WEBHOOK_SECRET topilmadi");

      return NextResponse.json(
        {
          error: "Webhook secret sozlanmagan",
        },
        { status: 500 },
      );
    }

    const hmac = crypto.createHmac("sha256", secret);

    const digest = hmac.update(rawBody).digest("hex");

    const isValid =
      signature.length === digest.length &&
      crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));

    if (!isValid) {
      return NextResponse.json(
        {
          error: "Invalid signature",
        },
        { status: 401 },
      );
    }

    // =========================================================
    // PAYLOAD
    // =========================================================

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // ORDER CREATED
    // =========================================================

    if (eventName === "order_created") {
      const order = payload?.data?.attributes;

      const orderId = payload?.data?.id;

      if (!order || !orderId) {
        return NextResponse.json(
          {
            error: "Invalid order data",
          },
          { status: 400 },
        );
      }

      // -------------------------------------------------------
      // CUSTOM DATA
      // -------------------------------------------------------

      const customData = payload?.meta?.custom_data ?? {};

      const gameId = customData.gameId;

      const buyerId = customData.buyerId;

      console.log("🛒 PURCHASE WEBHOOK:", {
        orderId,
        gameId,
        buyerId,
      });

      if (!gameId || !buyerId) {
        console.error("Missing custom_data:", customData);

        return NextResponse.json(
          {
            error: "Missing gameId or buyerId",
          },
          { status: 400 },
        );
      }

      // -------------------------------------------------------
      // GAME
      // -------------------------------------------------------

      const game = await Game.findById(gameId);

      if (!game) {
        console.error("Game not found:", gameId);

        return NextResponse.json(
          {
            error: "Game not found",
          },
          { status: 404 },
        );
      }

      // -------------------------------------------------------
      // BUYER
      // -------------------------------------------------------

      const buyer = await User.findById(buyerId);

      if (!buyer) {
        console.error("Buyer not found:", buyerId);

        return NextResponse.json(
          {
            error: "Buyer not found",
          },
          { status: 404 },
        );
      }

      // -------------------------------------------------------
      // DEVELOPER
      // -------------------------------------------------------

      const developer = await User.findById(game.developerId);

      if (!developer) {
        console.error("Developer not found:", game.developerId);

        return NextResponse.json(
          {
            error: "Developer not found",
          },
          { status: 404 },
        );
      }

      // -------------------------------------------------------
      // AMOUNT
      // -------------------------------------------------------

      const totalAmount = Number(order.total) / 100;

      const currency = String(order.currency || "USD").toUpperCase();

      if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
        console.error("Invalid order amount:", order.total);

        return NextResponse.json(
          {
            error: "Invalid order amount",
          },
          { status: 400 },
        );
      }

      // MIDEM 20%
      const commission = +(totalAmount * 0.2).toFixed(2);

      // Developer 80%
      const developerShare = +(totalAmount * 0.8).toFixed(2);

      // -------------------------------------------------------
      // AVAILABLE AT
      // -------------------------------------------------------

      const createdAt = new Date();

      const availableAt = calculateAvailableAt(createdAt);

      // -------------------------------------------------------
      // PURCHASE CREATE
      // -------------------------------------------------------

      try {
        await Purchase.create({
          buyerId: buyer._id,
          gameId: game._id,
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
        // -----------------------------------------------
        // DUPLICATE WEBHOOK
        // -----------------------------------------------

        if (isDuplicateError(error)) {
          console.log("⚠️ Duplicate order ignored:", orderId);

          return NextResponse.json({
            received: true,
            duplicate: true,
          });
        }

        throw error;
      }

      // =====================================================
      // DEVELOPER BALANCE
      // =====================================================

      await User.findByIdAndUpdate(developer._id, {
        $inc: {
          pendingBalance: developerShare,

          totalEarnings: developerShare,
        },
      });

      // =====================================================
      // BUYER PURCHASED GAMES
      // =====================================================

      const updatedBuyer = await User.findByIdAndUpdate(
        buyer._id,
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

      console.log("✅ PURCHASE SAVED:", {
        buyerId: buyer._id.toString(),

        gameId: game._id.toString(),

        purchasedGames: updatedBuyer?.purchasedGames,

        gamesCount: updatedBuyer?.gamesCount,
      });

      console.log("💰 DEVELOPER EARNINGS:", {
        developerId: developer._id.toString(),

        pending: developerShare,

        availableAt,
      });
    }

    // =========================================================
    // ORDER REFUNDED
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

      // Faqat hali refund qilinmagan purchase
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

      // Purchase topilmasa:
      // allaqachon refund qilingan yoki mavjud emas
      if (!purchase) {
        console.log("⚠️ Refund purchase topilmadi:", orderId);

        return NextResponse.json({
          received: true,
        });
      }

      // =====================================================
      // DEVELOPER BALANCE
      // =====================================================

      if (purchase.releasedAt) {
        // Pul allaqachon availableBalance'ga o'tgan
        await User.findByIdAndUpdate(purchase.developerId, {
          $inc: {
            availableBalance: -purchase.developerShare,

            totalEarnings: -purchase.developerShare,
          },
        });
      } else {
        // Pul hali pendingBalance'da
        await User.findByIdAndUpdate(purchase.developerId, {
          $inc: {
            pendingBalance: -purchase.developerShare,

            totalEarnings: -purchase.developerShare,
          },
        });
      }

      // =====================================================
      // BUYER PURCHASED GAMESDAN OLIB TASHLASH
      // =====================================================

      await User.findByIdAndUpdate(purchase.buyerId, {
        $pull: {
          purchasedGames: purchase.gameId,
        },

        $inc: {
          gamesCount: -1,
        },
      });

      console.log("🔄 REFUND PROCESSED:", {
        orderId,
        purchaseId: purchase._id.toString(),

        developerShare: purchase.developerShare,

        wasReleased: Boolean(purchase.releasedAt),
      });
    }

    // =========================================================
    // RESPONSE
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
