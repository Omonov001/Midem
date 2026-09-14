import type { Metadata } from "next";
import DeveloperLayoutClient from "./developer-layout-client";

interface DeveloperLayoutProps {
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
    title: "Developer — MIDEM",
    description:
      "MIDEM Developer paneli orqali o‘yinlaringizni boshqaring, yangi o‘yinlaringizni yasang va ularni MIDEM platformasiga joylang.",
  },

  en: {
    title: "Developer — MIDEM",
    description:
      "Manage your games, make new games, and publish them on the MIDEM platform through the Developer panel.",
  },

  tr: {
    title: "Geliştirici — MIDEM",
    description:
      "MIDEM Geliştirici paneli üzerinden oyunlarınızı yönetin, yeni oyunlarınızı yapın ve onları MIDEM platformunda yayınlayın.",
  },

  ru: {
    title: "Разработчик — MIDEM",
    description:
      "Управляйте своими играми, создавайте новые игры и размещайте их на платформе MIDEM через панель разработчика.",
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
}: Pick<DeveloperLayoutProps, "params">): Promise<Metadata> {
  const { lng } = await params;

  const locale: Locale =
    lng === "en" || lng === "tr" || lng === "ru" ? lng : "uz";

  const metadata = metadataByLocale[locale];

  const canonicalUrl = `https://midem.uz/${locale}/developer`;

  return {
    title: metadata.title,
    description: metadata.description,

    keywords: [
      "MIDEM",
      "MIDEM developer",
      "game developer",
      "game development",
      "developer panel",
      "game publishing",
      "publish games",
      "indie developer",
      "game platform",
      "game platform Uzbekistan",
      "Uzbekistan game developers",
      "o‘yin ishlab chiqish",
      "o‘yin yaratuvchilar",
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
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default function DeveloperLayout({ children }: DeveloperLayoutProps) {
  return <DeveloperLayoutClient>{children}</DeveloperLayoutClient>;
}
