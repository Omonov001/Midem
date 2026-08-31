"use client";

import { useTheme } from "@/components/ui/theme-provider";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { IoSearchOutline, IoArrowBack, IoStar } from "react-icons/io5";
import Link from "next/link";
import Image from "next/image";
import FillterCards from "@/components/fillters/fillter-cards";
import useTranslate from "@/hooks/use-translate";
import { useParams } from "next/navigation";

// Databasedan keladigan Game turi
interface GameType {
  _id: string;
  slug: string;
  defaultLang?: string;
  langData: Record<
    string,
    {
      title?: string;
      iconPreview?: string;
      description?: string;
    }
  >;
  category?: string;
  rating?: number;
}

export default function PCGamesPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslate();
  const params = useParams();

  // URLdagi joriy tilni olamiz (masalan: uz, ru, en)
  const currentLng = (params?.lng as string) || "uz";

  // Statelar
  const [games, setGames] = useState<GameType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    // Bazadan barcha oyinlarni olib keluvchi funksiya
    const fetchGames = async () => {
      try {
        const res = await fetch("/api/games");
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setGames(data);
        }
      } catch (err) {
        console.error("Games fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";

  // 🔍 Search (Qidiruv) boyicha filterlash
  const filteredGames = games.filter((game) => {
    // Joriy tilga mos title yoki default titleni olamiz
    const gameTitle =
      game.langData?.[currentLng]?.title ||
      game.langData?.[game.defaultLang || "uz"]?.title ||
      "";

    return gameTitle.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <main
      className={cn(
        "relative min-h-screen pt-[15vh] pb-20 px-4 lg:px-12 transition-colors duration-500",
        isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900",
      )}
    >
      <div className="max-w-7xl mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col gap-8 mb-16">
          <Link
            href={`/${currentLng}/games`}
            className={cn(
              "flex items-center gap-2 w-fit px-5 py-2.5 rounded-2xl font-bold transition-all active:scale-95 border",
              isDark
                ? "bg-white/5 border-white/10 text-blue-400 hover:bg-white/10"
                : "bg-white border-slate-200 text-blue-600 shadow-sm hover:bg-slate-50",
            )}
          >
            <IoArrowBack className="size-5" /> {t("back")}
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.8]">
                {t("PC")} <span className="text-blue-600">{t("games")}</span>
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div
                className={cn(
                  "w-full sm:w-80 flex items-center gap-3 px-6 py-4 rounded-[2rem] border backdrop-blur-md transition-all",
                  isDark
                    ? "bg-white/5 border-white/10 focus-within:border-blue-500/50"
                    : "bg-white border-slate-300 shadow-lg focus-within:border-blue-500",
                )}
              >
                <IoSearchOutline className="text-slate-500 size-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`${t("search")}...`}
                  className="bg-transparent border-none outline-none w-full font-bold placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          <FillterCards
            one={t("All")}
            two={t("TheBestOnes")}
            three={t("TheNewestOnes")}
            four={t("TheOldestOnes")}
          />
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block size-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-slate-500 uppercase tracking-widest text-sm">
              Oyinlar yuklanmoqda...
            </p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredGames.length === 0 && (
          <div className="text-center py-20 opacity-60">
            <p className="text-2xl font-black italic uppercase">
              Hech qanday oyin topilmadi
            </p>
          </div>
        )}

        {/* GAMES GRID */}
        {!loading && filteredGames.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {filteredGames.map((game) => {
              // Har bir oyin uchun kerakli til malumotini olish
              const gameData =
                game.langData?.[currentLng] ||
                game.langData?.[game.defaultLang || "uz"] ||
                Object.values(game.langData || {})[0];

              const iconImage = gameData?.iconPreview || "";
              const title = gameData?.title || "Nomsiz Oyin";
              const rating = game.rating || 5.0;

              return (
                <Link key={game._id} href={`/${currentLng}/games/${game.slug}`}>
                  <div className="group relative">
                    <div
                      className={cn(
                        "relative aspect-[3/4.2] rounded-[3rem] overflow-hidden border transition-all duration-500 group-hover:-translate-y-4",
                        isDark
                          ? "bg-slate-900 border-white/10 shadow-2xl shadow-black hover:border-blue-500/30"
                          : "bg-white border-slate-200 shadow-2xl shadow-slate-200 hover:border-blue-500/20",
                      )}
                    >
                      {/* OYIN RASMI (R2 preview) */}
                      <div className="relative w-full h-[60%] overflow-hidden bg-slate-800">
                        {iconImage ? (
                          <Image
                            src={iconImage}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          />
                        ) : (
                          <div
                            className={cn(
                              "w-full h-full bg-gradient-to-br flex items-center justify-center font-bold text-xs uppercase tracking-widest text-slate-500",
                              isDark
                                ? "from-blue-900/40 to-slate-800"
                                : "from-blue-100 to-slate-50",
                            )}
                          >
                            Rasm Yoq
                          </div>
                        )}
                      </div>

                      {/* MALUMOT VA BUTTON */}
                      <div className="p-8 flex flex-col justify-between h-[40%]">
                        <div>
                          {/* YULDUZCHA RATING */}
                          <div className="flex items-center gap-1 text-orange-500 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <IoStar
                                key={i}
                                className={cn(
                                  "size-3",
                                  i < Math.floor(rating)
                                    ? "opacity-100"
                                    : "opacity-30",
                                )}
                              />
                            ))}
                            <span className="text-[10px] font-black ml-1 text-slate-500">
                              {rating.toFixed(1)}
                            </span>
                          </div>

                          {/* OYIN NOMI */}
                          <h3 className="text-2xl font-black uppercase italic leading-none truncate">
                            {title}
                          </h3>
                        </div>

                        {/* KORISH TUGMASI */}
                        <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 active:scale-95">
                          {t("see")}
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
