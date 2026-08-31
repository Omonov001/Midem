import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import Notification from "@/models/notification.model";
import User from "@/models/user.model";
import { connectToDatabase } from "@/lib/mongoose";

// =========================================================
// GET
// Userga tegishli private + public notificationlar
// Sender ma'lumotlari ham qaytariladi
// =========================================================

export async function GET() {
  try {
    await connectToDatabase();

    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Avval login qiling",
        },
        { status: 401 },
      );
    }

    const user = await User.findOne({
      clerkId: clerkUser.id,
    })
      .select("_id name clerkId picture")
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Foydalanuvchi topilmadi",
        },
        { status: 404 },
      );
    }

    const userId = String(user._id);

    // =====================================================
    // NOTIFICATIONS
    // =====================================================

    const notifications = await Notification.find({
      $or: [
        {
          recipientType: "public",
        },
        {
          recipientType: "user",
          userId,
        },
      ],

      deletedBy: {
        $ne: userId,
      },
    })
      .sort({ createdAt: -1 })
      .lean();

    // =====================================================
    // SENDERLARNI TOPISH
    //
    // senderId = Clerk ID
    // Shuning uchun User._id emas, clerkId orqali qidiramiz.
    // =====================================================

    const senderIds = [
      ...new Set(
        notifications
          .map((notification) => notification.senderId)
          .filter(
            (senderId): senderId is string =>
              typeof senderId === "string" && senderId.length > 0,
          ),
      ),
    ];

    const senders =
      senderIds.length > 0
        ? await User.find({
            clerkId: {
              $in: senderIds,
            },
          })
            .select("_id clerkId name picture")
            .lean()
        : [];

    // =====================================================
    // SENDER MAP
    // =====================================================

    const senderMap = new Map(
      senders.map((sender) => [
        sender.clerkId,
        {
          _id: String(sender._id),
          clerkId: sender.clerkId,
          name: sender.name,
          picture: sender.picture ?? null,
        },
      ]),
    );

    // =====================================================
    // READ STATE + SENDER
    // =====================================================

    const notificationsWithData = notifications.map((notification) => {
      const isRead =
        notification.recipientType === "public"
          ? (notification.readBy?.includes(userId) ?? false)
          : (notification.isRead ?? false);

      const sender = notification.senderId
        ? (senderMap.get(notification.senderId) ?? null)
        : null;

      return {
        ...notification,

        isRead,

        currentUserId: userId,

        sender,
      };
    });

    // =====================================================
    // UNREAD COUNT
    // =====================================================

    const unreadCount = notificationsWithData.filter(
      (notification) => !notification.isRead,
    ).length;

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json(
      {
        success: true,
        notifications: notificationsWithData,
        total: notificationsWithData.length,
        unreadCount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/notifications/user:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Notificationlarni olishda xatolik yuz berdi",
      },
      { status: 500 },
    );
  }
}

// =========================================================
// PATCH
//
// action:
// - read
// - unread
// - read-all
// =========================================================

export async function PATCH(request: Request) {
  try {
    await connectToDatabase();

    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Avval login qiling",
        },
        { status: 401 },
      );
    }

    const user = await User.findOne({
      clerkId: clerkUser.id,
    })
      .select("_id")
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Foydalanuvchi topilmadi",
        },
        { status: 404 },
      );
    }

    const userId = String(user._id);

    const body = await request.json();

    const action = body?.action;
    const notificationId = body?.notificationId;

    // =====================================================
    // READ ALL
    // =====================================================

    if (action === "read-all") {
      // PUBLIC
      await Notification.updateMany(
        {
          recipientType: "public",
          deletedBy: {
            $ne: userId,
          },
          readBy: {
            $ne: userId,
          },
        },
        {
          $addToSet: {
            readBy: userId,
          },
        },
      );

      // PRIVATE
      await Notification.updateMany(
        {
          recipientType: "user",
          userId,
          deletedBy: {
            $ne: userId,
          },
          isRead: false,
        },
        {
          $set: {
            isRead: true,
          },
        },
      );

      return NextResponse.json({
        success: true,
        message: "Barcha notificationlar o'qilgan",
      });
    }

    // =====================================================
    // SINGLE NOTIFICATION ID
    // =====================================================

    if (!notificationId) {
      return NextResponse.json(
        {
          success: false,
          message: "notificationId kerak",
        },
        { status: 400 },
      );
    }

    // =====================================================
    // FIND
    // =====================================================

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification topilmadi",
        },
        { status: 404 },
      );
    }

    // =====================================================
    // PRIVATE OWNERSHIP
    // =====================================================

    if (
      notification.recipientType === "user" &&
      String(notification.userId) !== userId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Bu notification sizga tegishli emas",
        },
        { status: 403 },
      );
    }

    // =====================================================
    // READ
    // =====================================================

    if (action === "read") {
      if (notification.recipientType === "public") {
        await Notification.updateOne(
          {
            _id: notificationId,
            recipientType: "public",
          },
          {
            $addToSet: {
              readBy: userId,
            },
          },
        );
      } else {
        await Notification.updateOne(
          {
            _id: notificationId,
            recipientType: "user",
            userId,
          },
          {
            $set: {
              isRead: true,
            },
          },
        );
      }

      return NextResponse.json({
        success: true,
        isRead: true,
      });
    }

    // =====================================================
    // UNREAD
    // =====================================================

    if (action === "unread") {
      if (notification.recipientType === "public") {
        await Notification.updateOne(
          {
            _id: notificationId,
            recipientType: "public",
          },
          {
            $pull: {
              readBy: userId,
            },
          },
        );
      } else {
        await Notification.updateOne(
          {
            _id: notificationId,
            recipientType: "user",
            userId,
          },
          {
            $set: {
              isRead: false,
            },
          },
        );
      }

      return NextResponse.json({
        success: true,
        isRead: false,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Noto'g'ri action",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("PATCH /api/notifications/user:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Notificationni yangilashda xatolik yuz berdi",
      },
      { status: 500 },
    );
  }
}

// =========================================================
// DELETE
//
// Private -> notification o'chiriladi
// Public  -> faqat shu userdan yashiriladi
// =========================================================

export async function DELETE(request: Request) {
  try {
    await connectToDatabase();

    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Avval login qiling",
        },
        { status: 401 },
      );
    }

    const user = await User.findOne({
      clerkId: clerkUser.id,
    })
      .select("_id")
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Foydalanuvchi topilmadi",
        },
        { status: 404 },
      );
    }

    const userId = String(user._id);

    // =====================================================
    // BODY
    // =====================================================

    const body = await request.json();

    const notificationId = body?.notificationId;

    if (!notificationId) {
      return NextResponse.json(
        {
          success: false,
          message: "notificationId kerak",
        },
        { status: 400 },
      );
    }

    // =====================================================
    // FIND
    // =====================================================

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification topilmadi",
        },
        { status: 404 },
      );
    }

    // =====================================================
    // PRIVATE
    // =====================================================

    if (notification.recipientType === "user") {
      if (String(notification.userId) !== userId) {
        return NextResponse.json(
          {
            success: false,
            message: "Bu notification sizga tegishli emas",
          },
          { status: 403 },
        );
      }

      await Notification.deleteOne({
        _id: notificationId,
        recipientType: "user",
        userId,
      });

      return NextResponse.json({
        success: true,
        message: "Notification o'chirildi",
      });
    }

    // =====================================================
    // PUBLIC
    // Faqat shu userdan yashirish
    // =====================================================

    await Notification.updateOne(
      {
        _id: notificationId,
        recipientType: "public",
      },
      {
        $addToSet: {
          deletedBy: userId,
        },
      },
    );

    return NextResponse.json({
      success: true,
      message: "Notification o'chirildi",
    });
  } catch (error) {
    console.error("DELETE /api/notifications/user:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Notificationni o'chirishda xatolik yuz berdi",
      },
      { status: 500 },
    );
  }
}
