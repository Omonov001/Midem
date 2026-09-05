"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Play, Gamepad2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import useTranslate from "@/hooks/use-translate";
import Link from "next/link";

type LanguageType = "uz" | "ru" | "en" | "tr";

type GameLanguageData = {
  title?: string;
  subtitle?: string;
  Maindescription?: string;
  description?: string;
  category?: string;
  availableLanguagesCount?: string;
  iconPreview?: string | null;
  screenshotPreviews?: string[];
  whatsNew?: string[];
};

type Game = {
  _id: string;
  slug?: string;
  platform?: "mobile" | "pc" | "both";
  priceType: "free" | "paid";
  price: number;
  langData: Partial<Record<LanguageType, GameLanguageData>>;
};

function Page() {
  const t = useTranslate();

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/users/me/games", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch games");
        }

        const data = await response.json();

        setGames(data.games ?? []);
      } catch (error) {
        console.error("My Games error:", error);
        setError("O'yinlarni yuklab bo'lmadi.");
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  /*
   * Hozircha foydalanuvchining tili sifatida UZ ishlatyapmiz.
   *
   * Keyinchalik useTranslate yoki next-intl orqali
   * real locale olishimiz mumkin.
   */
  const locale: LanguageType = "uz";

  const getGameData = (game: Game) => {
    return (
      game.langData?.[locale] ??
      game.langData?.en ??
      game.langData?.ru ??
      game.langData?.tr ??
      {}
    );
  };

  return (
    <div className="w-full mt-10 min-h-screen p-6 md:p-10 max-w-[1600px] mx-auto">
      {/* --- SAHIFA SARLAVHASI --- */}
      <div className="relative mb-14">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 animate-pulse">
            <Gamepad2 size={28} />
          </div>

          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
            {t("myGames")}
          </h1>
        </div>

        <div className="h-1.5 w-32 bg-gradient-to-r from-blue-600 to-transparent rounded-full" />
      </div>

      {/* --- LOADING --- */}
      {loading && (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={40} className="animate-spin text-blue-600" />

            <span className="text-sm font-black uppercase italic tracking-widest text-slate-500">
              Loading...
            </span>
          </div>
        </div>
      )}

      {/* --- ERROR --- */}
      {!loading && error && (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-4 rounded-2xl bg-red-500/10 text-red-500">
              <AlertCircle size={36} />
            </div>

            <p className="text-lg font-bold text-red-500">{error}</p>
          </div>
        </div>
      )}

      {/* --- EMPTY --- */}
      {!loading && !error && games.length === 0 && (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center text-center">
            <div className="p-5 rounded-3xl bg-slate-100 dark:bg-white/5 mb-5">
              <Gamepad2 size={48} className="text-slate-400" />
            </div>

            <h2 className="text-2xl font-black uppercase italic text-slate-900 dark:text-white">
              No Games
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              You havent purchased any games yet.
            </p>
          </div>
        </div>
      )}

      {/* --- O'YINLAR GRIDI --- */}
      {!loading && !error && games.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {games.map((game, index) => {
            const gameData = getGameData(game);

            const title = gameData.title?.trim() || "Unnamed Game";

            const image = gameData.iconPreview || "/placeholder-game.jpg";

            const slug = game.slug || "";

            /*
             * User purchasedGames ichida bo'lganligi sababli
             * bu o'yin allaqachon userniki.
             */
            const status = "installed";

            return (
              <Link
                key={`${game._id}`}
                href={`/games/${slug}`}
                className={cn(
                  "block outline-none group",
                  !slug && "pointer-events-none",
                )}
              >
                <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden transition-all duration-500 hover:border-blue-500/50 hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] active:scale-[0.97] will-change-transform">
                  {/* O'YIN RASMI */}
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={image}
                      alt={title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      priority={index < 4}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90" />

                    {/* PLATFORM TAG */}
                    {game.platform && (
                      <div className="absolute top-5 left-5 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase italic">
                        {game.platform}
                      </div>
                    )}

                    {/* PRICE / OWNED TAG */}
                    <div className="absolute top-5 right-5 px-3 py-1.5 rounded-xl bg-blue-600/90 backdrop-blur-md border border-white/10 text-white text-[11px] font-black uppercase italic">
                      Owned
                    </div>

                    {/* TITLE */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-2xl font-black text-white leading-tight uppercase italic drop-shadow-2xl">
                        {title}
                      </h3>
                    </div>
                  </div>

                  {/* BOTTOM */}
                  <div className="p-7">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/10">
                        <Gamepad2 size={16} className="text-blue-500" />

                        <span className="text-[11px] font-black uppercase italic tracking-wider text-slate-600 dark:text-slate-300">
                          {game.platform || "Game"}
                        </span>
                      </div>

                      {game.priceType === "paid" && (
                        <span className="text-[11px] font-black text-slate-400">
                          ${game.price}
                        </span>
                      )}
                    </div>

                    {/* BUTTON */}
                    <div
                      className={cn(
                        "w-full py-4.5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase italic tracking-[0.15em] text-[11px] transition-all duration-300",
                        status === "installed"
                          ? "bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)] group-hover:bg-blue-500 group-hover:-translate-y-1"
                          : "bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white border border-transparent group-hover:border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white",
                      )}
                    >
                      <Play
                        size={18}
                        fill="currentColor"
                        className="transition-transform group-hover:scale-110"
                      />

                      {t("play")}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Page;
