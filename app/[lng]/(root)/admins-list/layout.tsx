import type { Metadata } from "next";

interface AdminsListLayoutProps {
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
    title: "Loyiha Ma’murlari — MIDEM",
    description:
      "MIDEM platformasidagi loyiha ma’murlari bilan bog‘laning, savol va takliflaringizni yuboring.",
  },

  en: {
    title: "Project Administrators — MIDEM",
    description:
      "Contact MIDEM project administrators and send your questions, suggestions, or requests.",
  },

  tr: {
    title: "Proje Yöneticileri — MIDEM",
    description:
      "MIDEM proje yöneticileriyle iletişime geçin ve soru, öneri veya taleplerinizi gönderin.",
  },

  ru: {
    title: "Администраторы проекта — MIDEM",
    description:
      "Свяжитесь с администраторами проекта MIDEM и отправьте свои вопросы, предложения или обращения.",
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
}: Pick<AdminsListLayoutProps, "params">): Promise<Metadata> {
  const { lng } = await params;

  const locale: Locale =
    lng === "en" || lng === "tr" || lng === "ru" ? lng : "uz";

  const metadata = metadataByLocale[locale];

  const canonicalUrl = `https://midem.uz/${locale}/admin/admins-list`;

  return {
    title: metadata.title,
    description: metadata.description,

    keywords: [
      "MIDEM",
      "MIDEM Admin",
      "MIDEM administrators",
      "project administrators",
      "admin support",
      "MIDEM support",
      "game platform",
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

    // Admin sahifa Google'da ko'rinmasin
    robots: {
      index: false,
      follow: false,

      googleBot: {
        index: false,
        follow: false,
        "max-image-preview": "none",
        "max-snippet": 0,
        "max-video-preview": 0,
      },
    },
  };
}

export default function AdminsListLayout({ children }: AdminsListLayoutProps) {
  return children;
}
