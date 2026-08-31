import { NextResponse } from "next/server";
import User from "@/models/user.model";
import { connectToDatabase } from "@/lib/mongoose";

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();

    const { clerkId } = await req.json();

    if (!clerkId) {
      return NextResponse.json(
        { error: "Clerk ID topilmadi" },
        { status: 400 },
      );
    }

    const user = await User.findOneAndUpdate(
      { clerkId },
      { $set: { lastSeen: new Date() } },
      { new: true },
    );

    if (!user) {
      return NextResponse.json(
        { error: "Foydalanuvchi topilmadi" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      lastSeen: user.lastSeen,
    });
  } catch (error) {
    console.error("Heartbeat xatosi:", error);

    return NextResponse.json({ error: "Heartbeat xatosi" }, { status: 500 });
  }
}
