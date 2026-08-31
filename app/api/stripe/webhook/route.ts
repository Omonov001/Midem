import { NextResponse } from "next/server";
import Stripe from "stripe";

import Purchase from "@/models/purchase.model";
import User from "@/models/user.model";
import Game from "@/models/game.model";
import { connectToDatabase } from "@/lib/mongoose";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      {
        success: false,
        message: "Stripe signature topilmadi!",
      },
      { status: 400 },
    );
  }

  try {
    // Stripe webhook body aynan raw text bo'lishi kerak
    const body = await req.text();

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    await connectToDatabase();

    // ============================================
    // CHECKOUT COMPLETED
    // ============================================
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const { gameId, buyerId, developerId } = session.metadata || {};

      if (!gameId || !buyerId || !developerId) {
        console.error(
          "Stripe webhook metadata yetishmayapti:",
          session.metadata,
        );

        return NextResponse.json(
          {
            success: false,
            message: "Payment metadata noto'g'ri!",
          },
          { status: 400 },
        );
      }

      // To'lov haqiqatan amalga oshganini tekshiramiz
      if (session.payment_status !== "paid") {
        return NextResponse.json({
          success: true,
          message: "Payment hali tasdiqlanmagan.",
        });
      }

      // ============================================
      // USER + GAME TEKSHIRISH
      // ============================================

      const buyer = await User.findById(buyerId);
      const developer = await User.findById(developerId);
      const game = await Game.findById(gameId);

      if (!buyer || !developer || !game) {
        console.error("Stripe webhook: ma'lumot topilmadi.");

        return NextResponse.json(
          {
            success: false,
            message: "Buyer, developer yoki game topilmadi!",
          },
          { status: 404 },
        );
      }

      // ============================================
      // O'Z O'YININI SOTIB OLISHNI BLOKLASH
      // ============================================

      if (String(buyer._id) === String(developer._id)) {
        console.error("Developer o'z o'yinini sotib olishga urindi.");

        return NextResponse.json(
          {
            success: false,
            message: "Developer o'z o'yinini sotib ololmaydi!",
          },
          { status: 400 },
        );
      }

      // ============================================
      // DUPLICATE PURCHASE CHECK
      // ============================================

      const existingPurchase = await Purchase.findOne({
        buyerId: buyer._id,
        gameId: game._id,
      });

      if (existingPurchase) {
        console.log("Purchase allaqachon mavjud:", existingPurchase._id);

        return NextResponse.json({
          success: true,
          message: "Purchase allaqachon mavjud.",
        });
      }

      // ============================================
      // PURCHASE YARATISH
      // ============================================

      const purchase = await Purchase.create({
        buyerId: buyer._id,
        gameId: game._id,
        developerId: developer._id,

        stripeSessionId: session.id,

        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,

        amount: session.amount_total ?? 0,

        currency: (session.currency || "usd").toUpperCase(),

        status: "paid",
      });

      console.log("====================================");
      console.log("STRIPE PAYMENT SUCCESS");
      console.log("Purchase:", purchase._id);
      console.log("Session:", session.id);
      console.log("Game:", game._id);
      console.log("Buyer:", buyer._id);
      console.log("Developer:", developer._id);
      console.log("Amount:", session.amount_total);
      console.log("Currency:", session.currency);
      console.log("====================================");

      return NextResponse.json({
        success: true,
        message: "To'lov muvaffaqiyatli. O'yin sotib olindi!",
        purchaseId: purchase._id,
      });
    }

    // ============================================
    // PAYMENT FAILED
    // ============================================

    if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("Stripe payment failed:", session.id);
    }

    // ============================================
    // REFUND
    // ============================================

    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;

      if (typeof charge.payment_intent === "string") {
        await Purchase.findOneAndUpdate(
          {
            stripePaymentIntentId: charge.payment_intent,
          },
          {
            status: "refunded",
          },
        );
      }
    }

    return NextResponse.json({
      success: true,
      received: true,
    });
  } catch (error: unknown) {
    console.error("Stripe Webhook Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Stripe webhook xatosi!",
      },
      { status: 400 },
    );
  }
}
