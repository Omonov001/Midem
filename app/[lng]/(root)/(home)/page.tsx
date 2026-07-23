"use client";

// Faqat import yo'lini o'zgartirdik
import { useTheme } from "@/components/ui/theme-provider";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Swiper stillari
import "swiper/css";
import "swiper/css/pagination";
import { IoGameController } from "react-icons/io5";
import MenuText from "@/components/menus/menu-text";
import FillterCards from "@/components/fillters/fillter-cards";
import useTranslate from "@/hooks/use-translate";
import Link from "next/link";

function Page() {
  // useTheme endi o'zimizning providerdan keladi
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslate();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";

  return (
    <main
      className={cn(
        "relative pt-[10vh] px-4 lg:px-12",
        isDark ? "bg-slate-950" : "bg-white", // Bu yerda ham isDark ishlaydi
      )}
    >
      <div className="max-w-7xl mx-auto">
        {/* HERO SECTION */}
        <section className="flex flex-col items-center text-center space-y-10">
          <MenuText text={t("MainText")} className="" />

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black">
            {t("HomeText")} <br />
            <span className="bg-gradient-to-b from-blue-500 to-indigo-600 bg-clip-text text-transparent">
              {t("HomeText2")}
            </span>
          </h1>

          <p className="max-w-xl text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-x font-bold">
                {t("HomeText2")}
              </span>
              <span className="absolute inset-0 blur-lg bg-blue-500/20 dark:bg-blue-400/10 -z-10 animate-pulse"></span>
            </span>
            , {t("HomeText3")}
          </p>

          <div className="flex flex-col sm:flex-row gap-5 pt-8">
            <Link href={"/games"}>
              <button className="cursor-pointer px-12 py-5 bg-blue-600 text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-blue-500/30">
                {t("PlayNow")}
              </button>
            </Link>

            <Link href={"/news"}>
              <button
                className={cn(
                  "cursor-pointer px-12 py-5 rounded-2xl font-bold border backdrop-blur-md transition-all hover:scale-105",
                  isDark
                    ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    : "bg-slate-900/5 border-slate-900/10 text-slate-900 hover:bg-slate-900/10",
                )}
              >
                {t("SeeNews")}
              </button>
            </Link>
          </div>
        </section>

        <div className="w-full flex flex-col items-center justify-center py-20">
          <h1
            className={cn(
              "text-4xl md:text-5xl font-extrabold tracking-tight text-center uppercase transition-all",
              "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-blue-400 shadow-blue-500",
            )}
          >
            {t("news")}
          </h1>
        </div>

        {/* INFO CARDS */}
        <section className="w-full py-14">
          <div className="w-full flex items-center justify-between pl-3 pr-3 mb-2">
            <Link href={"/news"} className="flex items-center w-44">
              <h1 className="text-xl text-blue-700">{t("SeeAll")}</h1>
            </Link>
            <FillterCards
              one={t("All")}
              two={t("TheBestOnes")}
              three={t("TheNewestOnes")}
              four={t("TheOldestOnes")}
            />
          </div>
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            pagination={{ clickable: true, dynamicBullets: true }}
            breakpoints={{
              320: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-14"
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <SwiperSlide className="p-3" key={i}>
                <div
                  className={cn(
                    "p-10 rounded-[3rem] border backdrop-blur-xl transition-all duration-500 h-full mb-2 z-30 hover:shadow-blue-600 shadow-2xl",
                    isDark
                      ? "bg-white/[0.03] border-white/10 shadow-2xl"
                      : "bg-slate-900/[0.02] border-slate-900/5 shadow-xl shadow-slate-200/50",
                  )}
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 mb-8" />
                  <div className="h-4 w-32 bg-blue-500/20 rounded-full mb-6" />
                  <div className="space-y-3">
                    <div className="h-3 w-full bg-slate-400/20 rounded-full" />
                    <div className="h-3 w-[70%] bg-slate-400/20 rounded-full" />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <style jsx global>{`
            .swiper-pagination-bullet {
              background: ${isDark ? "#fff" : "#000"} !important;
            }
            .swiper-pagination-bullet-active {
              background: #2563eb !important;
            }
          `}</style>
        </section>

        <div className="w-full flex flex-col items-center justify-center py-10">
          <div className="flex items-center justify-around gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <svg width="0" height="0" className="absolute">
                <linearGradient
                  id="blue-gradient"
                  x1="100%"
                  y1="100%"
                  x2="0%"
                  y2="0%"
                >
                  <stop stopColor="#2563eb" offset="0%" />
                  <stop stopColor="#a855f7" offset="50%" />
                  <stop stopColor="#60a5fa" offset="100%" />
                </linearGradient>
              </svg>
              <IoGameController
                className="size-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                style={{ fill: "url(#blue-gradient)" }}
              />
            </div>
            <h1
              className={cn(
                "text-4xl md:text-5xl font-extrabold tracking-tight text-center uppercase transition-all",
                "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-blue-400 shadow-blue-500",
              )}
            >
              {t("games")}
            </h1>
          </div>
        </div>

        {/* INFO CARDS (O'yinlar qismi) */}
        <section className="w-full py-14">
          <div className="w-full flex items-center justify-between pl-3 pr-3 mb-2">
            <Link href={"/games"} className="flex items-center w-44">
              <h1 className="text-xl text-blue-700">{t("SeeAll")}</h1>
            </Link>
            <FillterCards
              one={t("All")}
              two={t("TheBestOnes")}
              three={t("TheNewestOnes")}
              four={t("TheOldestOnes")}
            />
          </div>
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            pagination={{ clickable: true, dynamicBullets: true }}
            breakpoints={{
              320: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-14"
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <SwiperSlide className="p-3" key={i}>
                <div
                  className={cn(
                    "p-10 rounded-[3rem] border backdrop-blur-xl transition-all duration-500 h-full mb-2 z-30 hover:shadow-blue-600 shadow-2xl",
                    isDark
                      ? "bg-white/[0.03] border-white/10 shadow-2xl"
                      : "bg-slate-900/[0.02] border-slate-900/5 shadow-xl shadow-slate-200/50",
                  )}
                >
                  <div className="w-full h-44 rounded-2xl bg-blue-500/10 mb-8" />
                  <div className="h-4 w-32 bg-blue-500/20 rounded-full mb-6" />
                  <div className="space-y-3">
                    <div className="h-3 w-full bg-slate-400/20 rounded-full" />
                    <div className="h-3 w-[70%] bg-slate-400/20 rounded-full" />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        <div className="w-full flex flex-col items-center justify-center py-10">
          <h1
            className={cn(
              "text-4xl md:text-5xl font-extrabold tracking-tight text-center uppercase transition-all",
              "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-blue-400 shadow-blue-500",
            )}
          >
            {t("Admins")}
          </h1>
        </div>

        <section className="w-full py-14">
          <div className="w-full flex items-center justify-between pl-3 pr-3 mb-2">
            <Link href={"/admins-list"} className="flex items-center w-44">
              <h1 className="text-xl text-blue-700">{t("SeeAll")}</h1>
            </Link>
            <FillterCards
              one={t("All")}
              two={t("TheBestOnes")}
              three={t("TheNewestOnes")}
              four={t("TheOldestOnes")}
            />
          </div>
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            pagination={{ clickable: true, dynamicBullets: true }}
            breakpoints={{
              320: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-14"
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <SwiperSlide className="p-3" key={i}>
                <div
                  className={cn(
                    "p-10 rounded-[3rem] border backdrop-blur-xl transition-all duration-500 h-full mb-2 z-30 hover:shadow-blue-600 shadow-2xl",
                    isDark
                      ? "bg-white/[0.03] border-white/10 shadow-2xl"
                      : "bg-slate-900/[0.02] border-slate-900/5 shadow-xl shadow-slate-200/50",
                  )}
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 mb-8" />
                  <div className="h-4 w-32 bg-blue-500/20 rounded-full mb-6" />
                  <div className="space-y-3">
                    <div className="h-3 w-full bg-slate-400/20 rounded-full" />
                    <div className="h-3 w-[70%] bg-slate-400/20 rounded-full" />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      </div>
    </main>
  );
}

export default Page;
