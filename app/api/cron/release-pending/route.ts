import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Purchase from "@/models/purchase.model";
import User from "@/models/user.model";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const purchases = await Purchase.find({
    status: "paid",
    releasedAt: null,
    availableAt: { $lte: new Date() },
  });

  let released = 0;

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

    // Faqat birinchi marta release qilinsa balansni o'zgartiramiz
    if (result.modifiedCount !== 1) {
      continue;
    }

    await User.findByIdAndUpdate(purchase.developerId, {
      $inc: {
        pendingBalance: -purchase.developerShare,
        availableBalance: purchase.developerShare,
      },
    });

    released++;
  }

  return NextResponse.json({
    success: true,
    released,
  });
}
