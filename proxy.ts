import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["en", "uz", "tr", "ru"],
  defaultLocale: "uz",
  localePrefix: "always",
  localeDetection: true,
});

const isProtectedRoute = createRouteMatcher([
  "/:locale/dashboard(.*)",
  "/:locale/profile(.*)",
]);

// API va Webhook yo'llarini aniqlaymiz
const isApiOrWebhookRoute = createRouteMatcher(["/api(.*)", "/trpc(.*)"]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // 1. Himoyalangan sahifalarni tekshirish
  if (isProtectedRoute(request)) {
    await auth.protect();
  }

  // 2. Agar so'rov API yoki Webhook bo'lsa, intl (yo'naltirish) qilmasdan o'tkazib yuboramiz!
  if (isApiOrWebhookRoute(request)) {
    return;
  }

  // 3. Qolgan barcha oddiy sahifalar uchun intl ni ishlatamiz
  return intlMiddleware(request);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|webp|png|jpg|jpeg|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
