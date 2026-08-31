import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/models/user.model";

export async function GET() {
  try {
    await connectToDatabase();

    const admins = await User.find({
      role: {
        $in: ["admin", "owner", "developer"],
      },
    })
      .select("_id name email role picture lastSeen")
      .sort({ role: 1, name: 1 })
      .lean();

    const result = admins.map((admin) => ({
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role as "owner" | "admin" | "developer",
      picture: admin.picture,
      isOnline:
        admin.lastSeen &&
        Date.now() - new Date(admin.lastSeen).getTime() < 60 * 1000,
    }));

    return NextResponse.json(
      {
        success: true,
        admins: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/messages/recipients xatosi:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Adminlar ro'yxatini olishda xatolik yuz berdi",
      },
      { status: 500 },
    );
  }
}
