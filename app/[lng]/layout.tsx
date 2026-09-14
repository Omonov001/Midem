import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

import { ThemeProvider } from "@/components/ui/theme-provider";
import ClerkThemeProvider from "@/components/settings/clerk-theme-provider";
import UserHeartbeat from "@/components/settings/user-heartbeat";
import GlobalLoadingProvider from "@/components/settings/global-loading-provider";
import ScrollToTop from "@/components/settings/scroll-totop";

import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

import "./globals.css";

interface Props {
  children: React.ReactNode;
  params: Promise<{ lng: string }>;
}

export async function generateMetadata({
  params,
}: Pick<Props, "params">): Promise<Metadata> {
  const { lng } = await params;

  const metadata = {
    uz: {
      title: "MIDEM — O‘yinlar va Game Developerlar Platformasi",
      description:
        "MIDEM — O‘zbekiston game developerlar uchun o‘yinlarini joylash, ulashish va rivojlantirish platformasi.",
    },

    en: {
      title: "MIDEM — Game Developer Platform",
      description:
        "MIDEM is a platform for game developers to publish, share, and grow their games.",
    },

    tr: {
      title: "MIDEM — Oyun Geliştirici Platformu",
      description:
        "MIDEM, oyun geliştiricilerinin oyunlarını yayınlaması, paylaşması ve geliştirmesi için bir platformdur.",
    },

    ru: {
      title: "MIDEM — Платформа для разработчиков игр",
      description:
        "MIDEM — платформа для разработчиков игр, где можно публиковать, делиться и развивать свои игры.",
    },
  };

  const current = metadata[lng as keyof typeof metadata] ?? metadata.uz;

  return {
    title: current.title,

    description: current.description,

    applicationName: "MIDEM",

    keywords: [
      "MIDEM",
      "game developer",
      "game platform",
      "games",
      "Uzbekistan games",
      "game development",
      "indie games",
      "o'yinlar",
      "o'yin dasturlash",
    ],

    authors: [{ name: "MIDEM" }],

    creator: "MIDEM",

    publisher: "MIDEM",

    metadataBase: new URL("https://midem.uz"),

    openGraph: {
      title: current.title,
      description: current.description,
      siteName: "MIDEM",
      type: "website",

      locale:
        lng === "uz"
          ? "uz_UZ"
          : lng === "ru"
            ? "ru_RU"
            : lng === "tr"
              ? "tr_TR"
              : "en_US",
    },

    twitter: {
      card: "summary_large_image",
      title: current.title,
      description: current.description,
    },

    robots: {
      index: true,
      follow: true,
    },

    icons: {
      icon: "/MI.jpg",
    },
  };
}

export default async function RootLayout({ children, params }: Props) {
  const { lng } = await params;

  if (!routing.locales.includes(lng as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={lng} suppressHydrationWarning>
      <body className="custom-scrollbar overflow-x-hidden antialiased transition-colors duration-300">
        <ClerkProvider>
          <NextIntlClientProvider messages={messages} locale={lng}>
            <ThemeProvider>
              <ClerkThemeProvider>
                <GlobalLoadingProvider>
                  <div className="min-h-screen text-foreground">
                    <ScrollToTop />

                    <UserHeartbeat />

                    {children}
                  </div>
                </GlobalLoadingProvider>
              </ClerkThemeProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
