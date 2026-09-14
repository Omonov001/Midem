import type { Metadata } from "next";

interface ContactsLayoutProps {
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
    title: "Bog‘lanish — MIDEM",
    description:
      "MIDEM jamoasi bilan bog‘laning. Savollar, takliflar, texnik muammolar yoki hamkorlik bo‘yicha bizga murojaat qiling.",
  },

  en: {
    title: "Contact — MIDEM",
    description:
      "Get in touch with the MIDEM team. Contact us with questions, suggestions, technical issues, or partnership opportunities.",
  },

  tr: {
    title: "İletişim — MIDEM",
    description:
      "MIDEM ekibiyle iletişime geçin. Sorularınız, önerileriniz, teknik sorunlarınız veya iş birliği fırsatları için bize ulaşın.",
  },

  ru: {
    title: "Контакты — MIDEM",
    description:
      "Свяжитесь с командой MIDEM. Обращайтесь к нам с вопросами, предложениями, техническими проблемами или по вопросам сотрудничества.",
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
}: Pick<ContactsLayoutProps, "params">): Promise<Metadata> {
  const { lng } = await params;

  const locale: Locale =
    lng === "en" || lng === "tr" || lng === "ru" ? lng : "uz";

  const metadata = metadataByLocale[locale];

  const canonicalUrl = `https://midem.uz/${locale}/contacts`;

  return {
    title: metadata.title,

    description: metadata.description,

    keywords: [
      "MIDEM",
      "MIDEM contact",
      "MIDEM contacts",
      "contact MIDEM",
      "game platform",
      "game platform Uzbekistan",
      "Uzbekistan game platform",
      "game developers",
      "o‘yin platformasi",
      "o‘yin ishlab chiquvchilar",
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

export default function ContactsLayout({ children }: ContactsLayoutProps) {
  return children;
}
