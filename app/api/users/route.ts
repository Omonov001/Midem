import { NextResponse } from "next/server";
import User from "@/models/user.model";
import { connectToDatabase } from "@/lib/mongoose";

export async function GET() {
  try {
    await connectToDatabase();

    const users = await User.find({}).sort({ createdAt: -1 });

    const responseUsers = users.map((user) => ({
      ...user.toObject(),
      id: user._id.toString(),
    }));

    return NextResponse.json(responseUsers, { status: 200 });
  } catch (error) {
    console.error("GET /api/users xatosi:", error);

    return NextResponse.json(
      { error: "Foydalanuvchilarni olishda xatolik" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const newUser = await User.create(body);

    const responseUser = {
      ...newUser.toObject(),
      id: newUser._id.toString(),
    };

    return NextResponse.json(responseUser, { status: 201 });
  } catch (error) {
    console.error("POST /api/users xatosi:", error);

    return NextResponse.json(
      { error: "Foydalanuvchi yaratishda xatolik" },
      { status: 500 },
    );
  }
}
