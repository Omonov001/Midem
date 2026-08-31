import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Game from "@/models/game.model";
import User from "@/models/user.model";
import { auth } from "@clerk/nextjs/server";

const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY!;
const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID!;
const LEMONSQUEEZY_GAME_VARIANT_ID = process.env.LEMONSQUEEZY_GAME_VARIANT_ID!;

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { gameId } = await req.json();
  if (!gameId) {
    return NextResponse.json({ error: "gameId required" }, { status: 400 });
  }

  await connectToDatabase();

  const game = await Game.findById(gameId);
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  // Narx majburiy va musbat bo'lishi kerak — bo'lmasa checkout to'xtatiladi
  const price = Number(game.price);
  if (!price || price <= 0) {
    return NextResponse.json({ error: "Invalid game price" }, { status: 400 });
  }

  const dbUser = await User.findOne({ clerkId });
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const customPriceCents = Math.round(price * 100);

  const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          custom_price: customPriceCents,
          checkout_data: {
            email: dbUser.email,
            custom: {
              gameId: game._id.toString(),
              buyerId: dbUser._id.toString(),
            },
          },
          product_options: {
            name: game.langData?.uz?.title || game.slug,
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/games/${game.slug}?purchased=true`,
          },
        },
        relationships: {
          store: {
            data: { type: "stores", id: LEMONSQUEEZY_STORE_ID },
          },
          variant: {
            data: { type: "variants", id: LEMONSQUEEZY_GAME_VARIANT_ID },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Lemon Squeezy checkout error:", errText);
    return NextResponse.json(
      { error: "Checkout creation failed" },
      { status: 500 },
    );
  }

  const data = await response.json();
  const checkoutUrl = data.data.attributes.url;

  return NextResponse.json({ checkoutUrl });
}
