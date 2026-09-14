import type { Metadata } from "next";
import AdminLayoutClient from "./admin-layout-client";

interface AdminLayoutProps {
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
    title: "Admin Panel — MIDEM",
    description:
      "MIDEM Admin Panel orqali platformadagi o‘yinlar, foydalanuvchilar, yangiliklar va boshqa tizimlarni boshqaring.",
  },

  en: {
    title: "Admin Panel — MIDEM",
    description:
      "Manage games, users, news, and other platform systems through the MIDEM Admin Panel.",
  },

  tr: {
    title: "Yönetici Paneli — MIDEM",
    description:
      "MIDEM Yönetici Paneli üzerinden oyunları, kullanıcıları, haberleri ve platformdaki diğer sistemleri yönetin.",
  },

  ru: {
    title: "Панель администратора — MIDEM",
    description:
      "Управляйте играми, пользователями, новостями и другими системами платформы через панель администратора MIDEM.",
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
}: Pick<AdminLayoutProps, "params">): Promise<Metadata> {
  const { lng } = await params;

  const locale: Locale =
    lng === "en" || lng === "tr" || lng === "ru" ? lng : "uz";

  const metadata = metadataByLocale[locale];

  const canonicalUrl = `https://midem.uz/${locale}/admin`;

  return {
    title: metadata.title,
    description: metadata.description,

    keywords: [
      "MIDEM",
      "MIDEM Admin",
      "Admin Panel",
      "admin dashboard",
      "game management",
      "user management",
      "news management",
      "game platform",
      "MIDEM platform",
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

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
