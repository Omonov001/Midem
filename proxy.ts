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

// Clerk v6+ da `auth` va `request` parametrlari quyidagicha ishlatiladi:
export default clerkMiddleware(async (auth, request: NextRequest) => {
  if (isProtectedRoute(request)) {
    // ❌ Xato bo'lgan usullar: auth().protect(), await (await auth()).protect()
    // ✅ To'g'ri usul: auth.protect() ning o'zi!
    await auth.protect();
  }

  return intlMiddleware(request);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|webp|png|jpg|jpeg|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
