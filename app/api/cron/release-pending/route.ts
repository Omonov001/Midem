import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Purchase from "@/models/purchase.model";
import User from "@/models/user.model";

export async function GET(req: NextRequest) {
  try {
    // =========================
    // 1. CRON AUTH
    // =========================

    const authHeader = req.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // =========================
    // 2. DATABASE
    // =========================

    await connectToDatabase();

    // =========================
    // 3. READY PURCHASES
    // =========================

    const purchases = await Purchase.find({
      status: "paid",
      releasedAt: null,
      availableAt: { $lte: new Date() },
    });

    let released = 0;

    // =========================
    // 4. RELEASE BALANCE
    // =========================

    for (const purchase of purchases) {
      const result = await Purchase.updateOne(
        {
          _id: purchase._id,
          status: "paid",
          releasedAt: null,
        },
        {
          $set: {
            releasedAt: new Date(),
          },
        },
      );

      // Faqat birinchi marta release qilinsa balance o'zgaradi
      if (result.modifiedCount !== 1) {
        continue;
      }

      const developer = await User.findByIdAndUpdate(
        purchase.developerId,
        {
          $inc: {
            // Pendingdan olib tashlaymiz
            pendingBalance: -purchase.developerShare,

            // Asosiy user balance'ga qo'shamiz
            balance: purchase.developerShare,
          },
        },
        {
          new: true,
        },
      );

      if (!developer) {
        console.error("❌ Developer User topilmadi:", purchase.developerId);

        // Purchase release bo'lib ketgan, lekin user topilmagan.
        // Keyingi cron qayta ishlamasligi uchun xatoni log qilamiz.
        continue;
      }

      console.log("💰 BALANCE RELEASED:", {
        purchaseId: purchase._id.toString(),
        developerId: purchase.developerId.toString(),
        amount: purchase.developerShare,
      });

      released++;
    }

    // =========================
    // 5. RESPONSE
    // =========================

    return NextResponse.json({
      success: true,
      released,
    });
  } catch (error) {
    console.error("❌ Balance Release Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Balance release failed",
      },
      {
        status: 500,
      },
    );
  }
}
