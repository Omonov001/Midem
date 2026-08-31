import { NextResponse } from "next/server";
import User from "@/models/user.model";
import { connectToDatabase } from "@/lib/mongoose";

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();

    const { clerkId } = body;

    if (!clerkId) {
      return NextResponse.json(
        { error: "clerkId yuborilmadi" },
        { status: 400 },
      );
    }

    const user = await User.findOneAndUpdate(
      { clerkId },
      {
        $set: {
          lastSeen: new Date(),
        },
      },
      {
        new: true,
      },
    );

    if (!user) {
      return NextResponse.json(
        { error: "Foydalanuvchi topilmadi" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        lastSeen: user.lastSeen,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Heartbeat xatosi:", error);

    return NextResponse.json(
      { error: "lastSeen yangilanmadi" },
      { status: 500 },
    );
  }
}
