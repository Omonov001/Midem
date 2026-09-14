import type { Metadata } from "next";
import ProfileLayoutClient from "./profile-layout-client";

interface ProfileLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    lng: string;
  }>;
}

type Locale = "uz" | "en" | "tr" | "ru";

const metadataByLocale: Record<
  Locale,
  {
    title: string;
    description: string;
  }
> = {
  uz: {
    title: "Profil — MIDEM",
    description:
      "MIDEM profilingizni boshqaring. O‘yinlaringiz, yutuqlaringiz va platformadagi faoliyatingizni bir joyda kuzating.",
  },
  en: {
    title: "Profile — MIDEM",
    description:
      "Manage your MIDEM profile. View your games, achievements, and activity across the platform in one place.",
  },
  tr: {
    title: "Profil — MIDEM",
    description:
      "MIDEM profilinizi yönetin. Oyunlarınızı, başarılarınızı ve platformdaki aktivitelerinizi tek bir yerden takip edin.",
  },
  ru: {
    title: "Профиль — MIDEM",
    description:
      "Управляйте своим профилем MIDEM. Просматривайте свои игры, достижения и активность на платформе в одном месте.",
  },
};

const localeMap: Record<Locale, string> = {
  uz: "uz_UZ",
  en: "en_US",
  tr: "tr_TR",
  ru: "ru_RU",
};

export async function generateMetadata({
  params,
}: Pick<ProfileLayoutProps, "params">): Promise<Metadata> {
  const { lng } = await params;

  const locale: Locale =
    lng === "en" || lng === "tr" || lng === "ru" ? lng : "uz";

  const metadata = metadataByLocale[locale];

  const canonicalUrl = `https://midem.uz/${locale}/profile`;

  return {
    title: metadata.title,
    description: metadata.description,

    keywords: [
      "MIDEM",
      "MIDEM profile",
      "user profile",
      "game profile",
      "MIDEM account",
      "game platform",
      "game platform Uzbekistan",
    ],

    applicationName: "MIDEM",
    creator: "MIDEM",
    publisher: "MIDEM",

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: canonicalUrl,
      siteName: "MIDEM",
      type: "website",
      locale: localeMap[locale],
    },

    twitter: {
      card: "summary",
      title: metadata.title,
      description: metadata.description,
    },

    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
      },
    },
  };
}

export default function Layout({ children }: ProfileLayoutProps) {
  return <ProfileLayoutClient>{children}</ProfileLayoutClient>;
}
