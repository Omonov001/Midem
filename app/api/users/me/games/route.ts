import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import User from "@/models/user.model";
import Game from "@/models/game.model";
import { connectToDatabase } from "@/lib/mongoose";

export async function GET() {
  try {
    await connectToDatabase();

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Clerk ID orqali MIDEM userini topamiz
    const user = await User.findOne({
      clerkId: userId,
    }).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // User sotib olgan o'yinlarning MongoDB _id larini olamiz
    const purchasedGameIds = user.purchasedGames ?? [];

    if (purchasedGameIds.length === 0) {
      return NextResponse.json({
        games: [],
      });
    }

    // Shu _id lar bo'yicha Game collection'dan o'yinlarni olamiz
    const games = await Game.find({
      _id: {
        $in: purchasedGameIds,
      },
    })
      .select("_id slug platform priceType price techData langData createdAt")
      .lean();

    return NextResponse.json({
      games,
    });
  } catch (error) {
    console.error("GET /api/users/me/games error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch purchased games",
      },
      { status: 500 },
    );
  }
}
