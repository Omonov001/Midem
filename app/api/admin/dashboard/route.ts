import { connectToDatabase } from "@/lib/mongoose";
import Game from "@/models/game.model";
import Message from "@/models/message.model";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    // =========================================================
    // DATE HELPERS
    // =========================================================

    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    // Oxirgi 30 sekund ichida heartbeat qilgan user = ONLINE
    const onlineSince = new Date(now.getTime() - 30 * 1000);

    // =========================================================
    // MAIN STATISTICS
    // =========================================================

    const [
      totalUsers,
      onlineUsers,
      bannedUsers,

      totalGames,
      pendingGames,

      totalMessages,

      usersToday,
      gamesToday,
      messagesToday,
    ] = await Promise.all([
      // ---------------------------------------------------------
      // USERS
      // ---------------------------------------------------------

      User.countDocuments(),

      User.countDocuments({
        lastSeen: {
          $gte: onlineSince,
        },
      }),

      User.countDocuments({
        isBanned: true,
      }),

      // ---------------------------------------------------------
      // GAMES
      // ---------------------------------------------------------

      Game.countDocuments(),

      Game.countDocuments({
        request: "requested",
      }),

      // ---------------------------------------------------------
      // MESSAGES
      // ---------------------------------------------------------

      Message.countDocuments(),

      // ---------------------------------------------------------
      // TODAY
      // ---------------------------------------------------------

      User.countDocuments({
        createdAt: {
          $gte: startOfToday,
          $lt: startOfTomorrow,
        },
      }),

      Game.countDocuments({
        createdAt: {
          $gte: startOfToday,
          $lt: startOfTomorrow,
        },
      }),

      Message.countDocuments({
        createdAt: {
          $gte: startOfToday,
          $lt: startOfTomorrow,
        },
      }),
    ]);

    // =========================================================
    // RECENT USERS
    // =========================================================

    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("clerkId name email picture role isBanned lastSeen createdAt")
      .lean();

    // =========================================================
    // RECENT USER REQUESTS
    //
    // Message.senderId -> User._id
    // =========================================================

    const recentRequests = await Message.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "senderId",
        select: "name email picture clerkId role isBanned",
      })
      .lean();

    // =========================================================
    // PENDING GAMES
    //
    // MUHIM:
    // Game nomi langData.uz.title ichida.
    // Shuning uchun frontendga title ni yuboramiz.
    // =========================================================

    const pendingGamesList = await Game.find(
      {
        request: "requested",
      },
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

        createdAt: 1,
      },
    )
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // =========================================================
    // RESPONSE
    // =========================================================

    return NextResponse.json(
      {
        success: true,

        stats: {
          users: totalUsers,
          onlineUsers,
          bannedUsers,

          games: totalGames,
          pendingGames,

          messages: totalMessages,
        },

        growth: {
          usersToday,
          gamesToday,
          messagesToday,
        },

        recentRequests,

        pendingGames: pendingGamesList,

        recentUsers,

        updatedAt: now.toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("ADMIN DASHBOARD API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load dashboard data",
      },
      {
        status: 500,
      },
    );
  }
}
