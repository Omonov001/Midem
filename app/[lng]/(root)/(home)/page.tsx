/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useTheme } from "@/components/ui/theme-provider";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import {
  IoGameController,
  IoArrowForward,
  IoNewspaper,
  IoPlay,
  IoSparkles,
  IoShieldCheckmark,
} from "react-icons/io5";

import "swiper/css";
import "swiper/css/pagination";

import FillterCards from "@/components/fillters/fillter-cards";
import useTranslate from "@/hooks/use-translate";

function Page() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslate();

  const [homeData, setHomeData] = useState<{
    games: any[];
    news: any[];
    admins: any[];
  }>({
    games: [],
    news: [],
    admins: [],
  });

  const [newsFilter, setNewsFilter] = useState<"all" | "newest" | "oldest">(
    "all",
  );

  const [gamesFilter, setGamesFilter] = useState<"all" | "newest" | "oldest">(
    "all",
  );

  useEffect(() => {
    fetch("/api/home")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setHomeData({
            games: data.games || [],
            news: data.news || [],
            admins: data.admins || [],
          });
        }
      })
      .catch((error) => console.error("HOME DATA ERROR:", error));
  }, []);

  const filteredNews = [...homeData.news].sort((a, b) => {
    if (newsFilter === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    if (newsFilter === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    return 0;
  });

  const filteredGames = [...homeData.games].sort((a, b) => {
    if (gamesFilter === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    if (gamesFilter === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    return 0;
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  const surface = isDark
    ? "border-white/[0.07] bg-white/[0.025]"
    : "border-slate-200/80 bg-white";

  const softSurface = isDark
    ? "border-white/[0.06] bg-white/[0.018]"
    : "border-slate-200/70 bg-slate-50/80";

  const muted = isDark ? "text-slate-400" : "text-slate-500";
  const heading = isDark ? "text-white" : "text-slate-950";

  return (
    <main
      className={cn(
        "relative my-5 min-h-screen overflow-hidden px-4 pb-24 pt-[9vh] md:px-6 lg:px-10",
        isDark ? "bg-slate-950/60" : "bg-[#f7f9fc]",
      )}
    >
      {/* BACKGROUND */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={cn(
            "absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full blur-[150px]",
            isDark ? "bg-blue-600/[0.08]" : "bg-blue-500/[0.07]",
          )}
        />

        <div
          className={cn(
            "absolute -right-40 top-[30%] h-[600px] w-[600px] rounded-full blur-[170px]",
            isDark ? "bg-indigo-600/[0.07]" : "bg-indigo-500/[0.06]",
          )}
        />

        <div
          className={cn(
            "absolute bottom-[-200px] left-[30%] h-[500px] w-[500px] rounded-full blur-[160px]",
            isDark ? "bg-purple-600/[0.04]" : "bg-purple-500/[0.04]",
          )}
        />

        <div
          className={cn(
            "absolute inset-0 opacity-[0.025]",
            "[background-image:linear-gradient(to_right,#64748b_1px,transparent_1px),linear-gradient(to_bottom,#64748b_1px,transparent_1px)]",
            "[background-size:55px_55px]",
          )}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1550px]">
        {/* HERO */}

        <section
          className={cn(
            "relative overflow-hidden rounded-[2rem] border md:rounded-[2.5rem]",
            surface,
            "shadow-2xl",
            isDark ? "shadow-black/40" : "shadow-slate-300/30",
          )}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[20%] top-[-100px] h-[300px] w-[300px] rounded-full border border-blue-500/[0.07]" />
            <div className="absolute right-[23%] top-[-65px] h-[230px] w-[230px] rounded-full border border-indigo-500/[0.06]" />
          </div>

          <div className="grid min-h-[680px] grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
            {/* HERO LEFT */}

            <div className="relative flex flex-col justify-center p-7 sm:p-10 md:p-14 lg:p-16 xl:p-20">
              <div className="pointer-events-none absolute -left-[280px] top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full border border-blue-500/[0.05]" />

              <div className="relative z-10 max-w-3xl">
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/[0.08] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-500">
                  <IoSparkles />
                  MIDEM beta 1.00
                </div>

                <h1
                  className={cn(
                    "max-w-3xl text-5xl font-black leading-[0.96] tracking-[-0.055em] sm:text-6xl md:text-7xl xl:text-[6.5rem]",
                    heading,
                  )}
                >
                  {t("HomeText")}
                  <br />

                  <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                    {t("HomeText2")}
                  </span>
                </h1>

                <p
                  className={cn(
                    "mt-7 max-w-2xl text-base leading-7 sm:text-lg",
                    muted,
                  )}
                >
                  <span className="font-bold text-blue-500">
                    {t("HomeText2")}
                  </span>
                  , {t("HomeText3")}
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link href="/games" className="w-full sm:w-auto">
                    <button className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-blue-600 px-7 py-4 font-bold text-white shadow-xl shadow-blue-600/20 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-500 hover:shadow-blue-600/30">
                      <IoPlay className="text-lg transition-transform group-hover:scale-110" />
                      {t("PlayNow")}
                      <IoArrowForward className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </Link>

                  <Link href="/news" className="w-full sm:w-auto">
                    <button
                      className={cn(
                        "group flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border px-7 py-4 font-bold transition-all duration-300 hover:-translate-y-1 sm:w-auto",
                        isDark
                          ? "border-white/10 bg-white/[0.035] text-white hover:bg-white/[0.07]"
                          : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                      )}
                    >
                      <IoNewspaper />
                      {t("SeeNews")}
                    </button>
                  </Link>
                </div>

                {/* STATS */}

                <div className="mt-12 flex flex-wrap items-center gap-6 sm:gap-9">
                  <div>
                    <div className={cn("text-2xl font-black", heading)}>
                      {homeData.games.length > 99
                        ? "100+"
                        : homeData.games.length}
                    </div>

                    <div className="text-xs text-slate-500">O&apos;yinlar</div>
                  </div>

                  <div className="h-9 w-px bg-slate-500/20" />

                  <div>
                    <div className={cn("text-2xl font-black", heading)}>
                      24/7
                    </div>

                    <div className="text-xs text-slate-500">MIDEM</div>
                  </div>

                  <div className="h-9 w-px bg-slate-500/20" />

                  <div>
                    <div
                      className={cn(
                        "flex items-center gap-2 text-2xl font-black",
                        heading,
                      )}
                    >
                      <IoShieldCheckmark className="text-blue-500" />
                      100%
                    </div>

                    <div className="text-xs text-slate-500">Xavfsiz</div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT LIVE PANEL */}

            <div
              className={cn(
                "grid grid-rows-2 border-t lg:border-l lg:border-t-0",
                isDark ? "border-white/[0.07]" : "border-slate-200/80",
              )}
            >
              {/* NEWS LIVE SWIPER */}

              <div
                className={cn(
                  "relative min-h-[330px] overflow-hidden p-5 sm:p-7",
                  isDark ? "bg-white/[0.012]" : "bg-slate-50/30",
                )}
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                      <IoNewspaper className="text-xl text-blue-500" />
                    </div>

                    <div>
                      <h2 className={cn("text-lg font-black", heading)}>
                        {t("news")}
                      </h2>

                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-500">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                        LIVE
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/news"
                    className="flex items-center gap-1 text-sm font-bold text-blue-500 transition-transform hover:translate-x-1"
                  >
                    {t("SeeAll")}
                    <IoArrowForward />
                  </Link>
                </div>

                <Swiper
                  modules={[Autoplay, Pagination]}
                  direction="vertical"
                  slidesPerView={2}
                  spaceBetween={10}
                  loop={homeData.news.length > 2}
                  speed={750}
                  autoplay={{
                    delay: 2600,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }}
                  pagination={
                    homeData.news.length > 0
                      ? {
                          clickable: true,
                          dynamicBullets: true,
                        }
                      : false
                  }
                  className="header-news-swiper h-[235px]"
                >
                  {homeData.news.length > 0 ? (
                    homeData.news.slice(0, 6).map((item) => (
                      <SwiperSlide key={item._id || item.id || item.slug}>
                        <Link
                          href={`/news/${item.slug}`}
                          className={cn(
                            "group relative flex h-full overflow-hidden rounded-2xl border p-4 transition-all",
                            softSurface,
                            "hover:border-blue-500/30",
                          )}
                        >
                          <div className="absolute right-[-25px] top-[-25px] h-24 w-24 rounded-full bg-blue-500/[0.07] blur-2xl transition-all group-hover:bg-blue-500/[0.15]" />

                          <div className="relative flex w-full items-center gap-4">
                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-blue-500/10">
                              {item.translations?.uz?.banners?.[0] ? (
                                <img
                                  src={item.translations.uz.banners[0]}
                                  alt={item.translations.uz.title || "News"}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <IoNewspaper className="text-blue-500" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3
                                className={cn(
                                  "truncate text-sm font-bold",
                                  heading,
                                )}
                              >
                                {item.translations?.uz?.title || "News"}
                              </h3>

                              <p
                                className={cn(
                                  "mt-1 line-clamp-2 text-xs",
                                  muted,
                                )}
                              >
                                {(item.translations?.uz?.content || "")
                                  .replace(/<[^>]*>/g, "")
                                  .trim()}
                              </p>
                            </div>

                            <IoArrowForward className="shrink-0 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-blue-500" />
                          </div>
                        </Link>
                      </SwiperSlide>
                    ))
                  ) : (
                    <SwiperSlide>
                      <div
                        className={cn(
                          "flex h-full w-full items-center justify-center rounded-2xl border border-dashed px-5",
                          isDark
                            ? "border-white/10 bg-white/[0.02]"
                            : "border-slate-200 bg-white/60",
                        )}
                      >
                        <div className="flex w-full max-w-[280px] items-center gap-4">
                          <div
                            className={cn(
                              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                              isDark ? "bg-blue-500/10" : "bg-blue-50",
                            )}
                          >
                            <IoNewspaper className="text-xl text-blue-500/70" />
                          </div>

                          <div className="min-w-0">
                            <h3
                              className={cn(
                                "truncate text-sm font-black",
                                heading,
                              )}
                            >
                              {t("news")}
                            </h3>
                            <p className={cn("mt-1 text-xs leading-5", muted)}>
                              Hozircha yangiliklar mavjud emas
                            </p>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  )}
                </Swiper>
              </div>

              {/* GAMES LIVE SWIPER */}

              <div
                className={cn(
                  "relative min-h-[330px] overflow-hidden border-t p-5 sm:p-7",
                  isDark ? "border-white/[0.07]" : "border-slate-200/80",
                )}
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                      <IoGameController className="text-xl text-indigo-500" />
                    </div>

                    <div>
                      <h2 className={cn("text-lg font-black", heading)}>
                        {t("games")}
                      </h2>

                      <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                        MIDEM
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/games"
                    className="flex items-center gap-1 text-sm font-bold text-indigo-500 transition-transform hover:translate-x-1"
                  >
                    {t("SeeAll")}
                    <IoArrowForward />
                  </Link>
                </div>

                <Swiper
                  modules={[Autoplay, Pagination]}
                  slidesPerView={2}
                  spaceBetween={10}
                  loop={homeData.games.length > 2}
                  speed={700}
                  autoplay={{
                    delay: 2300,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }}
                  pagination={
                    homeData.games.length > 0
                      ? {
                          clickable: true,
                          dynamicBullets: true,
                        }
                      : false
                  }
                  breakpoints={{
                    0: {
                      slidesPerView: 1,
                    },
                    500: {
                      slidesPerView: 2,
                    },
                  }}
                  className="header-games-swiper h-[235px]"
                >
                  {homeData.games.length > 0 ? (
                    homeData.games.slice(0, 6).map((item) => (
                      <SwiperSlide key={item._id || item.id || item.slug}>
                        <Link
                          href={`/games/${item.slug}`}
                          className={cn(
                            "group relative block h-full overflow-hidden rounded-2xl border",
                            softSurface,
                          )}
                        >
                          <div className="relative h-[115px] overflow-hidden bg-gradient-to-br from-blue-500/[0.12] via-indigo-500/[0.08] to-purple-500/[0.08]">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(99,102,241,0.18),transparent_45%)]" />

                            {item.langData?.uz?.iconPreview ? (
                              <img
                                src={item.langData.uz.iconPreview}
                                alt={item.langData.uz.title || "Game"}
                                className="absolute inset-0 h-full w-full object-contain"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <IoGameController className="text-5xl text-indigo-500/20" />
                              </div>
                            )}

                            <div className="absolute bottom-2 left-2 rounded-md border border-white/10 bg-black/30 px-2 py-1 text-[9px] font-bold text-white backdrop-blur-md">
                              {item.langData?.uz?.title || "MIDEM"}
                            </div>
                          </div>

                          <div className="p-3">
                            <h3
                              className={cn(
                                "truncate text-sm font-bold",
                                heading,
                              )}
                            >
                              {item.langData?.uz?.title || "Game"}
                            </h3>

                            <p
                              className={cn("mt-2 line-clamp-2 text-xs", muted)}
                            >
                              {item.langData?.uz?.Maindescription || "Game"}
                            </p>
                          </div>
                        </Link>
                      </SwiperSlide>
                    ))
                  ) : (
                    <SwiperSlide>
                      <div
                        className={cn(
                          "flex h-full w-full items-center justify-center rounded-2xl border border-dashed px-5",
                          isDark
                            ? "border-white/10 bg-white/[0.02]"
                            : "border-slate-200 bg-white/60",
                        )}
                      >
                        <div className="flex w-full max-w-[280px] items-center gap-4">
                          <div
                            className={cn(
                              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                              isDark ? "bg-indigo-500/10" : "bg-indigo-50",
                            )}
                          >
                            <IoGameController className="text-xl text-indigo-500/70" />
                          </div>

                          <div className="min-w-0">
                            <h3
                              className={cn(
                                "truncate text-sm font-black",
                                heading,
                              )}
                            >
                              {t("games")}
                            </h3>
                            <p className={cn("mt-1 text-xs leading-5", muted)}>
                              Hozircha o‘yinlar mavjud emas
                            </p>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  )}
                </Swiper>
              </div>
            </div>
          </div>
        </section>

        {/* NEWS */}

        <section className="mt-20">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-blue-600" />

                <h2
                  className={cn(
                    "text-3xl font-black tracking-tight md:text-4xl",
                    heading,
                  )}
                >
                  {t("news")}
                </h2>
              </div>
            </div>

            <Link
              href="/news"
              className="flex items-center gap-2 text-sm font-bold text-blue-500 transition-transform hover:translate-x-1"
            >
              {t("SeeAll")}
              <IoArrowForward />
            </Link>
          </div>

          {/* NEWS FILTER */}

          <div className="mb-5 flex justify-end">
            <FillterCards
              one={t("All")}
              two={t("TheNewestOnes")}
              three={t("TheOldestOnes")}
              onSelect={setNewsFilter}
            />
          </div>

          <Swiper
            key={`news-${newsFilter}`}
            modules={[Autoplay, Pagination]}
            spaceBetween={20}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={
              filteredNews.length > 0
                ? {
                    clickable: true,
                    dynamicBullets: true,
                  }
                : false
            }
            breakpoints={{
              320: {
                slidesPerView: 1,
              },
              640: {
                slidesPerView: 1.4,
              },
              768: {
                slidesPerView: 2,
              },
              1100: {
                slidesPerView: 3,
              },
            }}
            className="pb-14"
          >
            {filteredNews.length > 0 ? (
              filteredNews.map((item) => (
                <SwiperSlide key={item._id || item.id || item.slug}>
                  <Link href={`/news/${item.slug}`}>
                    <div
                      className={cn(
                        "group min-h-[340px] overflow-hidden rounded-[2rem] border p-5 transition-all duration-500 hover:-translate-y-2",
                        surface,
                        "hover:border-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/[0.08]",
                      )}
                    >
                      <div className="relative mb-6 flex h-48 items-center justify-center overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-blue-500/10 via-indigo-500/[0.06] to-transparent">
                        {item.translations?.uz?.banners?.[0] ? (
                          <img
                            src={item.translations.uz.banners[0]}
                            alt={item.translations.uz.title || "News"}
                            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <IoNewspaper className="relative text-5xl text-blue-500/30 transition-transform duration-500 group-hover:scale-125" />
                        )}
                      </div>

                      <h3
                        className={cn(
                          "mb-4 line-clamp-2 text-lg font-black",
                          heading,
                        )}
                      >
                        {item.translations?.uz?.title || "News"}
                      </h3>

                      <p className={cn("line-clamp-2 text-sm", muted)}>
                        {(item.translations?.uz?.content || "")
                          .replace(/<[^>]*>/g, "")
                          .trim()}
                      </p>
                    </div>
                  </Link>
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide>
                <div
                  className={cn(
                    "flex min-h-[340px] w-full items-center justify-center rounded-[2rem] border border-dashed",
                    isDark
                      ? "border-white/10 bg-white/[0.02]"
                      : "border-slate-200 bg-white/60",
                  )}
                >
                  <div className="text-center">
                    <div
                      className={cn(
                        "mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl",
                        isDark ? "bg-blue-500/10" : "bg-blue-50",
                      )}
                    >
                      <IoNewspaper className="text-3xl text-blue-500/70" />
                    </div>

                    <h3 className={cn("text-base font-black", heading)}>
                      {t("news")}
                    </h3>

                    <p className={cn("mt-2 text-sm", muted)}>
                      Hozircha yangiliklar mavjud emas
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            )}
          </Swiper>
        </section>

        {/* GAMES */}

        <section className="mt-14">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <IoGameController className="text-3xl text-blue-500" />

                <h2
                  className={cn(
                    "text-3xl font-black tracking-tight md:text-4xl",
                    heading,
                  )}
                >
                  {t("games")}
                </h2>
              </div>
            </div>

            <Link
              href="/games"
              className="flex items-center gap-2 text-sm font-bold text-blue-500 transition-transform hover:translate-x-1"
            >
              {t("SeeAll")}
              <IoArrowForward />
            </Link>
          </div>

          {/* GAMES FILTER */}

          <div className="mb-5 flex justify-end">
            <FillterCards
              one={t("All")}
              two={t("TheNewestOnes")}
              three={t("TheOldestOnes")}
              onSelect={setGamesFilter}
            />
          </div>

          <Swiper
            key={`games-${gamesFilter}`}
            modules={[Autoplay, Pagination]}
            spaceBetween={20}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={
              filteredGames.length > 0
                ? {
                    clickable: true,
                    dynamicBullets: true,
                  }
                : false
            }
            breakpoints={{
              320: {
                slidesPerView: 1,
              },
              640: {
                slidesPerView: 1.4,
              },
              768: {
                slidesPerView: 2,
              },
              1100: {
                slidesPerView: 3,
              },
            }}
            className="pb-14"
          >
            {filteredGames.length > 0 ? (
              filteredGames.map((item) => (
                <SwiperSlide key={item._id || item.id || item.slug}>
                  <Link href={`/games/${item.slug}`}>
                    <div
                      className={cn(
                        "group overflow-hidden rounded-[2rem] border transition-all duration-500 hover:-translate-y-2",
                        surface,
                        "hover:border-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/[0.08]",
                      )}
                    >
                      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(59,130,246,0.16),transparent_45%)]" />

                        {item.langData?.uz?.iconPreview ? (
                          <img
                            src={item.langData.uz.iconPreview}
                            alt={item.langData.uz.title || "Game"}
                            className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <IoGameController className="text-7xl text-blue-500/20 transition-all duration-500 group-hover:scale-125 group-hover:text-blue-500/30" />
                          </div>
                        )}

                        <div className="absolute bottom-4 left-4 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-[10px] font-black tracking-widest text-white backdrop-blur-md">
                          MIDEM
                        </div>
                      </div>

                      <div className="p-6">
                        <h3
                          className={cn("truncate text-lg font-black", heading)}
                        >
                          {item.langData?.uz?.title || "Game"}
                        </h3>

                        <p className={cn("mt-2 line-clamp-2 text-sm", muted)}>
                          {item.langData?.uz?.Maindescription || "Game"}
                        </p>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide>
                <div
                  className={cn(
                    "flex min-h-[340px] w-full items-center justify-center rounded-[2rem] border border-dashed",
                    isDark
                      ? "border-white/10 bg-white/[0.02]"
                      : "border-slate-200 bg-white/60",
                  )}
                >
                  <div className="text-center">
                    <div
                      className={cn(
                        "mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl",
                        isDark ? "bg-indigo-500/10" : "bg-indigo-50",
                      )}
                    >
                      <IoGameController className="text-3xl text-indigo-500/70" />
                    </div>

                    <h3 className={cn("text-base font-black", heading)}>
                      {t("games")}
                    </h3>

                    <p className={cn("mt-2 text-sm", muted)}>
                      Hozircha o‘yinlar mavjud emas
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            )}
          </Swiper>
        </section>

        {/* ADMINS */}

        <section className="mt-14">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <IoShieldCheckmark className="text-3xl text-blue-500" />

                <h2
                  className={cn(
                    "text-3xl font-black tracking-tight md:text-4xl",
                    heading,
                  )}
                >
                  {t("Admins")}
                </h2>
              </div>
            </div>

            <Link
              href="/admins-list"
              className="flex items-center gap-2 text-sm font-bold text-blue-500 transition-transform hover:translate-x-1"
            >
              {t("SeeAll")}
              <IoArrowForward />
            </Link>
          </div>

          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={20}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={
              homeData.admins.length > 0
                ? {
                    clickable: true,
                    dynamicBullets: true,
                  }
                : false
            }
            breakpoints={{
              320: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1100: { slidesPerView: 3 },
            }}
            className="pb-14"
          >
            {homeData.admins.length > 0 ? (
              homeData.admins.map((item) => (
                <SwiperSlide key={item._id || item.id || item.name}>
                  <div
                    className={cn(
                      "group flex min-h-[180px] items-center gap-5 rounded-[2rem] border p-6 transition-all duration-500 hover:-translate-y-1",
                      surface,
                      "hover:border-blue-500/20 hover:shadow-xl hover:shadow-blue-500/[0.08]",
                    )}
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10">
                      {item.picture ? (
                        <img
                          src={item.picture}
                          alt={item.name || "Admin"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <IoShieldCheckmark className="text-2xl text-blue-500/60" />
                        </div>
                      )}
                    </div>

                    <div className="w-full min-w-0">
                      <h3
                        className={cn("truncate text-lg font-black", heading)}
                      >
                        {item.name || "Admin"}
                      </h3>
                      <p className={cn("mt-2 text-sm capitalize", muted)}>
                        {item.role || "admin"}
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide>
                <div
                  className={cn(
                    "flex min-h-[340px] w-full items-center justify-center rounded-[2rem] border border-dashed",
                    isDark
                      ? "border-white/10 bg-white/[0.02]"
                      : "border-slate-200 bg-white/60",
                  )}
                >
                  <div className="text-center">
                    <div
                      className={cn(
                        "mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl",
                        isDark ? "bg-blue-500/10" : "bg-blue-50",
                      )}
                    >
                      <IoShieldCheckmark className="text-3xl text-blue-500/70" />
                    </div>

                    <h3 className={cn("text-base font-black", heading)}>
                      {t("Admins")}
                    </h3>

                    <p className={cn("mt-2 text-sm", muted)}>
                      Hozircha adminlar mavjud emas
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            )}
          </Swiper>
        </section>
      </div>

      {/* SWIPER GLOBAL FIXES */}

      <style jsx global>{`
        .swiper:not(.header-news-swiper):not(.header-games-swiper) {
          min-width: 0;
          overflow: visible !important;
        }

        .swiper-slide {
          min-width: 0;
        }

        .swiper:not(.header-news-swiper):not(.header-games-swiper)
          .swiper-pagination-bullet {
          background: ${isDark ? "#64748b" : "#94a3b8"} !important;
          opacity: 0.35 !important;
        }

        .swiper:not(.header-news-swiper):not(.header-games-swiper)
          .swiper-pagination-bullet-active {
          background: #2563eb !important;
          opacity: 1 !important;
        }

        .header-news-swiper {
          position: relative;
          z-index: 1;
          isolation: isolate;
          min-width: 0;
          overflow: hidden !important;
          height: 235px;
        }

        .header-games-swiper {
          position: relative;
          z-index: 1;
          isolation: isolate;
          min-width: 0;
          overflow: hidden !important;
          height: 235px;
        }

        .header-news-swiper .swiper-pagination {
          right: 2px !important;
          left: auto !important;
          width: auto !important;
        }

        .header-games-swiper .swiper-pagination {
          right: 2px !important;
          left: auto !important;
          width: auto !important;
        }

        .header-news-swiper .swiper-pagination-bullet {
          margin: 3px 0 !important;
          background: ${isDark ? "#64748b" : "#94a3b8"} !important;
          opacity: 0.35 !important;
        }

        .header-games-swiper .swiper-pagination-bullet {
          margin: 3px 0 !important;
          background: ${isDark ? "#64748b" : "#94a3b8"} !important;
          opacity: 0.35 !important;
        }

        .header-news-swiper .swiper-pagination-bullet-active {
          background: #2563eb !important;
          opacity: 1 !important;
        }

        .header-games-swiper .swiper-pagination-bullet-active {
          background: #2563eb !important;
          opacity: 1 !important;
        }

        @media (max-width: 1023px) {
          .header-news-swiper {
            height: 240px !important;
          }

          .header-games-swiper {
            height: 240px !important;
          }
        }

        @media (max-width: 639px) {
          .header-news-swiper {
            height: 235px !important;
          }

          .header-games-swiper {
            height: 225px !important;
          }
        }

        @media (max-width: 400px) {
          .header-news-swiper {
            height: 230px !important;
          }

          .header-games-swiper {
            height: 220px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .header-news-swiper .swiper-wrapper,
          .header-games-swiper .swiper-wrapper {
            transition-duration: 0ms !important;
          }
        }
      `}</style>
    </main>
  );
}

export default Page;
