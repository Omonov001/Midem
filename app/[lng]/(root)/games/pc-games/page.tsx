"use client";

// 1. IMPORTNI O'ZGARTIRDIK: O'zimizning xavfsiz provider
import { useTheme } from "@/components/ui/theme-provider";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  IoSearchOutline,
  IoFilterOutline,
  IoArrowBack,
  IoStar,
} from "react-icons/io5";
import Link from "next/link";
import FillterCards from "@/components/fillters/fillter-cards";
import useTranslate from "@/hooks/use-translate";

export default function PCGamesPage() {
  // 2. resolvedTheme endi bizning providerdan olinadi
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
        "relative min-h-screen pt-[15vh] pb-20 px-4 lg:px-12 transition-colors duration-500",
        isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900",
      )}
    >
      <div className="max-w-7xl mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col gap-8 mb-16">
          <Link
            href="/games"
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

        {/* GAMES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
            <Link key={id} href={`/games/pc-games/${id}`}>
              <div className="group relative">
                <div
                  className={cn(
                    "relative aspect-[3/4.2] rounded-[3rem] overflow-hidden border transition-all duration-500 group-hover:-translate-y-4",
                    isDark
                      ? "bg-slate-900 border-white/10 shadow-2xl shadow-black hover:border-blue-500/30"
                      : "bg-white border-slate-200 shadow-2xl shadow-slate-200 hover:border-blue-500/20",
                  )}
                >
                  <div
                    className={cn(
                      "w-full h-[60%] bg-gradient-to-br transition-transform duration-700 group-hover:scale-110",
                      isDark
                        ? "from-blue-900/40 to-slate-800"
                        : "from-blue-100 to-slate-50",
                    )}
                  />

                  <div className="p-8 flex flex-col justify-between h-[40%]">
                    <div>
                      <div className="flex items-center gap-1 text-orange-500 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <IoStar
                            key={i}
                            className={cn(
                              "size-3",
                              i === 4 ? "opacity-30" : "opacity-100",
                            )}
                          />
                        ))}
                        <span className="text-[10px] font-black ml-1 text-slate-500">
                          4.0
                        </span>
                      </div>
                      <h3 className="text-4xl font-black uppercase italic leading-none truncate">
                        Cyber Elite{" "}
                      </h3>
                    </div>
                    <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 active:scale-95">
                      {t("see")}
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
