import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/mongoose";
import { News } from "@/models/new.model";

interface Props {
  children: React.ReactNode;
  params: Promise<{
    lng: string;
    slug: string;
  }>;
}

interface Translation {
  title?: string;
  description?: string;
  content?: string;
  banners?: string[];
}

const SITE_URL = "https://midem.uz";

const localeMap: Record<string, string> = {
  uz: "uz_UZ",
  en: "en_US",
  tr: "tr_TR",
  ru: "ru_RU",
};

async function getNews(slug: string) {
  try {
    await connectToDatabase();

    const news = await News.findOne({
      slug,
      visibility: "public",
      request: "approved",
    })
      .select("slug translations")
      .lean();

    if (!news) {
      return null;
    }

    return news;
  } catch (error) {
    console.error("NEWS METADATA ERROR:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: Pick<Props, "params">): Promise<Metadata> {
  const { lng, slug } = await params;

  const news = await getNews(slug);

  // Yangilik topilmasa
  if (!news) {
    return {
      title: "Yangilik topilmadi — MIDEM",
      description:
        "Ushbu yangilik topilmadi yoki o‘chirilgan. MIDEM platformasidagi boshqa yangiliklarni kashf qiling.",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const translations = (news.translations as Record<string, Translation>) || {};

  // Til bo‘yicha translation
  const translation =
    translations[lng] ||
    translations.uz ||
    Object.values(translations)[0] ||
    {};

  const title = translation.title?.trim() || "MIDEM yangiliklari";

  const rawDescription =
    translation.description?.trim() ||
    translation.content?.trim() ||
    "MIDEM platformasidagi so‘nggi yangiliklar, o‘yinlar va muhim yangilanishlarni kuzatib boring.";

  // Google description uchun optimal uzunlik
  const description =
    rawDescription.length > 160
      ? `${rawDescription.slice(0, 157).trim()}...`
      : rawDescription;

  // Banner
  const banner = translation.banners?.length
    ? translation.banners[0]
    : undefined;

  const canonicalUrl = `${SITE_URL}/${lng}/news/${encodeURIComponent(slug)}`;

  return {
    title: `${title} — MIDEM`,

    description,

    keywords: [
      "MIDEM",
      title,
      "MIDEM news",
      "MIDEM yangiliklari",
      "o'yin yangiliklari",
      "game news",
      "game updates",
      "game platform",
      "Uzbekistan games",
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
      title: `${title} — MIDEM`,
      description,
      url: canonicalUrl,
      siteName: "MIDEM",
      type: "article",

      locale: localeMap[lng] || "uz_UZ",

      ...(banner
        ? {
            images: [
              {
                url: banner,
                width: 1200,
                height: 630,
                alt: title,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: banner ? "summary_large_image" : "summary",

      title: `${title} — MIDEM`,

      description,

      ...(banner
        ? {
            images: [banner],
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

export default function NewsDetailLayout({ children }: Props) {
  return children;
}
