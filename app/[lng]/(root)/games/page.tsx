"use client";

// 1. IMPORTNI O'ZGARTIRDIK: O'zimizning xavfsiz provider
import { useTheme } from "@/components/ui/theme-provider";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import MenuText from "@/components/menus/menu-text";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import {
  IoDesktopOutline,
  IoPhonePortraitOutline,
  IoChevronForward,
} from "react-icons/io5";
import Link from "next/link";

// Swiper stillari
import "swiper/css";
import "swiper/css/pagination";
import useTranslate from "@/hooks/use-translate";

function GamesPage() {
  // 2. resolvedTheme bizning providerdan keladi
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslate();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";

  const categories = [
    {
      id: t("PCGames"),
      title: t("PCGames"),
      desc: t("PCGamesText"),
      icon: <IoDesktopOutline className="size-10" />,
      color: "blue",
      href: "/games/pc-games",
      games: [1, 2, 3, 4, 5, 6],
    },
    {
      id: t("MobileGames"),
      title: t("MobileGames"),
      desc: t("MobileGamesText"),
      icon: <IoPhonePortraitOutline className="size-10" />,
      color: "purple",
      href: "/games/mobile-games",
      games: [1, 2, 3, 4, 5, 6],
    },
  ];

  return (
    <main
      className={cn(
        "relative min-h-screen pt-[10vh] pb-24 px-4 lg:px-12 transition-colors duration-500",
        isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900",
      )}
    >
      <div className="max-w-7xl mx-auto space-y-24">
        {/* 1. HEADER & BIG NAVIGATION BUTTONS */}
        <section className="flex flex-col items-center">
          <MenuText text={t("MainText3")} className="mb-10" />

          <div className="w-full h-auto text-center mb-10 flex items-center justify-center">
            <h1
              className={cn(
                "text-4xl md:text-5xl font-extrabold tracking-tight text-center uppercase transition-all",
                "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500",
              )}
            >
              {t("GamesText")}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                className={cn(
                  "group relative p-8 rounded-[2.5rem] border backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 active:scale-95 overflow-hidden",
                  isDark
                    ? "bg-white/[0.03] border-white/10 hover:border-blue-500/50"
                    : "bg-white border-slate-200 shadow-2xl shadow-slate-200/50 hover:border-blue-400",
                )}
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-6">
                    <div
                      className={cn(
                        "p-5 rounded-2xl text-white shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6",
                        cat.color === "blue"
                          ? "bg-blue-600 shadow-blue-500/40"
                          : "bg-purple-600 shadow-purple-500/40",
                      )}
                    >
                      {cat.icon}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                        {cat.title}
                      </h2>
                      <p className="text-sm font-medium opacity-60">
                        {cat.desc}
                      </p>
                    </div>
                  </div>
                  <IoChevronForward className="size-8 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
                </div>

                {/* Background Glow Effect */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-r",
                    cat.color === "blue"
                      ? "from-blue-600 to-transparent"
                      : "from-purple-600 to-transparent",
                  )}
                />
              </Link>
            ))}
          </div>
        </section>

        {/* 2. SWIPER PREVIEWS */}
        {categories.map((section) => (
          <section key={section.id} className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-2 h-8 rounded-full",
                    section.color === "blue"
                      ? "bg-blue-600 shadow-[0_0_15px_#2563eb]"
                      : "bg-purple-600 shadow-[0_0_15px_#9333ea]",
                  )}
                />
                <h3 className="text-2xl font-black uppercase tracking-widest italic">
                  {t("Top")}{" "}
                  <span
                    className={
                      section.color === "blue"
                        ? "text-blue-500"
                        : "text-purple-500"
                    }
                  >
                    {section.title}
                  </span>
                </h3>
              </div>
              <Link
                href={section.href}
                className="text-sm font-bold uppercase tracking-widest hover:underline opacity-60 hover:opacity-100"
              >
                {t("SeeAll")}
              </Link>
            </div>

            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={20}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              pagination={{ clickable: true, dynamicBullets: true }}
              breakpoints={{
                320: { slidesPerView: 1.3 },
                640: { slidesPerView: 2.3 },
                1024: { slidesPerView: 3.3 },
                1280: { slidesPerView: 4.2 },
              }}
              className="pb-14"
            >
              {section.games.map((game) => (
                <SwiperSlide key={game}>
                  <div
                    className={cn(
                      "group relative aspect-[3/4] rounded-[2rem] border p-2 transition-all duration-500 cursor-pointer overflow-hidden",
                      isDark
                        ? "bg-white/[0.02] border-white/5"
                        : "bg-white border-slate-200 shadow-lg",
                    )}
                  >
                    <div
                      className={cn(
                        "w-full h-full rounded-[1.6rem] relative overflow-hidden",
                        isDark ? "bg-slate-900" : "bg-slate-100",
                      )}
                    >
                      <div
                        className={cn(
                          "absolute inset-0 bg-gradient-to-br transition-all duration-700 opacity-20 group-hover:scale-110",
                          section.color === "blue"
                            ? "from-blue-600"
                            : "from-purple-600",
                        )}
                      />

                      <div className="absolute bottom-5 left-5 z-20">
                        <h4 className="text-lg font-black uppercase tracking-tighter italic">
                          {t("GameName")} {game}
                        </h4>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        ))}
      </div>

      {/* Dinamik stillar */}
      <style jsx global>{`
        .swiper-pagination-bullet {
          background: ${isDark ? "#334155" : "#cbd5e1"} !important;
          opacity: 1 !important;
        }
        .swiper-pagination-bullet-active {
          background: ${isDark ? "#3b82f6" : "#2563eb"} !important;
          width: 25px !important;
          border-radius: 5px !important;
        }
      `}</style>
    </main>
  );
}

export default GamesPage;
