import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Notification from "@/models/notification.model";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/models/user.model";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET() {
  try {
    await connectToDatabase();

    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Barcha kerakli user ID larni yig'amiz
    const userIds = new Set<string>();

    for (const notification of notifications) {
      if (notification.userId) {
        userIds.add(notification.userId);
      }

      if (notification.senderId) {
        userIds.add(notification.senderId);
      }
    }

    // Userlarni ID orqali topamiz
    const users = await User.find({
      $or: [
        { clerkId: { $in: Array.from(userIds) } },
        {
          _id: {
            $in: Array.from(userIds).filter((id) =>
              /^[0-9a-fA-F]{24}$/.test(id),
            ),
          },
        },
      ],
    })
      .select("_id clerkId name email picture username role")
      .lean();

    // Tez lookup qilish uchun Map
    const userMap = new Map<string, (typeof users)[number]>();

    for (const user of users) {
      userMap.set(user._id.toString(), user);
      if (user.clerkId) {
        userMap.set(user.clerkId, user);
      }
    }

    const formattedNotifications = notifications.map((notification) => {
      const recipient = notification.userId
        ? userMap.get(notification.userId) || null
        : null;

      const sender = notification.senderId
        ? userMap.get(notification.senderId) || null
        : null;

      return {
        ...notification,

        _id: notification._id.toString(),

        recipient: recipient
          ? {
              id: recipient._id.toString(),
              clerkId: recipient.clerkId,
              name: recipient.name,
              email: recipient.email,
              picture: recipient.picture,
              username: recipient.username,
              role: recipient.role,
            }
          : null,

        sender: sender
          ? {
              id: sender._id.toString(),
              clerkId: sender.clerkId,
              name: sender.name,
              email: sender.email,
              picture: sender.picture,
              username: sender.username,
              role: sender.role,
            }
          : null,
      };
    });

    return NextResponse.json(
      {
        success: true,
        notifications: formattedNotifications,
        total: formattedNotifications.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/notifications error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Notificationsni olishda xatolik yuz berdi",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification ID berilmagan",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Noto'g'ri notification ID",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification topilmadi",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Notification muvaffaqiyatli o'chirildi",
        deletedId: id,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/notifications/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Notificationni o'chirishda xatolik yuz berdi",
      },
      { status: 500 },
    );
  }
}
