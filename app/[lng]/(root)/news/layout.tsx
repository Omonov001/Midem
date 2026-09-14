import type { Metadata } from "next";

interface Props {
  children: React.ReactNode;
  params: Promise<{
    lng: string;
  }>;
}

const metadataByLocale = {
  uz: {
    title: "Yangiliklar — MIDEM'dagi so‘nggi yangiliklar",
    description:
      "MIDEM platformasidagi eng so‘nggi yangiliklarni kuzatib boring. Yangi o‘yinlar, muhim yangilanishlar, loyihalar va platformadagi barcha muhim voqealardan birinchilardan bo‘lib xabardor bo‘ling.",
  },

  en: {
    title: "News — Latest Updates from MIDEM",
    description:
      "Stay up to date with the latest news from MIDEM. Discover new games, important updates, exciting projects, and everything happening across the platform.",
  },

  tr: {
    title: "Haberler — MIDEM'den Son Gelişmeler",
    description:
      "MIDEM platformasındaki en son haberleri takip edin. Yeni oyunları, önemli güncellemeleri, heyecan verici projeleri ve platformdaki gelişmeleri ilk siz keşfedin.",
  },

  ru: {
    title: "Новости — Последние новости MIDEM",
    description:
      "Следите за последними новостями MIDEM. Узнавайте о новых играх, важных обновлениях, интересных проектах и значимых событиях на платформе.",
  },
};

export async function generateMetadata({
  params,
}: Pick<Props, "params">): Promise<Metadata> {
  const { lng } = await params;

  const current =
    metadataByLocale[lng as keyof typeof metadataByLocale] ||
    metadataByLocale.uz;

  return {
    title: current.title,
    description: current.description,

    keywords: [
      "MIDEM",
      "MIDEM news",
      "MIDEM yangiliklari",
      "o'yin yangiliklari",
      "game news",
      "game updates",
      "new games",
      "indie games",
      "game platform",
      "Uzbekistan game platform",
      "Uzbek games",
      "o'yinlar",
    ],

    applicationName: "MIDEM",

    authors: [
      {
        name: "MIDEM",
      },
    ],

    creator: "MIDEM",
    publisher: "MIDEM",

    openGraph: {
      title: current.title,
      description: current.description,
      siteName: "MIDEM",
      type: "website",
      url: `https://midem.uz/${lng}/news`,
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

    alternates: {
      canonical: `https://midem.uz/${lng}/news`,
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function NewsLayout({ children }: Props) {
  return children;
}
