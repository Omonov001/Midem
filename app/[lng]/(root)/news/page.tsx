"use client";

import { useTheme } from "@/components/ui/theme-provider";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import FillterData from "@/components/fillters/fillter-data";
import Link from "next/link";
import useTranslate from "@/hooks/use-translate";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface NewsItem {
  _id: string;
  slug: string;
  selectedGame?: string;
  translations: {
    [key: string]: {
      title?: string;
      description?: string;
      content?: string;
      banners?: string[];
    };
  };
  createdAt: string;
}

function Page() {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  const t = useTranslate();

  // URL'dan hozirgi tilni olamiz
  // /uz/news -> uz
  // /ru/news -> ru
  // /en/news -> en
  // /tr/news -> tr
  const currentLang = pathname?.split("/")[1] || "uz";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // API dan yangiliklarni olish
  useEffect(() => {
    if (!mounted) return;

    async function fetchNews() {
      try {
        setLoading(true);

        const res = await fetch(`/api/news/public?filter=${activeFilter}`);

        const result = await res.json();

        if (result.success) {
          setNews(result.data);
        } else {
          setNews([]);
        }
      } catch (error) {
        console.error("Yangiliklarni yuklashda xatolik:", error);

        setNews([]);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [mounted, activeFilter]);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <main
      className={cn(
        "relative min-h-screen pt-[20vh] px-4 lg:px-12 transition-colors duration-500",
        isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900",
      )}
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* HEADER */}
        <section className="flex flex-col items-center text-center space-y-6 mb-16">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-blue-400">
              {t("news")}
            </span>
          </h1>

          <p
            className={cn(
              "max-w-2xl text-lg md:text-xl font-medium leading-relaxed",
              isDark ? "text-slate-400" : "text-slate-600",
            )}
          >
            {t("newsText")}
          </p>
        </section>

        {/* FILTER */}
        <div className="mb-5">
          <FillterData />
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="py-20 text-center font-bold text-lg text-blue-500 animate-pulse">
            Yuklanmoqda...
          </div>
        ) : news.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-medium">
            Hozircha tasdiqlangan yangiliklar mavjud emas.
          </div>
        ) : (
          <section className="w-full pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item) => {
                // Avval URL'dagi tilni qidiramiz
                // Masalan /ru/news bo'lsa translations.ru
                const translation =
                  item.translations?.[currentLang] ||
                  item.translations?.["uz"] ||
                  Object.values(item.translations || {})[0] ||
                  {};

                const title = translation.title || "Sarlavha yo'q";

                // MUHIM:
                // News detail page'da content ishlatiladi.
                // Agar description bo'lmasa content'dan olamiz.
                const description =
                  translation.description ||
                  translation.content ||
                  "Matn mavjud emas...";

                const bannerImg =
                  translation.banners && translation.banners.length > 0
                    ? translation.banners[0]
                    : null;

                const formattedDate = new Date(
                  item.createdAt,
                ).toLocaleDateString(
                  currentLang === "ru"
                    ? "ru-RU"
                    : currentLang === "en"
                      ? "en-US"
                      : currentLang === "tr"
                        ? "tr-TR"
                        : "uz-UZ",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                );

                return (
                  <Link
                    key={item._id}
                    href={`/${currentLang}/news/${item.slug}`}
                  >
                    <div
                      className={cn(
                        "group relative p-6 rounded-[2.5rem] border backdrop-blur-xl transition-all duration-500 hover:-translate-y-2",
                        isDark
                          ? "bg-white/[0.03] border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-blue-500/20"
                          : "bg-white border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-blue-500/10",
                      )}
                    >
                      {/* IMAGE */}
                      <div
                        className={cn(
                          "w-full aspect-video rounded-3xl mb-6 overflow-hidden relative",
                          isDark ? "bg-slate-800" : "bg-slate-200",
                        )}
                      >
                        {bannerImg ? (
                          <Image
                            src={bannerImg}
                            alt={title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 group-hover:opacity-40 transition-opacity" />
                        )}

                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-blue-600 text-[10px] font-bold text-white uppercase tracking-widest">
                          Yangilik
                        </div>
                      </div>

                      {/* CONTENT */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-8 bg-blue-500 rounded-full" />

                          <span className="text-xs font-bold text-blue-500 uppercase tracking-tighter">
                            {item.selectedGame || "Oyin Olami"}
                          </span>
                        </div>

                        {/* TITLE */}
                        <h3
                          className={cn(
                            "text-xl font-extrabold leading-tight line-clamp-2 transition-colors",
                            isDark
                              ? "group-hover:text-blue-400"
                              : "group-hover:text-blue-600",
                          )}
                        >
                          {title}
                        </h3>

                        {/* DESCRIPTION */}
                        <p
                          className={cn(
                            "text-sm line-clamp-3 leading-relaxed",
                            isDark ? "text-slate-400" : "text-slate-500",
                          )}
                        >
                          {description}
                        </p>

                        {/* DATE */}
                        <div
                          className={cn(
                            "flex justify-between items-center pt-4 border-t",
                            isDark ? "border-white/5" : "border-slate-100",
                          )}
                        >
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-widest",
                              isDark ? "text-slate-500" : "text-slate-400",
                            )}
                          >
                            {formattedDate}
                          </span>

                          <span className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-500 underline underline-offset-4">
                            Oqish
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* BACKGROUND */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />

        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>
    </main>
  );
}

export default Page;
