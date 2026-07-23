"use client";

import {
  Gamepad2,
  Newspaper,
  MessageSquare,
  Star,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DeveloperDashboard() {
  const stats = [
    {
      label: "Jami Oyinlar",
      value: "14 ta",
      change: "+2 bu oy",
      icon: <Gamepad2 size={22} />,
      color: "from-blue-600 to-cyan-500",
      shadow: "shadow-blue-500/10",
    },
    {
      label: "Yangiliklar / Patchlar",
      value: "42 ta",
      change: "Faol hamjamiyat",
      icon: <Newspaper size={22} />,
      color: "from-purple-600 to-indigo-500",
      shadow: "shadow-purple-500/10",
    },
    {
      label: "Yangi Izohlar",
      value: "1,240 ta",
      change: "+18% osish",
      icon: <MessageSquare size={22} />,
      color: "from-emerald-600 to-teal-500",
      shadow: "shadow-emerald-500/10",
    },
    {
      label: "Ortacha Reyting",
      value: "4.8 ★",
      change: "Top Developer",
      icon: <Star size={22} />,
      color: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/10",
    },
  ];

  return (
    // Har xil ekran olchamlari uchun moslashuvchan padding va maksimal kenglik
    <div className="w-full max-w-[1600px] my-20 mx-auto space-y-6 md:space-y-10 p-2 sm:p-4 md:p-0 animate-in fade-in duration-500">
      {/* HEADER: Fon ranglari va gradientlar har ikkala rejim uchun alohida sozlandi */}
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden border transition-all duration-300",
          // Light mode fon va chegara
          "bg-gradient-to-r from-slate-50 via-indigo-50/50 to-slate-50 border-slate-200/80",
          // Dark mode fon va chegara
          "dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 dark:border-white/5",
        )}
      >
        {/* AURA EFFEKTI (Radial Gradient) */}
        {/* Light mode uchun: juda mayin havorang/binafsha yogdu */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_55%)] dark:hidden" />

        {/* Dark mode uchun: chuqurroq va yorqinroq neon yogdu */}
        <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_45%)]" />

        {/* HEADER MATNLARI */}
        <div className="relative z-10 space-y-1">
          <h1
            className={cn(
              "text-2xl sm:text-3xl md:text-4xl font-black tracking-tight bg-clip-text bg-gradient-to-r",
              // Light mode matn ranggi
              "from-slate-900 via-slate-800 to-slate-600",
              // Dark mode matn ranggi
              "dark:from-white dark:via-slate-200 dark:dark:to-slate-400",
            )}
          >
            Dasturchi Markazi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            MIDEM platformasidagi oyinlaringiz statistikasi va geymerlar
            faolligini real vaqt rejimida boshqaring.
          </p>
        </div>

        {/* LIVE BADGE */}
        <div
          className={cn(
            "relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider backdrop-blur-md self-start sm:self-center border",
            // Light mode nishonchasi
            "bg-indigo-50 border-indigo-100 text-indigo-600",
            // Dark mode nishonchasi
            "dark:bg-white/5 dark:border-white/10 dark:text-indigo-400",
          )}
        >
          <TrendingUp size={12} /> Live Analytics
        </div>
      </div>

      {/* 1. STATISTIKA KARTALARI: Mobilda 1 ta, planshetda 2 ta, katta ekranda 4 ta ustun (Responsive Grid) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={cn(
              "group relative p-5 sm:p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer",
              stat.shadow,
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                {stat.label}
              </span>
              <div
                className={cn(
                  "p-2.5 sm:p-3 rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110",
                  stat.color,
                )}
              >
                {stat.icon}
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {stat.value}
              </h3>
              <p className="text-[11px] sm:text-xs font-medium text-emerald-500 mt-0.5 flex items-center gap-1">
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 2. ASOSIY PANELLAR: Mobilda ustma-ust (1 ustun), noutbuklardan boshlab 3 ustunli layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Oxirgi oyinlar (Katta ekranlarda 2 ta ustun joyni egallaydi) */}
        <div className="lg:col-span-2 p-5 sm:p-6 bg-white dark:bg-slate-900/30 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Sizning oyinlaringiz
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Oxirgi yangilangan yoki qoshilgan oyinlar
                </p>
              </div>
              <button className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all">
                <ArrowUpRight size={16} />
              </button>
            </div>

            {/* Oyinlar royxati (Elementlar ichidagi paddinglar mobilda ixchamlashadi) */}
            <div className="space-y-3">
              {[
                {
                  title: "Shadowbound: Chronicle",
                  genre: "RPG / Action",
                  status: "Active",
                  downloads: "24.5k",
                },
                {
                  title: "Cyber Neon: Drift",
                  genre: "Racing / Cyberpunk",
                  status: "Under Review",
                  downloads: "1.2k",
                },
                {
                  title: "Pixel Dungeon Quest",
                  genre: "Indie / Roguelike",
                  status: "Draft",
                  downloads: "0",
                },
              ].map((game, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-100/50 dark:hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-inner shrink-0">
                      {game.title[0]}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {game.title}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                        {game.genre}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 hidden xs:inline">
                      {game.downloads}
                    </span>
                    <span
                      className={cn(
                        "text-[9px] sm:text-[11px] font-bold px-2 py-0.5 sm:py-1 rounded-full uppercase tracking-wider",
                        game.status === "Active" &&
                          "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
                        game.status === "Under Review" &&
                          "bg-amber-500/10 text-amber-500 border border-amber-500/20",
                        game.status === "Draft" &&
                          "bg-slate-500/10 text-slate-500 border border-slate-500/20",
                      )}
                    >
                      {game.status === "Under Review" ? "Review" : game.status}{" "}
                      {/* Mobilda sigishi uchun */}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Songgi izohlar (Katta ekranda yon tomonda, mobilda oyinlar tagida chiqadi) */}
        <div className="p-5 sm:p-6 bg-white dark:bg-slate-900/30 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Jonli sharhlar
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Oyinchilarning fikrlari
              </p>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {[
              {
                name: "Asadbek_Gamer",
                game: "Shadowbound",
                comment:
                  "Grafika daxshat chiqibdi, lekin 3-levelda kichik bag bor ekan...",
                time: "2 daq oldin",
              },
              {
                name: "ShadowNinja",
                game: "Cyber Neon",
                comment: "Kutgandim! UI silliqligi va soundtreklar juda yoqdi.",
                time: "15 daq oldin",
              },
            ].map((comment, i) => (
              <div
                key={i}
                className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                    {comment.name}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] shrink-0">
                    {comment.time}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs line-clamp-2 leading-relaxed">
                  {comment.comment}
                </p>
                <div className="inline-block px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[9px] sm:text-[10px] font-semibold">
                  {comment.game}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
