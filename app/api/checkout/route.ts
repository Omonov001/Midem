import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Game from "@/models/game.model";
import { auth } from "@clerk/nextjs/server"; // sizda Clerk borligi ko'rinib turibdi

const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY!;
const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID!; // bu ham kerak bo'ladi

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
  if (!game || !game.lemonSqueezyVariantId) {
    return NextResponse.json(
      { error: "Game not found or not linked to Lemon Squeezy" },
      { status: 404 },
    );
  }

  // User'ning Mongo ID'sini olamiz (clerkId orqali)
  const User = (await import("@/models/user.model")).default;
  const dbUser = await User.findOne({ clerkId });
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Lemon Squeezy'ga checkout yaratish so'rovi
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
          checkout_data: {
            email: dbUser.email,
            custom: {
              gameId: game._id.toString(),
              buyerId: dbUser._id.toString(),
            },
          },
          product_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/games/${game.slug}?purchased=true`,
          },
        },
        relationships: {
          store: {
            data: { type: "stores", id: LEMONSQUEEZY_STORE_ID },
          },
          variant: {
            data: { type: "variants", id: game.lemonSqueezyVariantId },
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
