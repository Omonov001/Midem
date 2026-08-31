import { NextResponse } from "next/server";
import mongoose from "mongoose";

import User from "@/models/user.model";
import Message from "@/models/message.model";
import { connectToDatabase } from "@/lib/mongoose";

const ALLOWED_TYPES = [
  "game_suggestion",
  "bug_report",
  "partnership",
  "other",
] as const;

const ALLOWED_RECEIVER_ROLES = ["admin", "owner", "developer"] as const;

const ALLOWED_SENDER_ROLES = ["user", "admin", "owner", "developer"] as const;

// =========================================================
// POST /api/messages
// =========================================================

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();

    const { senderId, receiverId, requestType, subject, message } = body;

    // =====================================================
    // BASIC VALIDATION
    // =====================================================

    if (!senderId) {
      return NextResponse.json(
        {
          error: "Yuboruvchi ID si yuborilmadi",
        },
        { status: 400 },
      );
    }

    if (!receiverId) {
      return NextResponse.json(
        {
          error: "Qabul qiluvchi ID si yuborilmadi",
        },
        { status: 400 },
      );
    }

    if (!requestType) {
      return NextResponse.json(
        {
          error: "Sorov turi tanlanmagan",
        },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(requestType)) {
      return NextResponse.json(
        {
          error: "Noto'g'ri sorov turi",
        },
        { status: 400 },
      );
    }

    if (!subject || typeof subject !== "string") {
      return NextResponse.json(
        {
          error: "Mavzu yuborilmadi",
        },
        { status: 400 },
      );
    }

    if (!subject.trim()) {
      return NextResponse.json(
        {
          error: "Mavzu bo'sh bo'lishi mumkin emas",
        },
        { status: 400 },
      );
    }

    if (subject.trim().length > 150) {
      return NextResponse.json(
        {
          error: "Mavzu 150 belgidan oshmasligi kerak",
        },
        { status: 400 },
      );
    }

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          error: "Xabar yuborilmadi",
        },
        { status: 400 },
      );
    }

    if (!message.trim()) {
      return NextResponse.json(
        {
          error: "Xabar bo'sh bo'lishi mumkin emas",
        },
        { status: 400 },
      );
    }

    if (message.trim().length > 5000) {
      return NextResponse.json(
        {
          error: "Xabar 5000 belgidan oshmasligi kerak",
        },
        { status: 400 },
      );
    }

    // =====================================================
    // FIND SENDER
    // senderId = CLERK ID
    // =====================================================

    const sender = await User.findOne({
      clerkId: senderId,
    }).select("_id clerkId name username email picture role");

    if (!sender) {
      return NextResponse.json(
        {
          error: "Yuboruvchi foydalanuvchi topilmadi",
        },
        { status: 404 },
      );
    }

    // =====================================================
    // CHECK SENDER ROLE
    // USER + ADMIN + DEVELOPER + OWNER yubora oladi
    // =====================================================

    if (!ALLOWED_SENDER_ROLES.includes(sender.role)) {
      return NextResponse.json(
        {
          error: "Siz xabar yubora olmaysiz",
        },
        { status: 403 },
      );
    }

    // =====================================================
    // CHECK RECEIVER OBJECT ID
    // =====================================================

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return NextResponse.json(
        {
          error: "Qabul qiluvchi ID si noto'g'ri",
        },
        { status: 400 },
      );
    }

    // =====================================================
    // FIND RECEIVER
    // =====================================================

    const receiver = await User.findById(receiverId).select(
      "_id clerkId name username email picture role",
    );

    if (!receiver) {
      return NextResponse.json(
        {
          error: "Qabul qiluvchi topilmadi",
        },
        { status: 404 },
      );
    }

    // =====================================================
    // RECEIVER FAQAT ADMIN / OWNER / DEVELOPER
    // =====================================================

    if (!ALLOWED_RECEIVER_ROLES.includes(receiver.role)) {
      return NextResponse.json(
        {
          error: "Xabar faqat admin, owner yoki developerga yuborilishi mumkin",
        },
        { status: 403 },
      );
    }

    // =====================================================
    // CREATE MESSAGE
    // =====================================================

    const newMessage = await Message.create({
      senderId: sender._id,
      receiverId: receiver._id,

      requestType,

      subject: subject.trim(),
      message: message.trim(),
    });

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json(
      {
        success: true,

        message: "Xabar muvaffaqiyatli yuborildi",

        data: {
          id: newMessage._id.toString(),

          sender: {
            _id: sender._id.toString(),
            clerkId: sender.clerkId,
            name: sender.name,
            username: sender.username,
            email: sender.email,
            picture: sender.picture,
            role: sender.role,
          },

          receiver: {
            _id: receiver._id.toString(),
            clerkId: receiver.clerkId,
            name: receiver.name,
            username: receiver.username,
            email: receiver.email,
            picture: receiver.picture,
            role: receiver.role,
          },

          requestType: newMessage.requestType,

          subject: newMessage.subject,

          message: newMessage.message,

          createdAt: newMessage.createdAt,

          updatedAt: newMessage.updatedAt,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("POST /api/messages xatosi:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Xatolik yuz berdi",
      },
      {
        status: 500,
      },
    );
  }
}

// =========================================================
// GET /api/messages?userId=CLERK_ID
// =========================================================

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    const clerkId = searchParams.get("userId");

    // =====================================================
    // CHECK CLERK ID
    // =====================================================

    if (!clerkId) {
      return NextResponse.json(
        {
          error: "User ID yuborilmadi",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // FIND CURRENT USER
    // =====================================================

    const currentUser = await User.findOne({
      clerkId,
    }).select("_id clerkId name username email picture role");

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "Foydalanuvchi topilmadi",
        },
        {
          status: 404,
        },
      );
    }

    // =====================================================
    // FAQAT ADMIN / DEVELOPER / OWNER
    // O'ZIGA KELGAN MESSAGE'LARNI KO'RADI
    // =====================================================

    if (!ALLOWED_RECEIVER_ROLES.includes(currentUser.role)) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // =====================================================
    // GET ONLY CURRENT USER'S MESSAGES
    // =====================================================

    const messages = await Message.find({
      receiverId: currentUser._id,
    })
      .populate("senderId", "_id clerkId name username email picture role")
      .populate("receiverId", "_id clerkId name username email picture role")
      .sort({
        createdAt: -1,
      })
      .lean();

    // =====================================================
    // FRONTEND UCHUN FORMAT
    // =====================================================

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedMessages = messages.map((msg: any) => {
      const sender = msg.senderId;
      const receiver = msg.receiverId;

      return {
        id: msg._id.toString(),

        sender: sender
          ? {
              _id: sender._id.toString(),
              clerkId: sender.clerkId,
              name: sender.name,
              username: sender.username,
              email: sender.email,
              picture: sender.picture,
              role: sender.role,
            }
          : null,

        receiver: receiver
          ? {
              _id: receiver._id.toString(),
              clerkId: receiver.clerkId,
              name: receiver.name,
              username: receiver.username,
              email: receiver.email,
              picture: receiver.picture,
              role: receiver.role,
            }
          : null,

        requestType: msg.requestType,

        subject: msg.subject,

        message: msg.message,

        createdAt: msg.createdAt,

        updatedAt: msg.updatedAt,
      };
    });

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json({
      success: true,

      currentUser: {
        _id: currentUser._id.toString(),
        clerkId: currentUser.clerkId,
        name: currentUser.name,
        username: currentUser.username,
        email: currentUser.email,
        picture: currentUser.picture,
        role: currentUser.role,
      },

      count: formattedMessages.length,

      data: formattedMessages,
    });
  } catch (error) {
    console.error("GET /api/messages xatosi:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Xabarlarni olishda xatolik yuz berdi",
      },
      {
        status: 500,
      },
    );
  }
}

// =========================================================
// DELETE /api/messages?id=MESSAGE_ID&userId=CLERK_ID
// =========================================================

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    const messageId = searchParams.get("id");
    const clerkId = searchParams.get("userId");

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!messageId) {
      return NextResponse.json(
        {
          error: "Message ID yuborilmadi",
        },
        { status: 400 },
      );
    }

    if (!clerkId) {
      return NextResponse.json(
        {
          error: "User ID yuborilmadi",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return NextResponse.json(
        {
          error: "Message ID noto'g'ri",
        },
        { status: 400 },
      );
    }

    // =====================================================
    // FIND CURRENT USER
    // =====================================================

    const currentUser = await User.findOne({
      clerkId,
    }).select("_id role");

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "Foydalanuvchi topilmadi",
        },
        { status: 404 },
      );
    }

    // =====================================================
    // FAQAT ADMIN / OWNER / DEVELOPER
    // =====================================================

    if (!ALLOWED_RECEIVER_ROLES.includes(currentUser.role)) {
      return NextResponse.json(
        {
          error: "Sizda message o'chirish huquqi yo'q",
        },
        { status: 403 },
      );
    }

    // =====================================================
    // FAQAT O'ZIGA KELGAN MESSAGE
    // =====================================================

    const deletedMessage = await Message.findOneAndDelete({
      _id: messageId,
      receiverId: currentUser._id,
    });

    if (!deletedMessage) {
      return NextResponse.json(
        {
          error: "Message topilmadi yoki bu message sizga tegishli emas",
        },
        { status: 404 },
      );
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    return NextResponse.json({
      success: true,
      message: "Message muvaffaqiyatli o'chirildi",
      data: {
        id: deletedMessage._id.toString(),
      },
    });
  } catch (error) {
    console.error("DELETE /api/messages xatosi:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Message o'chirishda xatolik yuz berdi",
      },
      { status: 500 },
    );
  }
}
