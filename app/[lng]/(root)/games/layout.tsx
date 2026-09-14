import type { Metadata } from "next";

interface Props {
  children: React.ReactNode;
  params: Promise<{
    lng: string;
  }>;
}

const metadataByLocale = {
  uz: {
    title: "O‘yinlar — MIDEM",
    description:
      "MIDEM platformasidagi o‘yinlarni kashf qiling. Windows, Android va iOS uchun turli xil o‘yinlarni toping, yuklab oling va yangi loyihalarni sinab ko‘ring.",
  },

  en: {
    title: "Games — MIDEM",
    description:
      "Discover games on MIDEM. Find games for Windows, Android, and iOS, download them, and explore new projects from developers.",
  },

  tr: {
    title: "Oyunlar — MIDEM",
    description:
      "MIDEM platformasındaki oyunları keşfedin. Windows, Android ve iOS için oyunları bulun, indirin ve yeni projeleri keşfedin.",
  },

  ru: {
    title: "Игры — MIDEM",
    description:
      "Откройте для себя игры на платформе MIDEM. Находите игры для Windows, Android и iOS, скачивайте их и знакомьтесь с новыми проектами разработчиков.",
  },
};

const localeMap: Record<string, string> = {
  uz: "uz_UZ",
  en: "en_US",
  tr: "tr_TR",
  ru: "ru_RU",
};

export async function generateMetadata({
  params,
}: Pick<Props, "params">): Promise<Metadata> {
  const { lng } = await params;

  const current =
    metadataByLocale[lng as keyof typeof metadataByLocale] ||
    metadataByLocale.uz;

  const canonicalUrl = `https://midem.uz/${lng}/games`;

  return {
    title: current.title,

    description: current.description,

    keywords: [
      "MIDEM",
      "games",
      "o'yinlar",
      "o'yinlar yuklab olish",
      "Windows games",
      "Android games",
      "iOS games",
      "PC games",
      "indie games",
      "game platform",
      "game platform Uzbekistan",
      "Uzbekistan games",
      "o'zbek o'yinlari",
    ],

    applicationName: "MIDEM",

    authors: [
      {
        name: "MIDEM",
      },
    ],

    creator: "MIDEM",
    publisher: "MIDEM",

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      title: current.title,
      description: current.description,
      url: canonicalUrl,
      siteName: "MIDEM",
      type: "website",
      locale: localeMap[lng] || "uz_UZ",
    },

    twitter: {
      card: "summary_large_image",
      title: current.title,
      description: current.description,
    },

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default function GamesLayout({ children }: Props) {
  return children;
}
