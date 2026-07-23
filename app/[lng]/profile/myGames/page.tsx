"use client";

import Image from "next/image";
import { Play, Download, Clock, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import useTranslate from "@/hooks/use-translate";
import Link from "next/link";

const myGames = [
  {
    slug: "games/pc-games/1",
    id: 1,
    title: "Elden Ring",
    image: "",
    playTime: "124 soat",
    rating: 4.9,
    status: "installed",
    buy: false,
  },
  {
    slug: "games/pc-games/2",
    id: 2,
    title: "Cyberpunk 2077",
    image: "",
    playTime: "45 soat",
    rating: 4.5,
    status: "download",
    buy: false,
  },
  {
    slug: "games/pc-games/3",
    id: 3,
    title: "Spider-Man 2",
    image: "",
    playTime: "12 soat",
    rating: 4.8,
    status: "buy",
    buy: true,
  },
];

function Page() {
  const t = useTranslate();

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

      {/* --- OYINLAR GRIDI --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {myGames.map((game) => (
          <Link
            key={game.id}
            href={`../${game.slug}`}
            className="block outline-none group"
          >
            <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden transition-all duration-500 hover:border-blue-500/50 hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] active:scale-[0.97] will-change-transform">
              {/* Oyin rasmi qismi */}
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={game.image || "/placeholder-game.jpg"}
                  alt={game.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  priority={game.id <= 4}
                />

                {/* Overlay: Pastdan tepaga qorayish */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90" />

                {/* Reyting Tag */}
                <div className="absolute top-5 right-5 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-[12px] font-black italic">
                  {game.rating} ★
                </div>

                {/* Sarlavha rasm ustida (Yaxshiroq o'qilishi uchun) */}
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl font-black text-white leading-tight uppercase italic drop-shadow-2xl">
                    {game.title}
                  </h3>
                </div>
              </div>

              {/* Statistika va Button */}
              <div className="p-7">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/10">
                    <Clock size={16} className="text-blue-500" />
                    <span className="text-[11px] font-black uppercase italic tracking-wider text-slate-600 dark:text-slate-300">
                      {game.playTime}
                    </span>
                  </div>
                </div>

                <div
                  className={cn(
                    "w-full py-4.5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase italic tracking-[0.15em] text-[11px] transition-all duration-300",
                    game.status === "installed"
                      ? "bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)] group-hover:bg-blue-500 group-hover:-translate-y-1"
                      : "bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white border border-transparent group-hover:border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white",
                  )}
                >
                  {game.status === "installed" ? (
                    <>
                      <Play
                        size={18}
                        fill="currentColor"
                        className="transition-transform group-hover:scale-110"
                      />
                      {t("play")}
                    </>
                  ) : (
                    <>
                      <Download
                        size={18}
                        className="transition-transform group-hover:bounce"
                      />
                      {t("buy")}
                    </>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Page;
