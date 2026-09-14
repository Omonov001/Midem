/* eslint-disable @typescript-eslint/no-explicit-any */

import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongoose";
import Game from "@/models/game.model";
import { News } from "@/models/new.model";
import User from "@/models/user.model";

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const developerId = searchParams.get("developerId");

    // --------------------------------------------------
    // CHECK DEVELOPER ID
    // --------------------------------------------------

    if (!developerId) {
      return NextResponse.json(
        {
          error: "Developer ID topilmadi",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------------------
    // FIND USER BY CLERK ID
    // --------------------------------------------------

    const user = await User.findOne({
      clerkId: developerId,
    })
      .select("_id clerkId")
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          error: "Developer topilmadi",
        },
        {
          status: 404,
        },
      );
    }

    // --------------------------------------------------
    // MONGODB USER ID
    // --------------------------------------------------

    const mongoUserId = new mongoose.Types.ObjectId(user._id);

    // --------------------------------------------------
    // GAME QUERY
    //
    // developerId Mixed bo'lgani uchun:
    // 1. Clerk ID string
    // 2. Mongo ObjectId
    //
    // ikkalasini ham qo'llab-quvvatlaymiz.
    // --------------------------------------------------

    const gameDeveloperQuery = {
      $or: [
        {
          developerId: developerId,
        },
        {
          developerId: mongoUserId,
        },
      ],
    };

    // --------------------------------------------------
    // LOAD EVERYTHING IN PARALLEL
    // --------------------------------------------------

    const [gamesCount, newsCount, latestGames, latestNews] = await Promise.all([
      // ------------------------------------------------
      // TOTAL GAMES
      // ------------------------------------------------

      Game.countDocuments(gameDeveloperQuery),

      // ------------------------------------------------
      // TOTAL NEWS
      // ------------------------------------------------

      News.countDocuments({
        authorId: mongoUserId,
      }),

      // ------------------------------------------------
      // LATEST 5 GAMES
      // ------------------------------------------------

      Game.find(gameDeveloperQuery)
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .select(
          "_id developerId request visibility priceType price langData createdAt updatedAt",
        )
        .lean(),

      // ------------------------------------------------
      // LATEST 5 NEWS
      // ------------------------------------------------

      News.find({
        authorId: mongoUserId,
      })
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .select(
          "_id slug request visibility translations createdAt updatedAt selectedGame",
        )
        .lean(),
    ]);

    // --------------------------------------------------
    // FORMAT GAMES
    // --------------------------------------------------

    const formattedGames = latestGames.map((game: any) => {
      const uz = game.langData?.uz;
      const en = game.langData?.en;
      const ru = game.langData?.ru;

      return {
        _id: String(game._id),

        title: uz?.title || en?.title || ru?.title || "Nomsiz o'yin",

        icon: uz?.iconPreview || en?.iconPreview || ru?.iconPreview || null,

        status: game.request || "requested",

        visibility: game.visibility || "private",

        priceType: game.priceType || "free",

        price: game.price ?? 0,

        createdAt: game.createdAt,
      };
    });

    // --------------------------------------------------
    // FORMAT NEWS
    // --------------------------------------------------

    const formattedNews = latestNews.map((news: any) => {
      const uz = news.translations?.uz;
      const en = news.translations?.en;
      const ru = news.translations?.ru;

      return {
        _id: String(news._id),

        slug: news.slug,

        title: uz?.title || en?.title || ru?.title || "Nomsiz yangilik",

        icon: uz?.banners?.[0] || en?.banners?.[0] || ru?.banners?.[0] || null,

        status: news.request || "requested",

        visibility: news.visibility || "private",

        createdAt: news.createdAt,
      };
    });

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return NextResponse.json(
      {
        success: true,

        gamesCount,

        newsCount,

        latestGames: formattedGames,

        latestNews: formattedNews,
      },
      {
        status: 200,
      },
    );
  } catch (error: any) {
    console.error("Developer Dashboard Error:", error);

    return NextResponse.json(
      {
        success: false,

        error: error?.message || "Developer ma'lumotlarini olishda xatolik",
      },
      {
        status: 500,
      },
    );
  }
}
