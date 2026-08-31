import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

import User from "@/models/user.model";
import Game from "@/models/game.model";
import { connectToDatabase } from "@/lib/mongoose";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    // 1. Clerk user
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Tizimga kirmagansiz!",
        },
        { status: 401 },
      );
    }

    // 2. Database
    await connectToDatabase();

    const user = await User.findOne({
      clerkId: clerkUser.id,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Foydalanuvchi topilmadi!",
        },
        { status: 404 },
      );
    }

    // 3. Body
    const body = await req.json();

    const { gameId } = body;

    if (!gameId) {
      return NextResponse.json(
        {
          success: false,
          message: "gameId kerak!",
        },
        { status: 400 },
      );
    }

    // 4. Game
    const game = await Game.findById(gameId).lean();

    if (!game) {
      return NextResponse.json(
        {
          success: false,
          message: "O'yin topilmadi!",
        },
        { status: 404 },
      );
    }

    // 5. Game paid ekanini tekshirish
    if (game.priceType !== "paid") {
      return NextResponse.json(
        {
          success: false,
          message: "Bu o'yin bepul!",
        },
        { status: 400 },
      );
    }

    // 6. Price
    const numericPrice = Number(String(game.price).replace(/[^0-9.]/g, ""));

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "O'yin narxi noto'g'ri!",
        },
        { status: 400 },
      );
    }

    // Stripe cents
    const amount = Math.round(numericPrice * 100);

    // 7. Developer
    const developer = await User.findById(game.developerId);

    if (!developer) {
      return NextResponse.json(
        {
          success: false,
          message: "Developer topilmadi!",
        },
        { status: 404 },
      );
    }

    // 8. Developer Stripe Connect account
    if (!developer.stripeAccountId) {
      return NextResponse.json(
        {
          success: false,
          message: "Developer Stripe Connect'ni hali ulmagan!",
        },
        { status: 400 },
      );
    }

    // 9. O'z o'yinini sotib olishni bloklash
    if (String(game.developerId) === String(user._id)) {
      return NextResponse.json(
        {
          success: false,
          message: "O'zingizning o'yiningizni sotib ola olmaysiz!",
        },
        { status: 400 },
      );
    }

    // 10. Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name:
                game.langData?.en?.title ||
                game.langData?.uz?.title ||
                "MIDEM Game",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],

      metadata: {
        gameId: String(game._id),
        buyerId: String(user._id),
        developerId: String(game.developerId),
      },

      payment_intent_data: {
        transfer_data: {
          destination: developer.stripeAccountId,
        },
      },

      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,

      customer_email: clerkUser.emailAddresses[0]?.emailAddress,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: unknown) {
    console.error("Stripe Checkout Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Stripe Checkout xatosi!",
      },
      { status: 500 },
    );
  }
}
