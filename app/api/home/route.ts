import { NextResponse } from "next/server";

import Game from "@/models/game.model";
import { News } from "@/models/new.model";
import User from "@/models/user.model";
import { connectToDatabase } from "@/lib/mongoose";

export async function GET() {
  try {
    await connectToDatabase();

    const [games, news, admins] = await Promise.all([
      Game.find(
        { visibility: "public", request: "approved" },
        {
          slug: 1,

          "langData.uz.title": 1,
          "langData.uz.Maindescription": 1,
          "langData.uz.iconPreview": 1,

          "langData.en.title": 1,
          "langData.en.Maindescription": 1,
          "langData.en.iconPreview": 1,

          "langData.ru.title": 1,
          "langData.ru.Maindescription": 1,
          "langData.ru.iconPreview": 1,

          "langData.tr.title": 1,
          "langData.tr.Maindescription": 1,
          "langData.tr.iconPreview": 1,

          createdAt: 1, // 👈
        },
      )
        .sort({ createdAt: -1 })
        .lean(),

      News.find(
        { visibility: "public", request: "approved" },
        {
          slug: 1,

          "translations.uz.title": 1,
          "translations.uz.content": 1,
          "translations.uz.banners": 1,

          "translations.en.title": 1,
          "translations.en.content": 1,
          "translations.en.banners": 1,

          "translations.ru.title": 1,
          "translations.ru.content": 1,
          "translations.ru.banners": 1,

          "translations.tr.title": 1,
          "translations.tr.content": 1,
          "translations.tr.banners": 1,

          createdAt: 1, // 👈
        },
      )
        .sort({ createdAt: -1 })
        .lean(),

      User.find(
        { role: { $in: ["admin", "developer"] } },
        {
          name: 1,
          picture: 1,
        },
      )
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      games,
      news,
      admins,
    });
  } catch (error) {
    console.error("HOME API ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to load home data" },
      { status: 500 },
    );
  }
}
