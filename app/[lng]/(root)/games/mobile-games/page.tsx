"use client";

// 1. IMPORTNI O'ZGARTIRDIK: O'zimizning xavfsiz provider
import { useTheme } from "@/components/ui/theme-provider";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  IoSearchOutline,
  IoArrowBack,
  IoPlayCircle,
  IoStar,
} from "react-icons/io5";
import Link from "next/link";
import FillterCards from "@/components/fillters/fillter-cards";
import useTranslate from "@/hooks/use-translate";

export default function MobileGamesPage() {
  // 2. resolvedTheme endi bizning xavfsiz providerdan olinadi
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
        "relative min-h-screen pt-[15vh] pb-20 px-4 md:px-12 transition-colors duration-500",
        isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900",
      )}
    >
      {/* BG DECOR - Background dizayni */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-20">
        <div
          className={cn(
            "absolute top-0 right-0 w-[600px] h-[600px] blur-[150px] rounded-full",
            isDark ? "bg-purple-600/30" : "bg-purple-200",
          )}
        />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-8 mb-12">
          <Link
            href="/games"
            className={cn(
              "flex items-center gap-2 w-fit px-5 py-2.5 rounded-2xl font-bold transition-all active:scale-95 border",
              isDark
                ? "bg-white/5 border-white/10 text-purple-400 hover:bg-white/10"
                : "bg-white border-slate-200 text-purple-600 shadow-sm hover:bg-slate-50",
            )}
          >
            <IoArrowBack className="size-5" /> {t("back")}
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-black uppercase italic leading-[0.8]">
                {t("Mobile")}{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
                  {t("games")}
                </span>
              </h1>
            </div>

            <div
              className={cn(
                "flex items-center gap-4 px-6 py-4 rounded-[2rem] border backdrop-blur-xl md:w-96 transition-all",
                isDark
                  ? "bg-white/[0.03] border-white/10 focus-within:border-purple-500/50"
                  : "bg-white border-slate-300 shadow-xl focus-within:border-purple-500",
              )}
            >
              <IoSearchOutline className="text-slate-500 size-6" />
              <input
                type="text"
                placeholder={`${t("search")}...`}
                className="bg-transparent border-none outline-none w-full font-bold placeholder:text-slate-500"
              />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
            <Link key={id} href={`/games/mobile-games/${id}`}>
              <div className="group relative">
                <div
                  className={cn(
                    "relative aspect-[3/4.5] rounded-[3.5rem] overflow-hidden border transition-all duration-500 group-hover:-translate-y-4",
                    isDark
                      ? "bg-[#0f0f0f] border-white/10 shadow-2xl shadow-black"
                      : "bg-white border-slate-200 shadow-2xl shadow-slate-200",
                  )}
                >
                  {/* Visual Area - O'yin rasmi joyi */}
                  <div
                    className={cn(
                      "absolute inset-0 h-[65%] transition-all duration-700 group-hover:scale-110",
                      id % 2 === 0
                        ? "bg-gradient-to-br from-purple-600/30 to-slate-900"
                        : "bg-gradient-to-br from-blue-600/30 to-slate-900",
                    )}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <IoPlayCircle className="size-20 text-white/40 drop-shadow-2xl" />
                    </div>
                  </div>

                  {/* Content Area - Ma'lumot qismi */}
                  <div className="absolute inset-x-0 bottom-0 p-8 pt-0 h-[45%] flex flex-col justify-end bg-gradient-to-t from-black via-black/90 to-transparent">
                    <div className="mb-4">
                      <div className="flex items-center gap-1 text-yellow-400 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <IoStar
                            key={i}
                            size={14}
                            className={i === 4 ? "opacity-30" : "opacity-100"}
                          />
                        ))}
                        <span className="text-xs font-bold text-white/60 ml-2">
                          4.8
                        </span>
                      </div>
                      <h3 className="text-3xl font-black uppercase italic text-white leading-none truncate">
                        Apex Mobile #{id}
                      </h3>
                    </div>
                    <button className="w-full py-4 rounded-[1.5rem] font-black text-xs uppercase bg-white text-black hover:bg-purple-600 hover:text-white transition-all active:scale-95 shadow-lg">
                      {t("Dowload")}
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
