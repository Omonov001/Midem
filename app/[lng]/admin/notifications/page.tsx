"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Globe2,
  User,
  Clock,
  X,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Eye,
  Users,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

// =========================================================
// TYPES
// =========================================================

type NotificationRecipientType = "public" | "user";

type NotificationType =
  | "system"
  | "message"
  | "achievement"
  | "payment"
  | "admin"
  | "account";

interface NotificationTranslation {
  title: string;
  message: string;
}

interface NotificationTranslations {
  uz: NotificationTranslation;
  ru: NotificationTranslation;
  en: NotificationTranslation;
  tr: NotificationTranslation;
}

interface NotificationItem {
  _id: string;

  recipientType: NotificationRecipientType;

  // Recipient
  userId?: string | null;
  userName?: string | null;

  type: NotificationType;

  translations: NotificationTranslations;

  isRead: boolean;
  readBy: string[];

  // Sender
  senderId?: string | null;
  senderName?: string | null;

  link?: string | null;

  createdAt: string;
  updatedAt: string;
}

interface NotificationsResponse {
  success?: boolean;
  notifications?: NotificationItem[];
  total?: number;
  message?: string;
}

interface DeleteConfirmState {
  isOpen: boolean;
  id?: string;
  title?: string;
}

// =========================================================
// USER TYPES
// =========================================================

interface UserItem {
  _id?: string;
  clerkId?: string;
  name?: string;
  email?: string;
  picture?: string;
}

// =========================================================
// PAGE
// =========================================================

export default function NotificationsPage() {
  // =======================================================
  // DATA
  // =======================================================

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // =======================================================
  // USERS
  // =======================================================

  const [users, setUsers] = useState<UserItem[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);

  // =======================================================
  // FILTERS
  // =======================================================

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);

  // =======================================================
  // SELECTED NOTIFICATION
  // =======================================================

  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);

  // =======================================================
  // DELETE
  // =======================================================

  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    isOpen: false,
  });

  const [isDeleting, setIsDeleting] = useState(false);

  // =======================================================
  // TOAST
  // =======================================================

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);

    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // =======================================================
  // TYPE MAP
  // =======================================================

  const typeMap: Record<
    NotificationType,
    {
      label: string;
      color: string;
    }
  > = {
    system: {
      label: "System",
      color: "bg-slate-500/10 text-slate-500",
    },

    message: {
      label: "Message",
      color: "bg-indigo-500/10 text-indigo-500",
    },

    achievement: {
      label: "Achievement",
      color: "bg-amber-500/10 text-amber-500",
    },

    payment: {
      label: "Payment",
      color: "bg-emerald-500/10 text-emerald-500",
    },

    admin: {
      label: "Admin",
      color: "bg-rose-500/10 text-rose-500",
    },

    account: {
      label: "Account",
      color: "bg-violet-500/10 text-violet-500",
    },
  };

  // =======================================================
  // FILTER OPTIONS
  // =======================================================

  const filterOptions = [
    {
      value: "all",
      label: "Barchasi",
    },
    {
      value: "public",
      label: "Public",
    },
    {
      value: "user",
      label: "Private",
    },
    {
      value: "unread",
      label: "Oqilmagan",
    },
    {
      value: "read",
      label: "Oqilgan",
    },
  ];

  // =======================================================
  // FETCH USERS
  // =======================================================

  const fetchUsers = async () => {
    try {
      setIsUsersLoading(true);

      const response = await fetch("/api/users", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      console.log("USERS API:", data);

      if (!response.ok) {
        console.error(
          "Users API error:",
          data?.message || "Foydalanuvchilarni olishda xatolik",
        );

        return;
      }

      /*
       * /api/users response quyidagilardan biri bo'lishi mumkin:
       *
       * {
       *   users: [...]
       * }
       *
       * yoki:
       *
       * [...]
       */

      const receivedUsers: UserItem[] = Array.isArray(data)
        ? data
        : Array.isArray(data.users)
          ? data.users
          : Array.isArray(data.data)
            ? data.data
            : [];

      setUsers(receivedUsers);
    } catch (error) {
      console.error("GET /api/users xatosi:", error);
    } finally {
      setIsUsersLoading(false);
    }
  };

  // =======================================================
  // USER MAP
  // =======================================================

  const usersByClerkId = useMemo(() => {
    const map = new Map<string, UserItem>();

    for (const user of users) {
      if (user.clerkId) {
        map.set(user.clerkId, user);
      }
    }

    return map;
  }, [users]);

  // =======================================================
  // GET USER BY CLERK ID
  // =======================================================

  const getUserByClerkId = (clerkId?: string | null) => {
    if (!clerkId) {
      return null;
    }

    return usersByClerkId.get(clerkId) || null;
  };

  // =======================================================
  // FETCH NOTIFICATIONS
  // =======================================================

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      /*
       * Notificationlar va users parallel yuklanadi.
       * Notification ichidagi userId = Clerk ID sifatida ishlatiladi.
       */

      const [notificationsResponse] = await Promise.all([
        fetch("/api/notifications", {
          method: "GET",
          cache: "no-store",
        }),
        fetchUsers(),
      ]);

      const data: NotificationsResponse = await notificationsResponse.json();

      console.log("NOTIFICATIONS API:", data);

      if (!notificationsResponse.ok) {
        throw new Error(
          data.message || "Notificationlarni olishda xatolik yuz berdi",
        );
      }

      setNotifications(
        Array.isArray(data.notifications) ? data.notifications : [],
      );
    } catch (error) {
      console.error("GET /api/notifications xatosi:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Notificationlarni olishda xatolik yuz berdi",
      );

      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
  }, []);

  // =======================================================
  // CLOSE DROPDOWN OUTSIDE
  // =======================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setFilterDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =======================================================
  // HELPERS
  // =======================================================

  const getTitle = (notification: NotificationItem) => {
    return (
      notification.translations?.uz?.title ||
      notification.translations?.en?.title ||
      notification.translations?.ru?.title ||
      notification.translations?.tr?.title ||
      "Nomsiz notification"
    );
  };

  const getMessage = (notification: NotificationItem) => {
    return (
      notification.translations?.uz?.message ||
      notification.translations?.en?.message ||
      notification.translations?.ru?.message ||
      notification.translations?.tr?.message ||
      ""
    );
  };

  // =======================================================
  // RECIPIENT NAME — CLERK ID ORQALI
  // =======================================================

  const getRecipientName = (notification: NotificationItem) => {
    if (notification.recipientType === "public") {
      return "Barcha foydalanuvchilar";
    }

    /*
     * 1. Agar API notificationning o'zida userName yuborsa,
     *    shu ishlatiladi.
     */

    if (notification.userName) {
      return notification.userName;
    }

    /*
     * 2. userId aslida Clerk ID.
     *    /api/users dan shu Clerk ID bo'yicha user topamiz.
     */

    const user = getUserByClerkId(notification.userId);

    if (user?.name) {
      return user.name;
    }

    /*
     * 3. Agar name bo'lmasa emailni ko'rsatamiz.
     */

    if (user?.email) {
      return user.email;
    }

    /*
     * 4. Eng oxirgi fallback.
     */

    if (notification.userId) {
      return notification.userId;
    }

    return "Nomalum foydalanuvchi";
  };

  const getSenderName = (notification: NotificationItem) => {
    return notification.senderName || "System";
  };

  const getReadStatus = (notification: NotificationItem) => {
    if (notification.recipientType === "public") {
      return notification.readBy?.length > 0;
    }

    return notification.isRead;
  };

  // =======================================================
  // FILTER + SEARCH
  // =======================================================

  const filteredNotifications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return notifications.filter((notification) => {
      const uzTitle = notification.translations?.uz?.title?.toLowerCase() || "";

      const uzMessage =
        notification.translations?.uz?.message?.toLowerCase() || "";

      const enTitle = notification.translations?.en?.title?.toLowerCase() || "";

      const enMessage =
        notification.translations?.en?.message?.toLowerCase() || "";

      const ruTitle = notification.translations?.ru?.title?.toLowerCase() || "";

      const ruMessage =
        notification.translations?.ru?.message?.toLowerCase() || "";

      const trTitle = notification.translations?.tr?.title?.toLowerCase() || "";

      const trMessage =
        notification.translations?.tr?.message?.toLowerCase() || "";

      const id = notification._id?.toLowerCase() || "";

      const userId = notification.userId?.toLowerCase() || "";

      const userName = getRecipientName(notification)?.toLowerCase() || "";

      const senderId = notification.senderId?.toLowerCase() || "";

      const senderName = notification.senderName?.toLowerCase() || "";

      const link = notification.link?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        uzTitle.includes(query) ||
        uzMessage.includes(query) ||
        enTitle.includes(query) ||
        enMessage.includes(query) ||
        ruTitle.includes(query) ||
        ruMessage.includes(query) ||
        trTitle.includes(query) ||
        trMessage.includes(query) ||
        id.includes(query) ||
        userId.includes(query) ||
        userName.includes(query) ||
        senderId.includes(query) ||
        senderName.includes(query) ||
        link.includes(query);

      let matchesFilter = true;

      if (selectedFilter === "public") {
        matchesFilter = notification.recipientType === "public";
      }

      if (selectedFilter === "user") {
        matchesFilter = notification.recipientType === "user";
      }

      if (selectedFilter === "unread") {
        if (notification.recipientType === "public") {
          matchesFilter = notification.readBy?.length === 0;
        } else {
          matchesFilter = !notification.isRead;
        }
      }

      if (selectedFilter === "read") {
        if (notification.recipientType === "public") {
          matchesFilter = notification.readBy?.length > 0;
        } else {
          matchesFilter = notification.isRead;
        }
      }

      return matchesSearch && matchesFilter;
    });
  }, [notifications, searchQuery, selectedFilter, usersByClerkId]);

  // =======================================================
  // STATISTICS
  // =======================================================

  const stats = useMemo(() => {
    const publicCount = notifications.filter(
      (notification) => notification.recipientType === "public",
    ).length;

    const privateCount = notifications.filter(
      (notification) => notification.recipientType === "user",
    ).length;

    const unreadCount = notifications.filter((notification) => {
      if (notification.recipientType === "public") {
        return notification.readBy?.length === 0;
      }

      return !notification.isRead;
    }).length;

    const readCount = notifications.length - unreadCount;

    return {
      total: notifications.length,
      publicCount,
      privateCount,
      unreadCount,
      readCount,
    };
  }, [notifications]);

  // =======================================================
  // DELETE
  // =======================================================

  const triggerDelete = (
    notification: NotificationItem,
    e?: React.MouseEvent,
  ) => {
    if (e) {
      e.stopPropagation();
    }

    setDeleteConfirm({
      isOpen: true,
      id: notification._id,
      title:
        notification.translations?.uz?.title ||
        notification.translations?.en?.title ||
        "Notification",
    });
  };

  // =======================================================
  // CONFIRM DELETE
  // =======================================================

  const handleConfirmDelete = async () => {
    const notificationId = deleteConfirm.id;

    if (!notificationId) {
      setDeleteConfirm({
        isOpen: false,
      });

      showToast("Notification ID topilmadi.");
      return;
    }

    try {
      setIsDeleting(true);

      const response = await fetch(
        `/api/notifications/${encodeURIComponent(notificationId)}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      console.log("DELETE NOTIFICATION API:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Notificationni ochirishda xatolik yuz berdi",
        );
      }

      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== notificationId),
      );

      setSelectedNotification((current) => {
        if (current?._id === notificationId) {
          return null;
        }

        return current;
      });

      setDeleteConfirm({
        isOpen: false,
      });

      showToast("Notification muvaffaqiyatli ochirildi.");
    } catch (error) {
      console.error("DELETE /api/notifications/[id] xatosi:", error);

      setDeleteConfirm({
        isOpen: false,
      });

      showToast(
        error instanceof Error
          ? error.message
          : "Notificationni ochirishda xatolik yuz berdi",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // =======================================================
  // ANIMATIONS
  // =======================================================

  const containerVariants = {
    hidden: {
      opacity: 0,
    },

    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 15,
    },

    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />

          <p className="text-xs font-bold text-slate-400">
            Notificationlar yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="w-full min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-200 py-16">
      {/* ===================================================
          TOAST
      ==================================================== */}

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{
              opacity: 0,
              y: -50,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -20,
              scale: 0.9,
            }}
            transition={{
              duration: 0.25,
            }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 dark:border-slate-200 font-bold text-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />

            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================
          HEADER
      ==================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: -10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        className="sticky top-[100px] z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md py-4 border-b border-slate-100 dark:border-slate-900/40 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-500" />

            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-950 dark:text-white uppercase">
                Notifications Control
              </h1>

              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Barcha public va private notificationlarni boshqarish
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center gap-2 text-[11px] font-bold bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-xl border border-slate-200/10">
              <span className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white shadow-sm">
                Jami: {stats.total}
              </span>
            </div>

            <button
              type="button"
              onClick={fetchNotifications}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black rounded-xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className="w-3 h-3" />
              Yangilash
            </button>
          </div>
        </div>

        {/* =================================================
            STATISTICS
        ================================================== */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="rounded-xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                Jami
              </span>

              <Bell className="w-3.5 h-3.5 text-indigo-500" />
            </div>

            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {stats.total}
            </p>
          </div>

          <div className="rounded-xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                Public
              </span>

              <Globe2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>

            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {stats.publicCount}
            </p>
          </div>

          <div className="rounded-xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                Private
              </span>

              <User className="w-3.5 h-3.5 text-violet-500" />
            </div>

            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {stats.privateCount}
            </p>
          </div>

          <div className="rounded-xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                Oqilmagan
              </span>

              <Eye className="w-3.5 h-3.5 text-amber-500" />
            </div>

            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {stats.unreadCount}
            </p>
          </div>
        </div>

        {/* =================================================
            FILTERS
        ================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />

            <input
              type="text"
              placeholder="Title, message, ism yoki ID boyicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-transparent focus:border-indigo-500/30 outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-900/80 transition-colors"
            >
              <span>
                {
                  filterOptions.find(
                    (option) => option.value === selectedFilter,
                  )?.label
                }
              </span>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  filterDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {filterDropdownOpen && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: 5,
                  }}
                  transition={{
                    duration: 0.15,
                  }}
                  className="absolute left-0 right-0 mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden py-1"
                >
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSelectedFilter(option.value);
                        setFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedFilter === option.value
                          ? "bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ===================================================
          LIST
      ==================================================== */}

      <div className="mt-4 bg-white dark:bg-slate-900/20 rounded-2xl border border-slate-100 dark:border-slate-900/60 overflow-hidden shadow-sm">
        {errorMessage ? (
          <div className="w-full py-16 flex flex-col items-center justify-center text-center p-6">
            <AlertCircle className="w-8 h-8 text-rose-400 mb-2" />

            <h3 className="text-sm font-bold text-rose-500">
              Notificationlarni yuklashda xatolik
            </h3>

            <p className="text-xs text-slate-400 mt-1">{errorMessage}</p>

            <button
              type="button"
              onClick={fetchNotifications}
              className="mt-4 px-4 py-2 text-xs font-black rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
            >
              Qayta urinish
            </button>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="divide-y divide-slate-100 dark:divide-slate-900/40"
          >
            {filteredNotifications.map((notification) => {
              const title = getTitle(notification);
              const message = getMessage(notification);

              const currentType = typeMap[notification.type] || typeMap.system;

              const isPublic = notification.recipientType === "public";

              const isRead = getReadStatus(notification);

              return (
                <motion.div
                  key={notification._id}
                  variants={itemVariants}
                  onClick={() => setSelectedNotification(notification)}
                  className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/60 transition-all cursor-pointer"
                >
                  {/* LEFT */}

                  <div className="flex items-start gap-3 max-w-3xl min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                        isPublic
                          ? "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20"
                          : "bg-violet-500/10 text-violet-500 dark:bg-violet-500/20"
                      }`}
                    >
                      {isPublic ? (
                        <Globe2 className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase ${
                            isPublic
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-violet-500/10 text-violet-500"
                          }`}
                        >
                          {isPublic ? "PUBLIC" : "PRIVATE"}
                        </span>

                        {!isPublic && (
                          <span className="text-[10px] font-bold text-violet-500">
                            {getRecipientName(notification)}
                          </span>
                        )}

                        {!isRead && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-amber-500/10 text-amber-500">
                            UNREAD
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                        {title}
                      </h3>

                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        {message}
                      </p>

                      {/* SENDER */}

                      <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                        <ShieldCheck className="w-3 h-3 text-indigo-500" />

                        <span>Sender:</span>

                        <span className="font-bold text-slate-500 dark:text-slate-300">
                          {getSenderName(notification)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT */}

                  <div className="flex items-center justify-between md:justify-end gap-3 border-t border-dashed border-slate-100 dark:border-slate-900/20 md:border-t-0 pt-2.5 md:pt-0">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black rounded-md uppercase tracking-wide ${currentType.color}`}
                    >
                      {currentType.label}
                    </span>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />

                      {new Date(notification.createdAt).toLocaleDateString(
                        "uz-UZ",
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => triggerDelete(notification, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                      title="Notificationni ochirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="w-full py-16 flex flex-col items-center justify-center text-center p-6">
            <Bell className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />

            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Hech qanday notification topilmadi
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Tanlangan filter yoki qidiruv boyicha notification mavjud emas.
            </p>
          </div>
        )}
      </div>

      {/* ===================================================
          DETAIL MODAL
      ==================================================== */}

      <AnimatePresence>
        {selectedNotification && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* BACKDROP */}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNotification(null)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* MODAL */}

            <motion.div
              initial={{
                opacity: 0,
                y: 10,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 10,
                scale: 0.97,
              }}
              className="relative w-full max-w-2xl rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
            >
              {/* HEADER */}

              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-black text-slate-900 dark:text-white truncate">
                      {getTitle(selectedNotification)}
                    </h2>

                    <span className="text-[9px] font-mono text-slate-400 truncate">
                      {selectedNotification._id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase ${
                        selectedNotification.recipientType === "public"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-violet-500/10 text-violet-500"
                      }`}
                    >
                      {selectedNotification.recipientType === "public"
                        ? "PUBLIC"
                        : "PRIVATE"}
                    </span>

                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase ${
                        (typeMap[selectedNotification.type] || typeMap.system)
                          .color
                      }`}
                    >
                      {
                        (typeMap[selectedNotification.type] || typeMap.system)
                          .label
                      }
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* CONTENT */}

              <div className="py-5 space-y-5 max-h-[65vh] overflow-y-auto">
                {/* META */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* RECIPIENT */}

                  <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-1">
                      Recipient
                    </p>

                    <div className="flex items-center gap-2">
                      {selectedNotification.recipientType === "public" ? (
                        <>
                          <Globe2 className="w-3.5 h-3.5 text-emerald-500" />

                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Barcha foydalanuvchilar
                          </span>
                        </>
                      ) : (
                        <>
                          <User className="w-3.5 h-3.5 text-violet-500" />

                          <div className="min-w-0">
                            <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">
                              {getRecipientName(selectedNotification)}
                            </p>

                            <p className="text-[9px] text-slate-400 font-mono truncate mt-0.5">
                              Clerk ID:{" "}
                              {selectedNotification.userId || "Mavjud emas"}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* SENDER */}

                  <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-1">
                      Sender
                    </p>

                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />

                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">
                          {getSenderName(selectedNotification)}
                        </p>

                        {selectedNotification.senderId && (
                          <p className="text-[9px] text-slate-400 font-mono truncate mt-0.5">
                            ID: {selectedNotification.senderId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* DATE */}

                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Clock className="w-3 h-3" />

                  <span>
                    Yaratilgan:{" "}
                    {new Date(selectedNotification.createdAt).toLocaleString(
                      "uz-UZ",
                    )}
                  </span>
                </div>

                {/* LANGUAGES */}

                <div className="space-y-3">
                  <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                    Translationlar
                  </p>

                  {/* UZ */}

                  <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black uppercase text-indigo-500">
                        Ozbekcha · UZ
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {selectedNotification.translations?.uz?.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line mt-2">
                      {selectedNotification.translations?.uz?.message}
                    </p>
                  </div>

                  {/* RU */}

                  <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] font-black uppercase text-indigo-500">
                      Русский · RU
                    </span>

                    <h3 className="text-sm font-black text-slate-900 dark:text-white mt-2">
                      {selectedNotification.translations?.ru?.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line mt-2">
                      {selectedNotification.translations?.ru?.message}
                    </p>
                  </div>

                  {/* EN */}

                  <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] font-black uppercase text-indigo-500">
                      English · EN
                    </span>

                    <h3 className="text-sm font-black text-slate-900 dark:text-white mt-2">
                      {selectedNotification.translations?.en?.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line mt-2">
                      {selectedNotification.translations?.en?.message}
                    </p>
                  </div>

                  {/* TR */}

                  <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] font-black uppercase text-indigo-500">
                      Türkçe · TR
                    </span>

                    <h3 className="text-sm font-black text-slate-900 dark:text-white mt-2">
                      {selectedNotification.translations?.tr?.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line mt-2">
                      {selectedNotification.translations?.tr?.message}
                    </p>
                  </div>
                </div>

                {/* READ INFO */}

                <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />

                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Oqish statistikasi
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                        getReadStatus(selectedNotification)
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      {getReadStatus(selectedNotification) ? "READ" : "UNREAD"}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 mt-2">
                    Public notification oqiganlar:{" "}
                    <span className="font-bold text-slate-600 dark:text-slate-300">
                      {selectedNotification.readBy?.length || 0}
                    </span>
                  </p>

                  {selectedNotification.link && (
                    <p className="text-[10px] text-slate-400 mt-1 break-all">
                      Link:{" "}
                      <span className="font-mono text-indigo-500">
                        {selectedNotification.link}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* FOOTER */}

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => triggerDelete(selectedNotification)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Ochirish
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Yopish
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================
          DELETE CONFIRM
      ==================================================== */}

      <AnimatePresence>
        {deleteConfirm.isOpen && (
          <div className="fixed inset-0 z-[99990] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                !isDeleting &&
                setDeleteConfirm({
                  isOpen: false,
                })
              }
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              className="relative w-full max-w-sm rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Notification ochirish
                  </h3>

                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Bu amalni ortga qaytarib bolmaydi.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                Quyidagi notificationni ochirishni tasdiqlaysizmi?
              </p>

              <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3">
                <p className="text-xs font-black text-slate-800 dark:text-slate-200 line-clamp-2">
                  {deleteConfirm.title}
                </p>
              </div>

              <div className="flex justify-end gap-2 mt-5">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() =>
                    setDeleteConfirm({
                      isOpen: false,
                    })
                  }
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-50"
                >
                  Bekor qilish
                </button>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Ochirilmoqda...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      Ochirish
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
