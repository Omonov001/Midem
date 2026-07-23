"use client";

import {
  Gamepad2,
  TrendingUp,
  Wallet,
  Trophy,
  Clock,
  Zap,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useTranslations } from "next-intl"; // yoki ozingizda bor i18n hooki

function Page() {
  const t = useTranslations();

  // Statistika malumotlari
  const stats = [
    {
      key: "balance",
      value: "$1,240.50",
      icon: <Wallet />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      key: "games",
      value: "48 ta",
      icon: <Gamepad2 />,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      key: "achievements",
      value: "128 ta",
      icon: <Trophy />,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      key: "playtime",
      value: "1,420 s.",
      icon: <Clock />,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="w-full min-h-screen p-6 my-20 md:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* --- HEADER --- */}
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
            {t("welcome")} <span className="text-blue-600">user</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.3em] mt-2 flex items-center gap-2">
            <Zap size={14} className="text-yellow-500 fill-yellow-500" />
            {t("subtitle")}
          </p>
        </div>

        {/* Level Badge */}
        <div className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center gap-4 shadow-xl">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase">
              {t("level")}
            </p>
            <p className="text-xl font-black italic text-blue-600 tracking-tighter">
              {t("rank")}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black italic text-xl shadow-lg shadow-blue-600/40 animate-pulse">
            99
          </div>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-white/5 transition-all hover:scale-[1.02] group cursor-default"
          >
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:rotate-12 group-hover:scale-110",
                stat.bg,
                stat.color,
              )}
            >
              {stat.icon}
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
              {t(`stats.${stat.key}`)}
            </p>
            <h3 className="text-2xl font-black italic tracking-tighter dark:text-white">
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* --- RECENT ACTIVITY SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Banner Card */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-black uppercase italic text-slate-400 flex items-center gap-2">
            <TrendingUp size={20} /> {t("last_game")}
          </h2>
          <div className="relative w-full h-[400px] rounded-[3rem] overflow-hidden group border border-slate-200 dark:border-white/5 shadow-2xl">
            <Image
              src="/"
              alt="Cyberpunk 2077"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

            {/* Fanarcha (Glow) Effect */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full group-hover:bg-blue-600/30 transition-all" />

            <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between">
              <div className="space-y-2">
                <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md inline-block">
                  {t("continue")}
                </span>
                <h3 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
                  Cyberpunk 2077
                </h3>
                <p className="text-slate-300 font-bold italic text-sm">
                  {t("last_game")}: 2 soat oldin
                </p>
              </div>

              <button className="hidden md:flex w-16 h-16 rounded-full bg-white text-blue-600 items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-white/20 shadow-2xl">
                <Play fill="currentColor" size={24} className="ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* --- ADDITIONAL INFO (SIDE) --- */}
        <div className="space-y-6">
          <h2 className="text-xl font-black uppercase italic text-slate-400">
            {t("info_title")}
          </h2>

          <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20 group cursor-pointer">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-md">
                <Zap size={24} className="text-yellow-300 fill-yellow-300" />
              </div>

              <h4 className="text-2xl font-black uppercase italic mb-2 tracking-tighter">
                {t("premium.title")}
              </h4>

              <p className="text-blue-100 text-sm font-medium mb-8 leading-relaxed">
                {t("premium.description")}
              </p>

              <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black uppercase italic text-sm hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10">
                {t("premium.button")}
              </button>
            </div>

            {/* Orqa fondagi bezaklar (Glows) */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 blur-[60px] rounded-full group-hover:bg-white/30 transition-all duration-500" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/30 blur-[40px] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
