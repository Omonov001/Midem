import User from "@/models/user.model";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import mongoose from "mongoose";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const body = await req.json();

    if (!id || id === "undefined" || id === "null") {
      return NextResponse.json(
        { error: "Foydalanuvchi ID si yuborilmadi" },
        { status: 400 },
      );
    }

    const allowedFields: Record<string, unknown> = {};

    // ROLE
    if (body.role !== undefined) {
      const allowedRoles = ["user", "admin", "owner", "developer"];

      if (!allowedRoles.includes(body.role)) {
        return NextResponse.json({ error: "Noto'g'ri role" }, { status: 400 });
      }

      allowedFields.role = body.role;
    }

    // BAN
    if (body.isBanned !== undefined) {
      if (typeof body.isBanned !== "boolean") {
        return NextResponse.json(
          { error: "isBanned boolean bo'lishi kerak" },
          { status: 400 },
        );
      }

      allowedFields.isBanned = body.isBanned;
    }

    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json(
        { error: "Yangilanadigan ma'lumot topilmadi" },
        { status: 400 },
      );
    }

    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { clerkId: id };

    const updatedUser = await User.findOneAndUpdate(
      filter,
      { $set: allowedFields },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Foydalanuvchi topilmadi" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        ...updatedUser.toObject(),
        id: updatedUser._id.toString(),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH /api/users/[id] xatosi:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Xatolik yuz berdi" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase();

    const { id } = await params;

    if (!id || id === "undefined" || id === "null") {
      return NextResponse.json(
        { error: "Foydalanuvchi ID si yuborilmadi" },
        { status: 400 },
      );
    }

    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { clerkId: id };

    const deletedUser = await User.findOneAndDelete(filter);

    if (!deletedUser) {
      return NextResponse.json(
        { error: "Foydalanuvchi topilmadi" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Foydalanuvchi o'chirildi",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/users/[id] xatosi:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Xatolik yuz berdi" },
      { status: 500 },
    );
  }
}
