import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

import User from "@/models/user.model";
import { connectToDatabase } from "@/lib/mongoose";

const intlMiddleware = createMiddleware({
  locales: ["en", "uz", "tr", "ru"],
  defaultLocale: "uz",
  localePrefix: "always",
  localeDetection: true,
});

// =========================================================
// PUBLIC ROUTE'LAR
// Login qilmagan user ham kira oladi
// =========================================================

const isPublicRoute = createRouteMatcher([
  "/",
  "/:locale",
  "/:locale/news",
  "/:locale/news/(.*)",
  "/:locale/games",
  "/:locale/games/(.*)",
  "/:locale/contact",
]);

// Developer panel
const isDeveloperRoute = createRouteMatcher(["/:locale/developer(.*)"]);

// Admin panel
const isAdminRoute = createRouteMatcher(["/:locale/admin(.*)"]);

// Owner panel
const isOwnerRoute = createRouteMatcher(["/:locale/owner(.*)"]);

// Banned page
const isBannedRoute = createRouteMatcher(["/:locale/banned"]);

// API va Webhook
const isApiOrWebhookRoute = createRouteMatcher(["/api(.*)", "/trpc(.*)"]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // =========================================================
  // BANNED USER CHECK
  // =========================================================

  const { userId } = await auth();

  if (userId && !isBannedRoute(request)) {
    try {
      await connectToDatabase();

      const user = await User.findOne({ clerkId: userId })
        .select("isBanned")
        .lean();

      if (user?.isBanned === true) {
        const pathname = request.nextUrl.pathname;

        const locale =
          pathname.split("/")[1] &&
          ["en", "uz", "tr", "ru"].includes(pathname.split("/")[1])
            ? pathname.split("/")[1]
            : "uz";

        // API / TRPC
        if (isApiOrWebhookRoute(request)) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "Your account has been banned.",
            }),
            {
              status: 403,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }

        // Oddiy sahifa
        return Response.redirect(new URL(`/${locale}/banned`, request.url));
      }
    } catch (error) {
      console.error("BAN CHECK ERROR:", error);
    }
  }

  // =========================================================
  // LOGIN PROTECTION
  // Public bo'lmagan barcha sahifalar login talab qiladi
  // =========================================================

  if (
    !isPublicRoute(request) &&
    !isApiOrWebhookRoute(request) &&
    !isBannedRoute(request)
  ) {
    await auth.protect();
  }

  // =========================================================
  // PANEL ROLE PROTECTION
  // =========================================================

  if (
    isDeveloperRoute(request) ||
    isAdminRoute(request) ||
    isOwnerRoute(request)
  ) {
    const { userId } = await auth();

    // Login qilmagan
    if (!userId) {
      return Response.redirect(new URL("/uz", request.url));
    }

    try {
      await connectToDatabase();

      const user = await User.findOne({ clerkId: userId })
        .select("role")
        .lean();

      const role = user?.role;

      // Developer → faqat developer
      if (isDeveloperRoute(request) && role !== "developer") {
        return Response.redirect(new URL("/uz", request.url));
      }

      // Admin → faqat admin
      if (isAdminRoute(request) && role !== "admin") {
        return Response.redirect(new URL("/uz", request.url));
      }

      // Owner → faqat owner
      if (isOwnerRoute(request) && role !== "owner") {
        return Response.redirect(new URL("/uz", request.url));
      }
    } catch (error) {
      console.error("ROLE CHECK ERROR:", error);

      return Response.redirect(new URL("/uz", request.url));
    }
  }

  // =========================================================
  // API / WEBHOOK
  // =========================================================

  if (isApiOrWebhookRoute(request)) {
    return;
  }

  // =========================================================
  // NEXT-INTL
  // =========================================================

  return intlMiddleware(request);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|webp|png|jpg|jpeg|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4)).*)",
    "/(api|trpc)(.*)",
  ],
};
