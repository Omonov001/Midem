/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";

import { useAuth, useUser } from "@clerk/nextjs";

import {
  Gamepad2,
  Newspaper,
  MessageSquare,
  Star,
  ArrowUpRight,
  TrendingUp,
  Wallet,
  X,
  CreditCard,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Lock,
} from "lucide-react";

import { cn } from "@/lib/utils";

// ======================================================
// TYPES
// ======================================================

type GameItem = {
  _id: string;
  title: string;
  icon: string | null;
  status: string;
  visibility: string;
  priceType: string;
  price: number;
  createdAt: string;
};

type NewsItem = {
  _id: string;
  slug: string;
  title: string;
  icon: string | null;
  status: string;
  visibility: string;
  createdAt: string;
};

// ======================================================
// CONSTANTS
// ======================================================

const MIN_PAYOUT = 20;
const BALANCE_LOAD_DELAY = 1500;

// ======================================================
// COMPONENT
// ======================================================

export default function DeveloperDashboard() {
  const { user: clerkUser, isLoaded } = useUser();

  const { isLoaded: authLoaded, isSignedIn } = useAuth();

  // ====================================================
  // BALANCE
  // ====================================================

  const [availableBalance, setAvailableBalance] = useState<number | null>(null);

  const [pendingBalance, setPendingBalance] = useState<number | null>(null);

  const [totalEarnings, setTotalEarnings] = useState<number | null>(null);

  const [loadingBalance, setLoadingBalance] = useState<boolean>(true);

  // ====================================================
  // DEVELOPER DATA
  // ====================================================

  const [gamesCount, setGamesCount] = useState<number | null>(null);

  const [newsCount, setNewsCount] = useState<number | null>(null);

  const [latestGames, setLatestGames] = useState<GameItem[]>([]);

  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);

  const [loadingDeveloper, setLoadingDeveloper] = useState<boolean>(true);

  // ====================================================
  // PAYOUT MODAL
  // ====================================================

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [cardNumber, setCardNumber] = useState<string>("");

  const [cardholderName, setCardholderName] = useState<string>("");

  const [cardExpiry, setCardExpiry] = useState<string>("");

  const [country, setCountry] = useState<string>("Uzbekistan");

  const [submitting, setSubmitting] = useState<boolean>(false);

  // ====================================================
  // FEEDBACK
  // ====================================================

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ====================================================
  // LOAD BALANCE
  // ====================================================

  const loadBalance = async () => {
    if (!clerkUser) return;

    try {
      setLoadingBalance(true);

      const response = await fetch(`/api/users/${clerkUser.id}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        console.error("BALANCE API ERROR:", {
          status: response.status,
          data: errorData,
          clerkId: clerkUser.id,
        });

        throw new Error(
          errorData?.error || `Balance API error: ${response.status}`,
        );
      }

      const data = await response.json();

      setAvailableBalance(Number(data.balance ?? 0));

      setPendingBalance(Number(data.pendingBalance ?? 0));

      setTotalEarnings(Number(data.totalEarnings ?? 0));
    } catch (error) {
      console.error("Balance load error:", error);

      setAvailableBalance(0);

      setPendingBalance(0);

      setTotalEarnings(0);
    } finally {
      setLoadingBalance(false);
    }
  };

  // ====================================================
  // LOAD DEVELOPER DATA
  // ====================================================

  const loadDeveloperData = async () => {
    if (!clerkUser) return;

    try {
      setLoadingDeveloper(true);

      const response = await fetch(
        `/api/developer?developerId=${encodeURIComponent(clerkUser.id)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Developer malumotlarini olishda xatolik",
        );
      }

      setGamesCount(Number(data.gamesCount ?? 0));

      setNewsCount(Number(data.newsCount ?? 0));

      setLatestGames(Array.isArray(data.latestGames) ? data.latestGames : []);

      setLatestNews(Array.isArray(data.latestNews) ? data.latestNews : []);
    } catch (error) {
      console.error("Developer data load error:", error);

      setGamesCount(0);

      setNewsCount(0);

      setLatestGames([]);

      setLatestNews([]);
    } finally {
      setLoadingDeveloper(false);
    }
  };

  // ====================================================
  // INITIAL BALANCE LOAD
  // ====================================================
  //
  // FLOW:
  // Clerk user loaded
  //        ↓
  // Auth loaded
  //        ↓
  // Signed in
  //        ↓
  // 1.5 second wait
  //        ↓
  // Balance API
  //        ↓
  // Show balance
  //
  // ====================================================

  useEffect(() => {
    if (!isLoaded || !authLoaded || !isSignedIn || !clerkUser) {
      return;
    }

    // User/auth tayyor bo'lganda ham darhol 0 ko'rsatmaymiz.
    // Balance loading holatida qoladi.
    setLoadingBalance(true);

    const timer = window.setTimeout(() => {
      loadBalance();
    }, BALANCE_LOAD_DELAY);

    return () => {
      window.clearTimeout(timer);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, authLoaded, isSignedIn, clerkUser]);

  // ====================================================
  // INITIAL DEVELOPER DATA LOAD
  // ====================================================

  useEffect(() => {
    if (!isLoaded || !authLoaded || !isSignedIn || !clerkUser) {
      return;
    }

    loadDeveloperData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, authLoaded, isSignedIn, clerkUser]);

  // ====================================================
  // CARD NUMBER FORMAT
  // ====================================================

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 16);

    return numbers.replace(/(.{4})/g, "$1 ").trim();
  };

  // ====================================================
  // EXPIRY FORMAT
  // ====================================================

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 4);

    if (numbers.length <= 2) {
      return numbers;
    }

    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  };

  // ====================================================
  // PAYOUT
  // ====================================================

  const handlePayout = async () => {
    if (!clerkUser) return;

    if (availableBalance === null || availableBalance < MIN_PAYOUT) {
      setFeedback({
        type: "error",
        message: `Minimal yechish summasi $${MIN_PAYOUT}.`,
      });

      return;
    }

    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
      setFeedback({
        type: "error",
        message: "Karta raqamini toliq kiriting.",
      });

      return;
    }

    if (!cardholderName.trim()) {
      setFeedback({
        type: "error",
        message: "Karta egasining ismini kiriting.",
      });

      return;
    }

    if (!cardExpiry || cardExpiry.length !== 5) {
      setFeedback({
        type: "error",
        message: "Karta amal qilish muddatini togri kiriting.",
      });

      return;
    }

    try {
      setSubmitting(true);

      setFeedback(null);

      const response = await fetch("/api/payout/request", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          cardNumber,
          cardholderName,
          cardExpiry,
          country,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Payout sorovini yuborishda xatolik");
      }

      setFeedback({
        type: "success",
        message: "Payout sorovi muvaffaqiyatli yuborildi.",
      });

      setCardNumber("");

      setCardholderName("");

      setCardExpiry("");

      await loadBalance();

      setTimeout(() => {
        setIsModalOpen(false);

        setFeedback(null);
      }, 1800);
    } catch (error: any) {
      console.error("Payout error:", error);

      setFeedback({
        type: "error",
        message: error?.message || "Payout sorovini yuborishda xatolik.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ====================================================
  // STATUS LABEL
  // ====================================================

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Active";

      case "requested":
        return "Review";

      case "rejected":
        return "Rejected";

      default:
        return status;
    }
  };

  // ====================================================
  // STATUS CLASS
  // ====================================================

  const getStatusClass = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";

      case "requested":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";

      case "rejected":
        return "bg-red-500/10 text-red-500 border border-red-500/20";

      default:
        return "bg-slate-500/10 text-slate-500 border border-slate-500/20";
    }
  };

  // ====================================================
  // STATS
  // ====================================================

  const stats = [
    {
      label: "Jami O'yinlar",

      value: loadingDeveloper ? "..." : `${gamesCount ?? 0} ta`,

      change: "Siz yaratgan oyinlar",

      icon: <Gamepad2 size={22} />,

      color: "from-blue-600 to-cyan-500",

      shadow: "shadow-blue-500/10",

      disabled: false,
    },

    {
      label: "Yangiliklar / Patchlar",

      value: loadingDeveloper ? "..." : `${newsCount ?? 0} ta`,

      change: "Siz yozgan yangiliklar",

      icon: <Newspaper size={22} />,

      color: "from-purple-600 to-indigo-500",

      shadow: "shadow-purple-500/10",

      disabled: false,
    },

    {
      label: "Yangi Izohlar",

      value: "Soon",

      change: "Tez orada",

      icon: <MessageSquare size={22} />,

      color: "from-emerald-600 to-teal-500",

      shadow: "shadow-emerald-500/10",

      disabled: true,
    },

    {
      label: "O'rtacha Reyting",

      value: "Soon",

      change: "Tez orada",

      icon: <Star size={22} />,

      color: "from-amber-500 to-orange-500",

      shadow: "shadow-amber-500/10",

      disabled: true,
    },
  ];

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="min-h-screen my-10 bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              Xush kelibsiz, {clerkUser?.firstName || "Developer"}!
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Loyihalaringiz va daromadlaringizni bir joydan boshqaring.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            disabled={
              loadingBalance ||
              availableBalance === null ||
              availableBalance < MIN_PAYOUT
            }
            className={cn(
              "flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all",

              availableBalance !== null && availableBalance >= MIN_PAYOUT
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 hover:-translate-y-0.5"
                : "bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed",
            )}
          >
            <Wallet size={18} />
            Yechib olish
          </button>
        </div>

        {/* ==================================================
            STATS
        ================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                "group relative p-5 sm:p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm transition-all duration-300 overflow-hidden",

                stat.shadow,

                stat.disabled
                  ? "opacity-40 grayscale cursor-not-allowed"
                  : "hover:shadow-xl hover:-translate-y-1",
              )}
            >
              <div
                className={cn(
                  "absolute -right-8 -top-8 w-28 h-28 rounded-full bg-gradient-to-br blur-2xl opacity-10",
                  stat.color,
                )}
              />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg",
                      stat.color,
                    )}
                  >
                    {stat.icon}
                  </div>

                  {stat.disabled ? (
                    <Lock size={16} className="text-slate-400" />
                  ) : (
                    <ArrowUpRight
                      size={18}
                      className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors"
                    />
                  )}
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>

                  <h3 className="mt-1 text-2xl font-black tracking-tight">
                    {stat.value}
                  </h3>

                  <p className="mt-1 text-[11px] font-medium text-slate-400">
                    {stat.change}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ==================================================
            BALANCE
        ================================================== */}

        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 rounded-2xl p-5 sm:p-6 lg:p-7 mb-6 text-white border border-white/5 shadow-xl">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Available */}

            <div>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                <Wallet size={15} />
                Mavjud balans
              </div>

              <div className="mt-2 text-3xl sm:text-4xl font-black">
                {loadingBalance || availableBalance === null
                  ? "..."
                  : `$${availableBalance.toFixed(2)}`}
              </div>

              <p className="mt-1 text-xs text-slate-500">Yechib olish mumkin</p>
            </div>

            {/* Pending */}

            <div>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                <Clock size={15} />
                Pending
              </div>

              <div className="mt-2 text-3xl sm:text-4xl font-black">
                {loadingBalance || pendingBalance === null
                  ? "..."
                  : `$${pendingBalance.toFixed(2)}`}
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Tasdiqlanishi kutilmoqda
              </p>
            </div>

            {/* Total */}

            <div>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                <TrendingUp size={15} />
                Jami daromad
              </div>

              <div className="mt-2 text-3xl sm:text-4xl font-black">
                {loadingBalance || totalEarnings === null
                  ? "..."
                  : `$${totalEarnings.toFixed(2)}`}
              </div>

              <p className="mt-1 text-xs text-slate-500">Barcha vaqtlar</p>
            </div>
          </div>

          {/* Payout info */}

          <div className="relative mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs text-slate-400">
              Minimal payout:{" "}
              <span className="font-bold text-white">${MIN_PAYOUT}</span>
            </div>

            {loadingBalance || availableBalance === null ? (
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                <Loader2 size={15} className="animate-spin" />
                Balans yuklanmoqda...
              </div>
            ) : availableBalance >= MIN_PAYOUT ? (
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 size={15} />
                Payout mavjud
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                <Clock size={15} />
                Yana ${(MIN_PAYOUT - availableBalance).toFixed(2)} kerak
              </div>
            )}
          </div>
        </div>

        {/* ==================================================
            GAMES + NEWS
        ================================================== */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* YOUR GAMES */}

          <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-black">Sizning o'yinlaringiz</h2>

                <p className="text-xs text-slate-400 mt-1">
                  Oxirgi Joylangan o'yinlar
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-bold">
                <Gamepad2 size={14} />

                {loadingDeveloper ? "..." : (gamesCount ?? 0)}
              </div>
            </div>

            {loadingDeveloper ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-[72px] rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse"
                  />
                ))}
              </div>
            ) : latestGames.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                  <Gamepad2
                    size={28}
                    className="text-slate-300 dark:text-slate-700"
                  />
                </div>

                <p className="mt-4 text-sm font-bold text-slate-400">
                  Hali oyinlaringiz yoq
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Birinchi oyiningizni yarating.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {latestGames.map((game) => (
                  <div
                    key={game._id}
                    className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      {game.icon ? (
                        <img
                          src={game.icon}
                          alt={game.title}
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-white/10"
                        />
                      ) : (
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white shrink-0">
                          {game.title.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {game.title}
                        </h4>

                        <div className="flex items-center gap-2 mt-1">
                          {game.visibility === "public" ? (
                            <span className="flex items-center gap-1 text-[10px] text-slate-500">
                              <Eye size={10} />
                              Public
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] text-slate-500">
                              <Lock size={10} />
                              Private
                            </span>
                          )}

                          <span className="text-slate-300 dark:text-slate-700">
                            •
                          </span>

                          <span className="text-[10px] text-slate-500">
                            {game.priceType === "paid"
                              ? `$${Number(game.price).toFixed(2)}`
                              : "Free"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "shrink-0 text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                        getStatusClass(game.status),
                      )}
                    >
                      {getStatusLabel(game.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* YOUR NEWS */}

          <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-black">Sizning yangiliklaringiz</h2>

                <p className="text-xs text-slate-400 mt-1">
                  Oxirgi yozilgan yangiliklar
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-500 text-xs font-bold">
                <Newspaper size={14} />

                {loadingDeveloper ? "..." : (newsCount ?? 0)}
              </div>
            </div>

            {loadingDeveloper ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-[72px] rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse"
                  />
                ))}
              </div>
            ) : latestNews.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                  <Newspaper
                    size={28}
                    className="text-slate-300 dark:text-slate-700"
                  />
                </div>

                <p className="mt-4 text-sm font-bold text-slate-400">
                  Hali yangiliklaringiz yoq
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Birinchi yangiligingizni yozing.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {latestNews.map((news) => (
                  <div
                    key={news._id}
                    className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      {news.icon ? (
                        <img
                          src={news.icon}
                          alt={news.title}
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-white/10"
                        />
                      ) : (
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
                          <Newspaper size={20} />
                        </div>
                      )}

                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {news.title}
                        </h4>

                        <div className="flex items-center gap-2 mt-1">
                          {news.visibility === "public" ? (
                            <span className="flex items-center gap-1 text-[10px] text-slate-500">
                              <Eye size={10} />
                              Public
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] text-slate-500">
                              <Lock size={10} />
                              Private
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "shrink-0 text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                        getStatusClass(news.status),
                      )}
                    >
                      {getStatusLabel(news.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ==================================================
            COMMENTS — SOON
        ================================================== */}

        <div className="relative overflow-hidden bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-5 sm:p-6 mb-6">
          <div className="absolute inset-0 backdrop-blur-[3px] bg-white/20 dark:bg-slate-950/20 z-10" />

          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="px-5 py-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />

                <span className="text-sm font-black">Comments — Soon</span>
              </div>

              <p className="text-[10px] text-slate-400 mt-1 text-center">
                Hozircha comments bolimi mavjud emas
              </p>
            </div>
          </div>

          <div className="opacity-30 pointer-events-none">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-black">Jonli sharhlar</h2>

                <p className="text-xs text-slate-400 mt-1">
                  Oyinlaringizga yozilgan izohlar
                </p>
              </div>

              <MessageSquare size={20} className="text-slate-400" />
            </div>

            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-16 rounded-xl bg-slate-100 dark:bg-white/5"
                />
              ))}
            </div>
          </div>
        </div>

        {/* ==================================================
            RATING — SOON
        ================================================== */}

        <div className="relative overflow-hidden bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-5 sm:p-6">
          <div className="absolute inset-0 backdrop-blur-[3px] bg-white/20 dark:bg-slate-950/20 z-10" />

          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="px-5 py-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-amber-500" />

                <span className="text-sm font-black">Rating — Soon</span>
              </div>

              <p className="text-[10px] text-slate-400 mt-1 text-center">
                Hozircha rating bolimi mavjud emas
              </p>
            </div>
          </div>

          <div className="opacity-30 pointer-events-none">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Star size={22} className="text-amber-500" />
              </div>

              <div>
                <p className="text-xs text-slate-400">O'rtacha reyting</p>

                <p className="text-2xl font-black">4.8</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================
          PAYOUT MODAL
      ==================================================== */}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}

          <button
            type="button"
            aria-label="Close modal"
            onClick={() => {
              if (!submitting) {
                setIsModalOpen(false);

                setFeedback(null);
              }
            }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
          />

          {/* Modal */}

          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
            {/* Header */}

            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/10">
              <div>
                <h2 className="text-lg font-black">Payout</h2>

                <p className="text-xs text-slate-400 mt-1">
                  Mablag'ni kartangizga yechib oling.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!submitting) {
                    setIsModalOpen(false);

                    setFeedback(null);
                  }
                }}
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}

            <div className="p-5 space-y-4">
              {/* Balance */}

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Yechiladigan summa
                  </span>

                  <span className="text-lg font-black text-blue-500">
                    {availableBalance === null
                      ? "..."
                      : `$${availableBalance.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Card Number */}

              <div>
                <label className="block text-xs font-bold mb-2">
                  Karta raqami
                </label>

                <div className="relative">
                  <CreditCard
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(event) =>
                      setCardNumber(formatCardNumber(event.target.value))
                    }
                    placeholder="8600 0000 0000 0000"
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Cardholder */}

              <div>
                <label className="block text-xs font-bold mb-2">
                  Karta egasi
                </label>

                <input
                  type="text"
                  value={cardholderName}
                  onChange={(event) => setCardholderName(event.target.value)}
                  placeholder="CARDHOLDER NAME"
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-500 transition-colors text-sm"
                />
              </div>

              {/* Expiry + Country */}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-2">
                    Amal qilish muddati
                  </label>

                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(event) =>
                      setCardExpiry(formatExpiry(event.target.value))
                    }
                    placeholder="MM/YY"
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2">
                    Country
                  </label>

                  <input
                    type="text"
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Feedback */}

              {feedback && (
                <div
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl text-xs font-semibold",

                    feedback.type === "success"
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-500 border border-red-500/20",
                  )}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 size={17} className="shrink-0" />
                  ) : (
                    <AlertCircle size={17} className="shrink-0" />
                  )}

                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Submit */}

              <button
                type="button"
                onClick={handlePayout}
                disabled={
                  submitting ||
                  loadingBalance ||
                  availableBalance === null ||
                  availableBalance < MIN_PAYOUT
                }
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Yuborilmoqda...
                  </>
                ) : (
                  <>
                    <Wallet size={17} />
                    Payout sorovini yuborish
                  </>
                )}
              </button>

              <p className="text-[10px] leading-relaxed text-center text-slate-400">
                Payout sorovi yuborilgandan so'ng mablag' tekshiruvdan
                o'tkaziladi.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
