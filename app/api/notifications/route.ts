import { NextResponse } from "next/server";
import Notification from "@/models/notification.model";
import User from "@/models/user.model";
import { connectToDatabase } from "@/lib/mongoose";

export async function GET() {
  try {
    await connectToDatabase();

    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Private notificationlarning user _id larini olamiz
    const userIds = notifications
      .filter(
        (notification) =>
          notification.recipientType === "user" && notification.userId,
      )
      .map((notification) => String(notification.userId));

    // Userlarni MongoDB _id orqali topamiz
    const users = await User.find({
      _id: { $in: userIds },
    })
      .select("_id name clerkId")
      .lean();

    // Tez topish uchun Map
    const userMap = new Map(
      users.map((user) => [
        String(user._id),
        {
          name: user.name,
          clerkId: user.clerkId,
        },
      ]),
    );

    // Notificationlarga userName qo'shamiz
    const notificationsWithUsers = notifications.map((notification) => {
      if (notification.recipientType === "user" && notification.userId) {
        const user = userMap.get(String(notification.userId));

        return {
          ...notification,

          userName: user?.name || "Nomalum foydalanuvchi",

          // kerak bo'lsa Clerk ID ham response'da bo'ladi
          userClerkId: user?.clerkId || null,
        };
      }

      return {
        ...notification,
        userName: null,
        userClerkId: null,
      };
    });

    return NextResponse.json(
      {
        success: true,
        notifications: notificationsWithUsers,
        total: notificationsWithUsers.length,
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
