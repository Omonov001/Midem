/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Gamepad2,
  MessageSquare,
  Users,
  Layers,
  ArrowUpRight,
  Clock,
  Ban,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

type UserData = {
  _id?: string;
  clerkId?: string;
  name?: string;
  email?: string;
  picture?: string;
  role?: string;
  isBanned?: boolean;
  lastSeen?: string;
  createdAt?: string;
};

type MessageUser = {
  _id?: string;
  name?: string;
  email?: string;
  picture?: string;
  clerkId?: string;
  role?: string;
  isBanned?: boolean;
};

type MessageData = {
  _id?: string;
  id?: string;

  /*
   * MUHIM:
   * Message modelda userId yoq.
   *
   * Schema:
   * senderId -> User
   * receiverId -> User
   */
  senderId?: MessageUser | string;
  receiverId?: MessageUser | string;

  requestType?: "game_suggestion" | "bug_report" | "partnership" | "other";

  subject?: string;
  message?: string;

  createdAt?: string;
  updatedAt?: string;
};

type GameData = {
  _id?: string;
  id?: string;

  langData?: {
    uz?: {
      title?: string;
      Maindescription?: string;
      iconPreview?: string;
    };
    en?: {
      title?: string;
      Maindescription?: string;
      iconPreview?: string;
    };
    ru?: {
      title?: string;
      Maindescription?: string;
      iconPreview?: string;
    };
    tr?: {
      title?: string;
      Maindescription?: string;
      iconPreview?: string;
    };
  };

  developerId?: string;
  developerName?: string;
  createdAt?: string;
};

type DashboardData = {
  success: boolean;

  stats: {
    users: number;
    onlineUsers: number;
    bannedUsers: number;
    games: number;
    pendingGames: number;
    messages: number;
  };

  growth: {
    usersToday: number;
    gamesToday: number;
    messagesToday: number;
  };

  recentRequests: MessageData[];
  pendingGames: GameData[];
  recentUsers: UserData[];

  updatedAt?: string;
};

/* =========================================================
   HELPERS
========================================================= */

function formatNumber(value: number) {
  return new Intl.NumberFormat("uz-UZ").format(value);
}

function formatRelativeTime(date?: string) {
  if (!date) return "Vaqt nomalum";

  const timestamp = new Date(date).getTime();

  if (Number.isNaN(timestamp)) {
    return "Vaqt nomalum";
  }

  const diff = Date.now() - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Hozirgina";
  if (minutes < 60) return `${minutes} daqiqa oldin`;
  if (hours < 24) return `${hours} soat oldin`;
  if (days < 7) return `${days} kun oldin`;

  return new Date(date).toLocaleDateString("uz-UZ");
}

/*
 * =========================================================
 * MESSAGE USER
 * =========================================================
 *
 * Backend populate qilganda:
 *
 * senderId: {
 *   _id: "...",
 *   name: "Ibrohimjon",
 *   email: "...",
 *   picture: "...",
 *   clerkId: "...",
 *   role: "user"
 * }
 *
 * Shu sababli oldingi:
 *
 * message.userName
 * message.username
 * message.user
 *
 * notogri edi.
 */

function getMessageUser(message: MessageData) {
  const sender = message.senderId;

  // senderId populate qilingan object bolsa
  if (sender && typeof sender === "object") {
    if (sender.name?.trim()) {
      return sender.name;
    }

    if (sender.email?.trim()) {
      return sender.email.split("@")[0];
    }

    if (sender.clerkId?.trim()) {
      return sender.clerkId;
    }
  }

  // senderId faqat ObjectId string bolib kelgan holat
  if (typeof sender === "string" && sender.trim()) {
    return sender;
  }

  return "Nomalum foydalanuvchi";
}

/*
 * Message modeldagi haqiqiy field:
 *
 * subject
 * message
 *
 * text/content yoq.
 */

function getMessageText(message: MessageData) {
  return (
    message.message?.trim() ||
    message.subject?.trim() ||
    "Xabar matni mavjud emas."
  );
}

function getGameName(game: GameData) {
  return (
    game.langData?.uz?.title ||
    game.langData?.en?.title ||
    game.langData?.ru?.title ||
    game.langData?.tr?.title ||
    "Nomsiz oyin"
  );
}

function getRequestTypeLabel(type?: MessageData["requestType"]) {
  switch (type) {
    case "game_suggestion":
      return "Oyin";

    case "bug_report":
      return "Bug";

    case "partnership":
      return "Hamkorlik";

    case "other":
      return "Boshqa";

    default:
      return null;
  }
}

/* =========================================================
   PAGE
========================================================= */

function Page() {
  const [mounted, setMounted] = useState(false);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /* =======================================================
     MOUNT
  ======================================================= */

  useEffect(() => {
    setMounted(true);
  }, []);

  /* =======================================================
     FETCH DASHBOARD
  ======================================================= */

  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const response = await fetch("/api/admin/dashboard", {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message || "Dashboard malumotlarini yuklashda xatolik.",
        );
      }

      setDashboard(data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Dashboard malumotlarini yuklashda xatolik yuz berdi.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =======================================================
     INITIAL FETCH + AUTO REFRESH
  ======================================================= */

  useEffect(() => {
    if (!mounted) return;

    fetchDashboard();

    const interval = setInterval(() => {
      fetchDashboard(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [mounted]);

  /* =======================================================
     SSR HYDRATION PROTECTION
  ======================================================= */

  if (!mounted) {
    return null;
  }

  const stats = dashboard?.stats;

  const growth = dashboard?.growth;

  /* =======================================================
     STATISTICS
  ======================================================= */

  const statsData = [
    {
      id: 1,

      name: "Oyin sorovlari",

      value: stats?.pendingGames ?? 0,

      change: `+${growth?.gamesToday ?? 0} bugun`,

      icon: Gamepad2,

      color: "text-blue-500",

      bg: "bg-blue-50 dark:bg-blue-950/30",
    },

    {
      id: 2,

      name: "Foydalanuvchi sorovlari",

      value: stats?.messages ?? 0,

      change: `+${growth?.messagesToday ?? 0} bugun`,

      icon: MessageSquare,

      color: "text-emerald-500",

      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },

    {
      id: 3,

      name: "Jami foydalanuvchilar",

      value: stats?.users ?? 0,

      change: `+${growth?.usersToday ?? 0} bugun`,

      icon: Users,

      color: "text-purple-500",

      bg: "bg-purple-50 dark:bg-purple-950/30",
    },

    {
      id: 4,

      name: "Faol oyinlar",

      value: stats?.games ?? 0,

      change: `${stats?.onlineUsers ?? 0} online user`,

      icon: Layers,

      color: "text-amber-500",

      bg: "bg-amber-50 dark:bg-amber-500/10",
    },
  ];

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-500">
      <main className="flex-1 my-15 max-md:my-20 max-w-7xl mx-auto w-full overflow-hidden px-4 sm:px-6 lg:px-0">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent dark:from-violet-400 dark:to-indigo-300">
              Admin Dashboard
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Midem loyihasining real vaqtdagi boshqaruv markazi
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* TODAY */}

            <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />

                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>

              <span className="text-slate-400 dark:text-slate-500 font-medium">
                Bugun:
              </span>

              <span className="tracking-tight text-slate-700 dark:text-slate-200">
                {new Date().toLocaleDateString("uz-UZ", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* REFRESH */}

            <button
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all disabled:opacity-50"
              title="Yangilash"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-6 p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />

              <div>
                <p className="font-bold text-sm text-rose-700 dark:text-rose-400">
                  Dashboard yuklanmadi
                </p>

                <p className="text-xs text-rose-600/80 dark:text-rose-400/70 mt-0.5">
                  {error}
                </p>
              </div>
            </div>

            <button
              onClick={() => fetchDashboard()}
              className="px-3 py-2 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors"
            >
              Qayta urinish
            </button>
          </motion.div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {
              opacity: 0,
            },

            show: {
              opacity: 1,

              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
          className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-5 mb-8"
        >
          {statsData.map((stat) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.id}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 10,
                  },

                  show: {
                    opacity: 1,
                    y: 0,

                    transition: {
                      type: "spring",
                      stiffness: 120,
                    },
                  },
                }}
                whileHover={{
                  y: -2,
                }}
                className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50 flex items-center justify-between cursor-pointer group transition-all"
              >
                <div className="space-y-1 min-w-0 pr-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {stat.name}
                  </p>

                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-xl sm:text-xl font-extrabold tracking-tight">
                      {loading ? "—" : `${formatNumber(stat.value)} ta`}
                    </span>

                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {loading ? "" : stat.change}
                    </span>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl shrink-0 ${stat.bg} ${stat.color} group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5.5 h-5.5" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* =================================================
            MAIN PANELS
        ================================================= */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* =================================================
              PENDING GAMES
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50 flex flex-col justify-between min-h-[340px]"
          >
            <div>
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
                    Kutilayotgan Oyinlar
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Dasturchilardan kelgan arizalar royxati
                  </p>
                </div>

                <span className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Gamepad2 className="w-6 h-6" />
                </span>
              </div>

              {/* LOADING */}

              {loading ? (
                <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 my-5 text-center">
                  <RefreshCw className="w-8 h-8 text-indigo-500 mx-auto mb-3 animate-spin" />

                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    Malumotlar yuklanmoqda...
                  </p>
                </div>
              ) : dashboard?.pendingGames?.length ? (
                /* GAMES */

                <div className="space-y-3 my-5">
                  {dashboard.pendingGames.map((game, index) => (
                    <div
                      key={game._id || game.id || index}
                      className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/60 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200 truncate">
                            {getGameName(game)}
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            {formatRelativeTime(game.createdAt)}
                          </p>
                        </div>

                        <span className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold">
                          Kutilmoqda
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* EMPTY */

                <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 my-5 text-center">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto mb-3" />

                  <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
                    Hozircha yangi oyin sorovi yoq
                  </p>

                  <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
                    Yangi arizalar shu yerda korinadi
                  </p>
                </div>
              )}
            </div>

            <button className="w-full mt-4 py-3.5 px-5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-sm hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group shadow-md">
              Sorovlarni boshqarish
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </motion.div>

          {/* =================================================
              USER REQUESTS
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50"
          >
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  Oxirgi Foydalanuvchi Sorovlari
                </h2>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Foydalanuvchilardan kelgan sorov va xabarlar
                </p>
              </div>

              <span className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                <MessageSquare className="w-6 h-6" />
              </span>
            </div>

            {/* LOADING */}

            {loading ? (
              <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                <RefreshCw className="w-7 h-7 text-emerald-500 mx-auto mb-3 animate-spin" />

                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  Sorovlar yuklanmoqda...
                </p>
              </div>
            ) : dashboard?.recentRequests?.length ? (
              /* REQUESTS */

              <div className="space-y-4">
                {dashboard.recentRequests.map((req, index) => {
                  const requestType = getRequestTypeLabel(req.requestType);

                  return (
                    <div
                      key={req._id || req.id || index}
                      className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                    >
                      {/* USER + DATE */}

                      <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-extrabold text-sm sm:text-base text-indigo-600 dark:text-indigo-400 truncate">
                            {getMessageUser(req)}
                          </span>

                          {requestType && (
                            <span className="shrink-0 px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[9px] font-extrabold uppercase">
                              {requestType}
                            </span>
                          )}
                        </div>

                        <span className="text-xs text-slate-400 font-semibold">
                          {formatRelativeTime(req.createdAt)}
                        </span>
                      </div>

                      {/* SUBJECT */}

                      {req.subject && (
                        <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1.5">
                          {req.subject}
                        </p>
                      )}

                      {/* MESSAGE */}

                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                        {getMessageText(req)}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* EMPTY */

              <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-3" />

                <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Hozircha sorovlar yoq
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Yangi foydalanuvchi sorovlari shu yerda chiqadi
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* =================================================
            SYSTEM OVERVIEW
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.3,
          }}
          className="mt-6 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Tizim holati
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Dashboard real malumotlar bilan ishlamoqda
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* ONLINE */}

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {stats?.onlineUsers ?? 0} online
              </div>

              {/* BANNED */}

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-bold">
                <Ban className="w-3.5 h-3.5" />
                {stats?.bannedUsers ?? 0} banned
              </div>

              {/* UPDATED */}

              {dashboard?.updatedAt && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />

                  {formatRelativeTime(dashboard.updatedAt)}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default Page;
