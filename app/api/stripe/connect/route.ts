import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

import User from "@/models/user.model";
import { connectToDatabase } from "@/lib/mongoose";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  try {
    // ============================================
    // 1. CLERK USER
    // ============================================
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Tizimga kirmagansiz!",
        },
        { status: 401 },
      );
    }

    // ============================================
    // 2. DATABASE
    // ============================================
    await connectToDatabase();

    const user = await User.findOne({
      clerkId: clerkUser.id,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Foydalanuvchi topilmadi!",
        },
        { status: 404 },
      );
    }

    // ============================================
    // 3. DEVELOPER CHECK
    // ============================================
    if (user.role !== "developer") {
      return NextResponse.json(
        {
          success: false,
          message: "Faqat developerlar payout ulashi mumkin!",
        },
        { status: 403 },
      );
    }

    // ============================================
    // 4. EXISTING ACCOUNT
    // ============================================
    let stripeAccountId = user.stripeAccountId;

    // ============================================
    // 5. CREATE STRIPE V2 ACCOUNT
    // ============================================
    if (!stripeAccountId) {
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? undefined;

      if (!email) {
        return NextResponse.json(
          {
            success: false,
            message: "Email manzili topilmadi!",
          },
          { status: 400 },
        );
      }

      const account = await stripe.v2.core.accounts.create({
        display_name: user.name || clerkUser.firstName || "MIDEM Developer",

        contact_email: email,

        identity: {
          country: "UZ",
          entity_type: "individual",
        },

        dashboard: "express",

        configuration: {
          merchant: {
            capabilities: {
              card_payments: {
                requested: true,
              },
            },
          },

          recipient: {
            capabilities: {
              stripe_balance: {
                stripe_transfers: {
                  requested: true,
                },
              },
            },
          },
        },

        defaults: {
          responsibilities: {
            fees_collector: "application",
            losses_collector: "application",
          },
        },

        metadata: {
          midemUserId: user._id.toString(),
          clerkId: clerkUser.id,
        },
      });

      // ==========================================
      // 6. SAVE ACCOUNT ID
      // ==========================================
      stripeAccountId = account.id;

      user.stripeAccountId = stripeAccountId;

      await user.save();
    }

    // ============================================
    // 7. CREATE ONBOARDING LINK
    // ============================================
    const accountLink = await stripe.v2.core.accountLinks.create({
      account: stripeAccountId,

      use_case: {
        type: "account_onboarding",

        account_onboarding: {
          configurations: ["merchant", "recipient"],

          refresh_url:
            `${process.env.NEXT_PUBLIC_APP_URL}` +
            `/uz/profile/payout?refresh=true`,

          return_url:
            `${process.env.NEXT_PUBLIC_APP_URL}` +
            `/uz/profile/payout?success=true`,

          collection_options: {
            fields: "currently_due",
            future_requirements: "omit",
          },
        },
      },
    });

    // ============================================
    // 8. SUCCESS
    // ============================================
    return NextResponse.json({
      success: true,
      url: accountLink.url,
      stripeAccountId,
    });
  } catch (error: unknown) {
    console.error("Stripe Connect V2 Error:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          code: error.code ?? null,
          type: error.type ?? null,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Stripe Connect V2 xatosi!",
      },
      { status: 500 },
    );
  }
}
