import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

import Card from "@/models/card.model";
import { connectToDatabase } from "@/lib/mongoose";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET — bitta kartani olish
export async function GET(_req: Request, context: RouteContext) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Tizimga kirmagansiz!",
        },
        { status: 401 },
      );
    }

    const { id } = await context.params;

    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Karta ID noto'g'ri!",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const card = await Card.findOne({
      _id: id,
      userId: user.id,
    }).select(
      "_id cardholderName cardLast4 expiryDate country currency verified createdAt updatedAt",
    );

    if (!card) {
      return NextResponse.json(
        {
          success: false,
          message: "Karta topilmadi!",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: card,
    });
  } catch (error: unknown) {
    console.error("Get Card API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Serverda xatolik yuz berdi",
      },
      { status: 500 },
    );
  }
}

// DELETE — kartani o'chirish
export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Tizimga kirmagansiz!",
        },
        { status: 401 },
      );
    }

    const { id } = await context.params;

    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Karta ID noto'g'ri!",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // Faqat shu userga tegishli kartani o'chiradi
    const deletedCard = await Card.findOneAndDelete({
      _id: id,
      userId: user.id,
    });

    if (!deletedCard) {
      return NextResponse.json(
        {
          success: false,
          message: "Karta topilmadi yoki sizga tegishli emas!",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Karta muvaffaqiyatli o'chirildi!",
    });
  } catch (error: unknown) {
    console.error("Delete Card API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Serverda xatolik yuz berdi",
      },
      { status: 500 },
    );
  }
}
