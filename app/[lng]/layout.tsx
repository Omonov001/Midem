import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/ui/theme-provider";
import "./globals.css";
import ScrollToTop from "@/components/settings/scroll-totop";

interface Props {
  children: React.ReactNode;
  params: Promise<{ lng: string }>;
}

export default async function RootLayout({ children, params }: Props) {
  const { lng } = await params;

  // 1. Agar til ruxsat berilganlar orasida bo'lmasa 404
  if (!routing.locales.includes(lng as (typeof routing.locales)[number])) {
    notFound();
  }

  // 2. Serverdan tarjimalarni yuklab olamiz
  const messages = await getMessages();

  return (
    <ClerkProvider>
      <html lang={lng} suppressHydrationWarning>
        <body className="custom-scrollbar overflow-x-hidden antialiased transition-colors duration-300">
          <NextIntlClientProvider messages={messages} locale={lng}>
            <ThemeProvider>
              <div className="min-h-screen text-foreground">
                <ScrollToTop />
                {children}
              </div>
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
