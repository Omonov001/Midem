"use client";

import { useEffect, useState } from "react";
import {
  Gamepad2,
  TrendingUp,
  Wallet,
  Trophy,
  Clock,
  Zap,
  Play,
  Loader2,
  Crown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getUserData } from "@/actions/user.action";
import { IUser, UserRank } from "@/models/user.model";
import Link from "next/link";

const RANK_CONFIG: Record<
  UserRank,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  bronze: {
    label: "BRONZE",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: "/Bronza.png",
  },
  silver: {
    label: "SILVER",
    color: "text-slate-300",
    bg: "bg-slate-300/10",
    border: "border-slate-300/20",
    icon: "/Silver.png",
  },
  gold: {
    label: "GOLD",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    icon: "/Gold.png",
  },
  platinum: {
    label: "PLATINUM",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
    icon: "/Platinum.png",
  },
  diamond: {
    label: "DIAMOND",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    icon: "/Diamond.png",
  },
};

// Vaqtni dinamik formatlash funksiyasi
function formatTimeAgo(dateString?: Date | string) {
  if (!dateString) return "Yaqinda";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Hozirgina";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} daqiqa oldin`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} soat oldin`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} kun oldin`;
}

function Page() {
  const t = useTranslations();
  const [userData, setUserData] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getUserData();
        setUserData(data);
      } catch (err) {
        console.error("Dashboard yuklanishida xatolik:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-slate-400 animate-pulse">
          <Loader2 size={40} className="animate-spin text-blue-600" />
          <p className="font-semibold text-xs tracking-widest uppercase">
            {t("loading") || "Yuklanmoqda..."}
          </p>
        </div>
      </div>
    );
  }

  const currentRank = userData?.rank || "bronze";
  const rankStyle = RANK_CONFIG[currentRank] || RANK_CONFIG.bronze;

  const avatarUrl =
    userData?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userData?.name || "User",
    )}&background=2563eb&color=fff`;

  const stats = [
    {
      key: "balance",
      value: `$${(userData?.balance || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
      })}`,
      icon: <Wallet className="w-5 h-5" />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    },
    {
      key: "games",
      value: `${userData?.gamesCount || 0}`,
      unit: "ta",
      icon: <Gamepad2 className="w-5 h-5" />,
      color: "text-blue-500",
      bg: "bg-blue-500/10 dark:bg-blue-500/15",
    },
    {
      key: "achievements",
      value: `${userData?.achievements || 0}`,
      unit: "ta",
      icon: <Trophy className="w-5 h-5" />,
      color: "text-amber-500",
      bg: "bg-amber-500/10 dark:bg-amber-500/15",
    },
    {
      key: "playtime",
      value: `${userData?.playtime || 0}`,
      unit: "soat",
      icon: <Clock className="w-5 h-5" />,
      color: "text-purple-500",
      bg: "bg-purple-500/10 dark:bg-purple-500/15",
    },
  ];

  // Dinamik oxirgi o'yin ma'lumotlari
  const hasPlayedGame = Boolean(userData?.lastPlayedGame?.title);
  const lastGameTitle = userData?.lastPlayedGame?.title || "O'yinlar yo'q";
  const lastGameImage =
    userData?.lastPlayedGame?.image ||
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000";
  const lastPlayedFormattedTime = formatTimeAgo(
    userData?.lastPlayedGame?.lastPlayedAt,
  );

  return (
    <div className="w-full min-w-0 p-4 py-6 my-10 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      {/* --- HEADER BLOCK --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xl shadow-black/5 w-full">
        {/* User Info & Avatar */}
        <div className="flex items-center gap-4 sm:gap-5 min-w-0 w-full">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-4 ring-blue-600/20 shrink-0 shadow-lg bg-slate-800">
            <Image
              src={avatarUrl}
              alt={userData?.name || "User Avatar"}
              fill
              unoptimized
              className="object-cover"
            />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              <span className="whitespace-nowrap">
                {t("welcome") || "Xush kelibsiz,"}
              </span>{" "}
              <span className="text-blue-600 dark:text-blue-500 inline-block">
                {userData?.name || userData?.username || "Gamer"}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
              <Zap
                size={14}
                className="text-amber-500 fill-amber-500 shrink-0"
              />
              <span>{t("subtitle") || "O'yinlar va natijalar markazi"}</span>
            </p>
          </div>
        </div>

        {/* Level & Rank Badge */}
        <div className="flex items-center justify-between lg:justify-end gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200/60 dark:border-white/5 shrink-0">
          <div className="text-left lg:text-right space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase whitespace-nowrap">
              {t("level") || "DARAJA"} {userData?.level || 1}
            </span>
            <p
              className={cn(
                "text-base sm:text-lg font-black tracking-tight uppercase flex items-center gap-1.5 whitespace-nowrap",
                rankStyle.color,
              )}
            >
              <Crown size={16} /> {rankStyle.label}
            </p>
          </div>

          <div
            className={cn(
              "relative w-14 h-14 rounded-2xl flex items-center justify-center p-1.5 shadow-lg border shrink-0 overflow-hidden",
              rankStyle.bg,
              rankStyle.border,
            )}
          >
            <Image
              src={rankStyle.icon}
              alt={rankStyle.label}
              width={48}
              height={48}
              className="object-contain drop-shadow-md transition-transform duration-300 hover:scale-110"
            />
          </div>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 transition-all hover:translate-y-[-2px] hover:shadow-lg group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {t(`stats.${stat.key}`) || stat.key}
              </span>
              <div
                className={cn(
                  "p-2.5 rounded-2xl transition-transform group-hover:scale-110",
                  stat.bg,
                  stat.color,
                )}
              >
                {stat.icon}
              </div>
            </div>

            <div className="flex items-baseline gap-1.5">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stat.value}
              </h3>
              {stat.unit && (
                <span className="text-xs font-bold text-slate-400">
                  {stat.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
        {/* Banner Card - DINAMIK OXIRGI O'YIN */}
        <div className="xl:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-600" />
              {t("last_game") || "Oxirgi faollik"}
            </h2>
          </div>

          <div className="relative w-full h-[320px] sm:h-[380px] rounded-3xl overflow-hidden group border border-slate-200/80 dark:border-white/10 shadow-xl bg-slate-950">
            <Image
              src={lastGameImage}
              alt={lastGameTitle}
              fill
              unoptimized
              className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
              <div className="space-y-1.5 max-w-md">
                <Link href={"/games"}>
                  <span className="px-2.5 py-1 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-widest rounded-lg inline-flex items-center gap-1">
                    <Sparkles size={11} />
                    {hasPlayedGame
                      ? t("continue") || "Davom ettirish"
                      : "Yangi boshlash"}
                  </span>
                </Link>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                  {lastGameTitle}
                </h3>
                <p className="text-slate-300 font-medium text-xs">
                  {hasPlayedGame
                    ? `${t("last_game") || "Oxirgi marta"}: ${lastPlayedFormattedTime}`
                    : "Hali birorta ham o'yin o'ynalmagan"}
                </p>
              </div>

              {hasPlayedGame && (
                <button className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shrink-0">
                  <Play fill="currentColor" size={18} className="ml-0.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pro Pass Info Side Block */}
        <div className="space-y-3 flex flex-col justify-between">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Zap size={16} className="text-amber-500" />
            {t("info_title") || "Obuna holati"}
          </h2>

          <div
            className={cn(
              "rounded-3xl p-6 text-white relative overflow-hidden shadow-xl flex-1 flex flex-col justify-between group transition-all border",
              userData?.isPremium
                ? "bg-gradient-to-br from-amber-600 via-amber-500 to-yellow-600 border-amber-400/30"
                : "bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 border-blue-400/30",
            )}
          >
            <div className="relative z-10 space-y-3">
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                <Crown size={20} className="text-amber-300 fill-amber-300" />
              </div>

              <div>
                <h4 className="text-xl font-black tracking-tight mb-1.5">
                  {userData?.isPremium
                    ? "PRO PASS FAOL"
                    : t("premium.title") || "PRO PASS'GA O'TISH"}
                </h4>

                <p className="text-white/80 text-xs leading-relaxed font-medium">
                  {userData?.isPremium
                    ? "Sizda barcha premium imkoniyatlar faol."
                    : t("premium.description") ||
                      "Eksklyuziv imkoniyatlar va pasaytirilgan platforma komissiyasi uchun Pro Pass'ni ishga tushiring."}
                </p>
                <p className="font-extrabold text-xl text-background">
                  Faqat hozircha premium pass ishlamaydi
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-4">
              <button className="w-full py-3 px-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-slate-100 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl">
                {userData?.isPremium
                  ? "SOZLAMALAR"
                  : t("premium.button") || "PREMIUMGA O'TISH"}
              </button>
            </div>

            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 blur-3xl rounded-full group-hover:bg-white/20 transition-all duration-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
