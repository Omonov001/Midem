import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Notification from "@/models/notification.model";
import { connectToDatabase } from "@/lib/mongoose";

const LANGUAGES = ["uz", "ru", "en", "tr"] as const;

const NOTIFICATION_TYPES = [
  "system",
  "message",
  "achievement",
  "payment",
  "admin",
  "account",
] as const;

const RECIPIENT_TYPES = ["public", "user"] as const;

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);

    const page = Math.max(Number(searchParams.get("page")) || 1, 1);

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 20, 1),
      100,
    );

    const skip = (page - 1) * limit;

    const type = searchParams.get("type");

    const filter: Record<string, unknown> = {
      $or: [
        {
          recipientType: "public",
        },
        {
          recipientType: "user",
          userId,
        },
      ],
    };

    if (
      type &&
      NOTIFICATION_TYPES.includes(type as (typeof NOTIFICATION_TYPES)[number])
    ) {
      filter.type = type;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Notification.countDocuments(filter),
    ]);

    const formattedNotifications = notifications.map((notification) => {
      const isPublic = notification.recipientType === "public";

      const isRead = isPublic
        ? (notification.readBy?.includes(userId) ?? false)
        : notification.isRead;

      return {
        ...notification,
        isRead,
      };
    });

    const unreadCount = await Notification.countDocuments({
      $or: [
        {
          recipientType: "user",
          userId,
          isRead: false,
        },
      ],
    });

    const publicNotifications = await Notification.find({
      recipientType: "public",
      $or: [
        {
          readBy: { $exists: false },
        },
        {
          readBy: { $nin: [userId] },
        },
      ],
    })
      .select("_id")
      .lean();

    const totalUnreadCount = unreadCount + publicNotifications.length;

    return NextResponse.json({
      success: true,

      notifications: formattedNotifications,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },

      unreadCount: totalUnreadCount,
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Notificationlarni olishda xatolik yuz berdi",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    await connectToDatabase();

    const body = await request.json();

    const {
      recipientType,
      userId: targetUserId,
      type = "system",
      translations,
      link = null,
    } = body;

    // -----------------------------------------
    // Recipient type validation
    // -----------------------------------------

    if (!RECIPIENT_TYPES.includes(recipientType)) {
      return NextResponse.json(
        {
          success: false,
          message: "recipientType 'public' yoki 'user' bo'lishi kerak",
        },
        { status: 400 },
      );
    }

    // -----------------------------------------
    // User notification uchun userId kerak
    // -----------------------------------------

    if (recipientType === "user" && !targetUserId) {
      return NextResponse.json(
        {
          success: false,
          message: "Shaxsiy notification uchun userId kerak",
        },
        { status: 400 },
      );
    }

    // -----------------------------------------
    // Public notificationda userId bo'lmasligi kerak
    // -----------------------------------------

    if (recipientType === "public" && targetUserId) {
      return NextResponse.json(
        {
          success: false,
          message: "Public notificationda userId yuborilmaydi",
        },
        { status: 400 },
      );
    }

    // -----------------------------------------
    // Type validation
    // -----------------------------------------

    if (
      !NOTIFICATION_TYPES.includes(type as (typeof NOTIFICATION_TYPES)[number])
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification type noto'g'ri",
        },
        { status: 400 },
      );
    }

    // -----------------------------------------
    // Translation validation
    // -----------------------------------------

    if (!translations || typeof translations !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "translations majburiy",
        },
        { status: 400 },
      );
    }

    for (const language of LANGUAGES) {
      const translation = translations[language];

      if (!translation) {
        return NextResponse.json(
          {
            success: false,
            message: `${language} translation majburiy`,
          },
          { status: 400 },
        );
      }

      if (typeof translation.title !== "string" || !translation.title.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: `${language}.title majburiy`,
          },
          { status: 400 },
        );
      }

      if (
        typeof translation.message !== "string" ||
        !translation.message.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `${language}.message majburiy`,
          },
          { status: 400 },
        );
      }

      if (translation.title.length > 200) {
        return NextResponse.json(
          {
            success: false,
            message: `${language}.title juda uzun`,
          },
          { status: 400 },
        );
      }

      if (translation.message.length > 2000) {
        return NextResponse.json(
          {
            success: false,
            message: `${language}.message juda uzun`,
          },
          { status: 400 },
        );
      }
    }

    // -----------------------------------------
    // Notification create
    // -----------------------------------------

    const notification = await Notification.create({
      recipientType,

      userId: recipientType === "user" ? String(targetUserId) : null,

      type,

      translations: {
        uz: {
          title: translations.uz.title.trim(),
          message: translations.uz.message.trim(),
        },

        ru: {
          title: translations.ru.title.trim(),
          message: translations.ru.message.trim(),
        },

        en: {
          title: translations.en.title.trim(),
          message: translations.en.message.trim(),
        },

        tr: {
          title: translations.tr.title.trim(),
          message: translations.tr.message.trim(),
        },
      },

      isRead: false,

      readBy: [],

      senderId: userId,

      link: typeof link === "string" && link.trim() ? link.trim() : null,
    });

    return NextResponse.json(
      {
        success: true,

        message:
          recipientType === "public"
            ? "Notification barcha foydalanuvchilarga yaratildi"
            : "Notification foydalanuvchiga yaratildi",

        notification,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/notifications error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Notification yaratishda xatolik yuz berdi",
      },
      { status: 500 },
    );
  }
}
