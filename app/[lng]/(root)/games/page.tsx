"use client";

import { useTheme } from "@/components/ui/theme-provider";
import { useEffect, useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import MenuText from "@/components/menus/menu-text";
import FillterCards from "@/components/fillters/fillter-cards";
import Link from "next/link";
import Image from "next/image";
import useTranslate from "@/hooks/use-translate";
import { useParams } from "next/navigation";
import {
  IoStar,
  IoLogoWindows,
  IoLogoAndroid,
  IoLogoApple,
  IoSearchOutline,
  IoGameControllerOutline,
} from "react-icons/io5";

interface GameType {
  _id: string;
  slug: string;
  defaultLang?: string;
  platform?: "mobile" | "pc" | "both";
  selectedOS?: Record<string, boolean>;
  langData?: Record<
    string,
    {
      title?: string;
      category?: string;
      description?: string;
      Maindescription?: string;
      iconPreview?: string;
    }
  >;
  rating?: number;
}

export default function GamesPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslate();
  const params = useParams();

  const currentLng = (params?.lng as string) || "uz";

  const [games, setGames] = useState<GameType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const controller = new AbortController();

    const fetchGames = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/games", { signal: controller.signal });
        if (!res.ok) throw new Error("Server error");
        const data = await res.json();
        if (Array.isArray(data)) setGames(data);
      } catch (err: unknown) {
        if ((err as Error).name !== "AbortError") {
          console.error("Games fetch error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
    return () => controller.abort();
  }, [mounted]);

  // Qidiruv va OS filter birgalikda optimallashgan
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const title =
        game.langData?.[currentLng]?.title ||
        game.langData?.[game.defaultLang || "uz"]?.title ||
        "";
      const matchesSearch = title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      let matchesOS = true;
      if (activeTab === "windows") {
        matchesOS = Boolean(
          game.selectedOS?.windows ||
          game.platform === "pc" ||
          game.platform === "both",
        );
      } else if (activeTab === "android") {
        matchesOS = Boolean(
          game.selectedOS?.android ||
          game.platform === "mobile" ||
          game.platform === "both",
        );
      } else if (activeTab === "ios") {
        matchesOS = Boolean(game.selectedOS?.ios);
      }

      return matchesSearch && matchesOS;
    });
  }, [games, activeTab, searchQuery, currentLng]);

  const handleFilterSelect = useCallback((filterText: string) => {
    const text = filterText.toLowerCase();
    if (text.includes("win")) setActiveTab("windows");
    else if (text.includes("android") || text.includes("andriod"))
      setActiveTab("android");
    else if (text.includes("ios") || text.includes("apple"))
      setActiveTab("ios");
    else setActiveTab("all");
  }, []);

  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";

  return (
    <main
      className={cn(
        "relative min-h-screen pt-[8vh] pb-16 px-4 md:px-8 lg:px-12 transition-colors duration-500",
        isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900",
      )}
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* HEADER SECTION */}
        <section className="flex flex-col items-center text-center space-y-4 mb-10">
          <MenuText text={t("MainText3")} />

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter uppercase">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-blue-400">
              {t("games") || "Oyinlar"}
            </span>
          </h1>

          <p
            className={cn(
              "max-w-xl text-sm sm:text-base font-medium leading-relaxed opacity-80",
              isDark ? "text-slate-400" : "text-slate-600",
            )}
          >
            {t("GamesText") ||
              "Barcha platformalar uchun sara oyinlar toplami."}
          </p>
        </section>

        {/* CONTROLS: SEARCH & FILTERS BAR */}
        <section className="w-full mb-10 flex flex-col lg:flex-row items-center justify-between gap-4 p-2 rounded-3xl backdrop-blur-xl">
          {/* SEARCH INPUT */}
          <div className="w-full lg:w-72">
            <div
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20",
                isDark
                  ? "bg-white/[0.04] border-white/10 shadow-lg"
                  : "bg-white border-slate-200 shadow-sm",
              )}
            >
              <IoSearchOutline className="text-blue-500 size-5 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("search") || "Qidiruv..."}
                className="bg-transparent border-none outline-none w-full text-xs sm:text-sm font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* FILTER CARDS */}
          <FillterCards
            one={t("All") || "Barchasi"}
            two="Windows"
            three="Android"
            four="iOS"
            onSelect={handleFilterSelect}
          />
        </section>

        {/* LOADING STATE */}
        {loading && (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block size-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black tracking-widest text-slate-500 uppercase">
              Yuklanmoqda...
            </p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredGames.length === 0 && (
          <div className="py-20 text-center opacity-60 space-y-2">
            <IoGameControllerOutline className="size-12 mx-auto text-slate-500" />
            <h3 className="text-lg font-black uppercase tracking-wide">
              Hech narsa topilmadi
            </h3>
          </div>
        )}

        {/* GAMES GRID SECTION */}
        {!loading && filteredGames.length > 0 && (
          <section className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => {
                const langObj =
                  game.langData?.[currentLng] ||
                  game.langData?.[game.defaultLang || "uz"] ||
                  (game.langData ? Object.values(game.langData)[0] : undefined);

                const iconImg = langObj?.iconPreview;
                const title = langObj?.title || "Nomsiz Oyin";
                const category = langObj?.category || "Oyin";
                const description =
                  langObj?.Maindescription ||
                  langObj?.description ||
                  "Batafsil malumot olish uchun bosing...";
                const rating = game.rating ?? 5.0;

                return (
                  <Link
                    key={game._id}
                    href={`/${currentLng}/games/${game.slug}`}
                    className="block group"
                  >
                    <div
                      className={cn(
                        "relative p-5 rounded-[2rem] border backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 h-full flex flex-col justify-between overflow-hidden",
                        isDark
                          ? "bg-white/[0.03] border-white/10 hover:border-blue-500/40 shadow-[0_15px_30px_rgba(0,0,0,0.3)] hover:shadow-blue-500/10"
                          : "bg-white border-slate-200 hover:border-blue-500/30 shadow-[0_10px_25px_rgba(0,0,0,0.04)] hover:shadow-blue-500/10",
                      )}
                    >
                      <div>
                        {/* MEDIA BOX (IMAGE & BADGES) */}
                        <div
                          className={cn(
                            "w-full aspect-[16/9] rounded-2xl mb-4 overflow-hidden relative",
                            isDark ? "bg-slate-900" : "bg-slate-100",
                          )}
                        >
                          {iconImg ? (
                            <Image
                              src={iconImg}
                              alt={title}
                              fill
                              unoptimized
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-500">
                              <IoGameControllerOutline className="size-8" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">
                                Rasm Yoq
                              </span>
                            </div>
                          )}

                          {/* Gradient Glow Effect */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />

                          {/* OS BADGES */}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10">
                            {game.selectedOS?.windows && (
                              <IoLogoWindows className="size-3 text-blue-400" />
                            )}
                            {game.selectedOS?.android && (
                              <IoLogoAndroid className="size-3 text-green-400" />
                            )}
                            {(game.selectedOS?.ios ||
                              game.selectedOS?.macos) && (
                              <IoLogoApple className="size-3 text-slate-200" />
                            )}
                          </div>

                          {/* RATING BADGE */}
                          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600/90 text-white font-extrabold text-[11px] shadow-md">
                            <IoStar className="size-3 text-amber-300" />
                            <span>{rating.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* CONTENT SECTION */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1 w-6 bg-blue-500 rounded-full" />
                            <span className="text-[11px] font-extrabold text-blue-500 uppercase tracking-tight">
                              {category}
                            </span>
                          </div>

                          <h3
                            className={cn(
                              "text-xl font-black uppercase italic leading-tight line-clamp-1 transition-colors",
                              isDark
                                ? "group-hover:text-blue-400"
                                : "group-hover:text-blue-600",
                            )}
                          >
                            {title}
                          </h3>

                          <p
                            className={cn(
                              "text-xs line-clamp-2 leading-relaxed opacity-80",
                              isDark ? "text-slate-400" : "text-slate-600",
                            )}
                          >
                            {description}
                          </p>
                        </div>
                      </div>

                      {/* FOOTER BAR */}
                      <div
                        className={cn(
                          "flex justify-between items-center pt-3 mt-4 border-t text-[11px] font-bold tracking-widest uppercase",
                          isDark ? "border-white/5" : "border-slate-100",
                        )}
                      >
                        <span className="opacity-50">MIDEM</span>
                        <span className="text-blue-500 group-hover:underline underline-offset-4">
                          {t("see") || "Korish"} →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* BACKGROUND DECORATIVE GLOW */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] bg-blue-600/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-purple-600/10 blur-[100px] rounded-full" />
      </div>
    </main>
  );
}
