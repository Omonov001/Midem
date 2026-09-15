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

    console.log("🔐 CRON AUTH:", {
      hasAuthorization: !!authHeader,
      hasCronSecret: !!process.env.CRON_SECRET,
    });

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error("❌ CRON UNAUTHORIZED");

      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    console.log("✅ CRON AUTHORIZED");

    // =========================
    // 2. DATABASE
    // =========================

    await connectToDatabase();

    console.log("✅ DATABASE CONNECTED");

    const now = new Date();

    console.log("🕐 CRON NOW:", now.toISOString());

    // =========================
    // 3. ALL PAID PURCHASES
    // =========================

    const paidPurchases = await Purchase.find({
      status: "paid",
    }).select("_id developerId developerShare status availableAt releasedAt");

    console.log(
      "💰 ALL PAID PURCHASES:",
      paidPurchases.map((purchase) => ({
        id: purchase._id.toString(),
        developerId: purchase.developerId?.toString(),
        developerShare: purchase.developerShare,
        status: purchase.status,
        availableAt: purchase.availableAt,
        releasedAt: purchase.releasedAt,
      })),
    );

    // =========================
    // 4. READY PURCHASES
    // =========================

    const purchases = await Purchase.find({
      status: "paid",
      releasedAt: null,
      availableAt: { $lte: now },
    });

    console.log(
      "🚀 READY PURCHASES:",
      purchases.map((purchase) => ({
        id: purchase._id.toString(),
        developerId: purchase.developerId?.toString(),
        developerShare: purchase.developerShare,
        availableAt: purchase.availableAt,
        releasedAt: purchase.releasedAt,
      })),
    );

    let released = 0;

    // =========================
    // 5. RELEASE BALANCE
    // =========================

    for (const purchase of purchases) {
      console.log("🔄 PROCESSING PURCHASE:", purchase._id.toString());

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

      console.log("📝 PURCHASE UPDATE RESULT:", {
        purchaseId: purchase._id.toString(),
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      });

      // Faqat birinchi marta release qilinsa balance o'zgaradi
      if (result.modifiedCount !== 1) {
        console.warn(
          "⚠️ PURCHASE ALREADY RELEASED OR UPDATE FAILED:",
          purchase._id.toString(),
        );

        continue;
      }

      // =========================
      // 6. FIND DEVELOPER
      // =========================

      console.log("👤 FINDING DEVELOPER:", purchase.developerId?.toString());

      const developer = await User.findByIdAndUpdate(
        purchase.developerId,
        {
          $inc: {
            // Pendingdan olib tashlaymiz
            pendingBalance: -purchase.developerShare,

            // Asosiy balance'ga qo'shamiz
            balance: purchase.developerShare,
          },
        },
        {
          new: true,
        },
      );

      // =========================
      // 7. DEVELOPER NOT FOUND
      // =========================

      if (!developer) {
        console.error("❌ Developer User topilmadi:", purchase.developerId);

        continue;
      }

      // =========================
      // 8. SUCCESS LOG
      // =========================

      console.log("💰 BALANCE RELEASED:", {
        purchaseId: purchase._id.toString(),
        developerId: purchase.developerId.toString(),
        amount: purchase.developerShare,
        newBalance: developer.balance,
        newPendingBalance: developer.pendingBalance,
      });

      released++;
    }

    // =========================
    // 9. RESPONSE
    // =========================

    console.log("✅ CRON FINISHED:", {
      released,
    });

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
