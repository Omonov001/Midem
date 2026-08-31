import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/ui/theme-provider";
import ClerkThemeProvider from "@/components/settings/clerk-theme-provider";
import UserHeartbeat from "@/components/settings/user-heartbeat";
import "./globals.css";
import ScrollToTop from "@/components/settings/scroll-totop";
import { ClerkProvider } from "@clerk/nextjs";

interface Props {
  children: React.ReactNode;
  params: Promise<{ lng: string }>;
}

export default async function RootLayout({ children, params }: Props) {
  const { lng } = await params;

  if (!routing.locales.includes(lng as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={lng} suppressHydrationWarning>
      <body className="custom-scrollbar overflow-x-hidden antialiased transition-colors duration-300">
        <ClerkProvider>
          <NextIntlClientProvider messages={messages} locale={lng}>
            <ThemeProvider>
              <ClerkThemeProvider>
                <div className="min-h-screen text-foreground">
                  <ScrollToTop />
                  <UserHeartbeat />
                  {children}
                </div>
              </ClerkThemeProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
