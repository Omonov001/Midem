import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/mongoose";
import Game from "@/models/game.model";

interface Props {
  children: React.ReactNode;
  params: Promise<{
    lng: string;
    slug: string;
  }>;
}

interface GameLanguageData {
  title?: string;
  subtitle?: string;
  Maindescription?: string;
  description?: string;
  category?: string;
  iconPreview?: string | null;
  screenshotPreviews?: string[];
  whatsNew?: string[];
}

interface GameData {
  _id?: string;
  slug?: string;
  rating?: number;
  priceType?: string;
  price?: string | number;
  gameDownloads?: number;
  langData?: Record<string, GameLanguageData>;
  techData?: {
    developer?: string;
    releaseDate?: string;
    version?: string;
    downloadSize?: string;
    inGameSize?: string;
  };
}

const SITE_URL = "https://midem.uz";

const localeMap: Record<string, string> = {
  uz: "uz_UZ",
  en: "en_US",
  tr: "tr_TR",
  ru: "ru_RU",
};

async function getGame(slug: string): Promise<GameData | null> {
  try {
    await connectToDatabase();

    const game = await Game.findOne({ slug })
      .select("slug langData techData rating priceType price gameDownloads")
      .lean();

    if (!game) {
      return null;
    }

    return game as unknown as GameData;
  } catch (error) {
    console.error("GAME METADATA ERROR:", error);
    return null;
  }
}

function createDescription(langData: GameLanguageData): string {
  const rawDescription =
    langData.Maindescription?.trim() ||
    langData.description?.trim() ||
    langData.subtitle?.trim() ||
    "MIDEM platformasidagi ushbu o‘yinni kashf qiling va o‘yin haqida batafsil ma’lumot oling.";

  if (rawDescription.length <= 160) {
    return rawDescription;
  }

  return `${rawDescription.slice(0, 157).trim()}...`;
}

export async function generateMetadata({
  params,
}: Pick<Props, "params">): Promise<Metadata> {
  const { lng, slug } = await params;

  const game = await getGame(slug);

  // ❌ O'yin topilmasa
  if (!game) {
    return {
      title: "O‘yin topilmadi — MIDEM",
      description:
        "Ushbu o‘yin topilmadi yoki mavjud emas. MIDEM platformasidagi boshqa o‘yinlarni kashf qiling.",

      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const translations = game.langData || {};

  // Page.tsx dagi til fallback'iga mos:
  // lng -> uz -> en -> birinchi mavjud til
  const translation =
    translations[lng] ||
    translations["uz"] ||
    translations["en"] ||
    Object.values(translations)[0] ||
    {};

  const title = translation.title?.trim() || "O‘yin — MIDEM";

  const description = createDescription(translation);

  const category = translation.category?.trim() || "Games";

  const developer = game.techData?.developer?.trim() || "MIDEM Developer";

  // Avval icon, bo'lmasa birinchi screenshot
  const image =
    translation.iconPreview || translation.screenshotPreviews?.[0] || undefined;

  const canonicalUrl = `${SITE_URL}/${lng}/games/${slug}`;

  const keywords = [
    "MIDEM",
    title,
    category,
    developer,
    "game",
    "games",
    "o'yin",
    "o'yinlar",
    "game platform",
    "game platform Uzbekistan",
    "Uzbekistan games",
    "o'zbek o'yinlari",
    "indie games",
    "PC games",
    "Android games",
    "iOS games",
  ];

  return {
    title: `${title} — MIDEM`,

    description,

    keywords,

    applicationName: "MIDEM",

    authors: [
      {
        name: developer,
      },
    ],

    creator: developer,

    publisher: "MIDEM",

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      title: `${title} — MIDEM`,
      description,
      url: canonicalUrl,
      siteName: "MIDEM",
      type: "website",
      locale: localeMap[lng] || "uz_UZ",

      ...(image
        ? {
            images: [
              {
                url: image,
                width: 1200,
                height: 630,
                alt: title,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: image ? "summary_large_image" : "summary",

      title: `${title} — MIDEM`,

      description,

      ...(image
        ? {
            images: [image],
          }
        : {}),
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

export default function GameDetailLayout({ children }: Props) {
  return children;
}
