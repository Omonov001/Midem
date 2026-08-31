import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import crypto from "crypto";

import Card from "@/models/card.model";
import { connectToDatabase } from "@/lib/mongoose";

export async function GET() {
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

    await connectToDatabase();

    const cards = await Card.find({
      userId: user.id,
      verified: true,
    })
      .select(
        "_id cardLast4 cardholderName country currency verified createdAt",
      )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: cards,
    });
  } catch (error: unknown) {
    console.error("Get Cards API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Kartalarni yuklab bo'lmadi",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Tizimga kirmagansiz!" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { cardNumber, cardholderName, country, currency } = body;

    if (!cardNumber || !cardholderName || !country || !currency) {
      return NextResponse.json(
        { success: false, message: "Karta ma'lumotlari to'liq emas!" },
        { status: 400 },
      );
    }

    const cleanCardNumber = String(cardNumber).replace(/\D/g, "");
    if (!/^\d{16}$/.test(cleanCardNumber)) {
      return NextResponse.json(
        { success: false, message: "Karta raqami 16 xonali bo'lishi kerak!" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const cardLast4 = cleanCardNumber.slice(-4);
    const providerToken = `payout_${crypto.randomUUID()}`;

    const card = await Card.create({
      userId: user.id,
      providerToken,
      cardLast4,
      cardholderName: String(cardholderName).trim(),
      country: String(country).trim().toUpperCase(),
      currency: String(currency).trim().toUpperCase(),
      verified: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Karta muvaffaqiyatli qo'shildi!",
        data: {
          _id: card._id,
          cardLast4: card.cardLast4,
          cardholderName: card.cardholderName,
          country: card.country,
          currency: card.currency,
          verified: card.verified,
          createdAt: card.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Create Card API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Xatolik",
      },
      { status: 500 },
    );
  }
}
