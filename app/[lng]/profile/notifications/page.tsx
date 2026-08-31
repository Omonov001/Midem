"use client";

import {
  Bell,
  CheckCheck,
  Trash2,
  Trophy,
  ShoppingBag,
  Info,
  MessageSquare,
  User,
  ExternalLink,
  X,
  Clock,
  UserRound,
  Globe,
  CircleCheck,
  Circle,
  MailOpen,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import useTranslate from "@/hooks/use-translate";

// =========================================================
// TYPES
// =========================================================

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

interface NotificationSender {
  _id: string;
  name?: string;
  email?: string;
  picture?: string;
}

interface NotificationItem {
  _id: string;
  recipientType: "public" | "user";
  userId?: string | null;
  type: NotificationType;

  translations: {
    uz: NotificationTranslation;
    ru: NotificationTranslation;
    en: NotificationTranslation;
    tr: NotificationTranslation;
  };

  isRead: boolean;
  readBy: string[];

  senderId?: string | null;
  sender?: NotificationSender | null;
  senderName?: string | null;

  link?: string | null;

  createdAt: string;
  updatedAt: string;
}

interface NotificationsResponse {
  success: boolean;
  notifications?: NotificationItem[];
  total?: number;
  unreadCount?: number;
  message?: string;
}

interface NotificationActionResponse {
  success: boolean;
  message?: string;
  isRead?: boolean;
}

// =========================================================
// PAGE
// =========================================================

function Page() {
  const t = useTranslate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // =========================================================
  // TRANSLATION
  // =========================================================

  const getTranslation = (notification: NotificationItem) => {
    return (
      notification.translations?.uz ||
      notification.translations?.en ||
      notification.translations?.ru ||
      notification.translations?.tr || {
        title: "Bildirishnoma",
        message: "",
      }
    );
  };

  // =========================================================
  // SENDER NAME
  // =========================================================

  const getSenderName = (notification: NotificationItem) => {
    if (notification.senderName) {
      return notification.senderName;
    }

    if (notification.sender?.name) {
      return notification.sender.name;
    }

    if (notification.sender?.email) {
      return notification.sender.email;
    }

    if (notification.senderId) {
      return "Foydalanuvchi";
    }

    return "Tizim";
  };

  // =========================================================
  // TYPE
  // =========================================================

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case "achievement":
        return "Yutuq";
      case "payment":
        return "To‘lov";
      case "message":
        return "Xabar";
      case "account":
        return "Hisob";
      case "admin":
        return "Admin";
      default:
        return "Tizim";
    }
  };

  // =========================================================
  // ICON
  // =========================================================

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "achievement":
        return <Trophy size={19} className="text-amber-500" />;

      case "payment":
        return <ShoppingBag size={19} className="text-emerald-500" />;

      case "message":
        return <MessageSquare size={19} className="text-blue-500" />;

      case "account":
        return <User size={19} className="text-violet-500" />;

      case "admin":
        return <Bell size={19} className="text-blue-500" />;

      default:
        return <Info size={19} className="text-slate-500" />;
    }
  };

  // =========================================================
  // ICON BACKGROUND
  // =========================================================

  const getIconColor = (type: NotificationType) => {
    switch (type) {
      case "achievement":
        return "bg-amber-500/10";

      case "payment":
        return "bg-emerald-500/10";

      case "message":
        return "bg-blue-500/10";

      case "account":
        return "bg-violet-500/10";

      case "admin":
        return "bg-blue-500/10";

      default:
        return "bg-slate-500/10";
    }
  };

  // =========================================================
  // TIME
  // =========================================================

  const getTime = (date: string) => {
    const created = new Date(date);

    if (Number.isNaN(created.getTime())) return "";

    // eslint-disable-next-line react-hooks/purity
    const difference = Math.max(0, Date.now() - created.getTime());

    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "Hozirgina";
    if (minutes < 60) return `${minutes} daqiqa oldin`;
    if (hours < 24) return `${hours} soat oldin`;
    if (days < 7) return `${days} kun oldin`;

    return created.toLocaleDateString("uz-UZ");
  };

  // =========================================================
  // FULL DATE
  // =========================================================

  const getFullDate = (date: string) => {
    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "Noma’lum";
    }

    return value.toLocaleString("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // FETCH
  // =========================================================

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/notifications/user", {
        method: "GET",
        cache: "no-store",
      });

      const data: NotificationsResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Notificationlarni olishda xatolik yuz berdi",
        );
      }

      setNotifications(
        Array.isArray(data.notifications) ? data.notifications : [],
      );
    } catch (error) {
      console.error("GET /api/notifications/user:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Notificationlarni olishda xatolik yuz berdi",
      );

      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
  }, []);

  // =========================================================
  // READ / UNREAD
  // =========================================================

  const changeReadState = async (
    notification: NotificationItem,
    read: boolean,
  ) => {
    if (actionLoadingId) return;

    const id = notification._id;

    try {
      setActionLoadingId(id);

      const response = await fetch("/api/notifications/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationId: id,
          action: read ? "read" : "unread",
        }),
      });

      const data: NotificationActionResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Notification holatini o‘zgartirib bo‘lmadi",
        );
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                isRead: read,
              }
            : item,
        ),
      );

      setSelectedNotification((prev) =>
        prev?._id === id
          ? {
              ...prev,
              isRead: read,
            }
          : prev,
      );
    } catch (error) {
      console.error("PATCH notification state:", error);
    } finally {
      setActionLoadingId(null);
    }
  };

  // =========================================================
  // OPEN
  // =========================================================

  const openNotification = (notification: NotificationItem) => {
    // MUHIM:
    // Modal ochilishi notificationni avtomatik read QILMAYDI.
    setSelectedNotification(notification);
  };

  // =========================================================
  // MARK ALL READ
  // =========================================================

  const markAllRead = async () => {
    if (isMarkingAll) return;

    try {
      setIsMarkingAll(true);

      const response = await fetch("/api/notifications/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "read-all",
        }),
      });

      const data: NotificationActionResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Notificationlarni o‘qilgan qilib bo‘lmadi",
        );
      }

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
        })),
      );

      setSelectedNotification((prev) =>
        prev
          ? {
              ...prev,
              isRead: true,
            }
          : null,
      );
    } catch (error) {
      console.error("PATCH read-all:", error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const deleteNotification = async (id: string, closeModal = false) => {
    if (actionLoadingId) return;

    try {
      setActionLoadingId(id);

      // API BODY orqali notificationId kutyapti.
      const response = await fetch("/api/notifications/user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationId: id,
        }),
      });

      const data: NotificationActionResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Notificationni o‘chirib bo‘lmadi");
      }

      setNotifications((prev) => prev.filter((item) => item._id !== id));

      if (closeModal || selectedNotification?._id === id) {
        setSelectedNotification(null);
      }
    } catch (error) {
      console.error("DELETE notification:", error);
    } finally {
      setActionLoadingId(null);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading) {
    return (
      <div className="w-full mt-20 min-h-screen p-6 md:p-10 max-w-5xl">
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />

          <p className="mt-4 text-sm text-slate-400">
            Notificationlar yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="w-full mt-20 min-h-screen p-6 md:p-10 max-w-5xl">
        <div className="py-32 text-center">
          <div className="inline-flex p-5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 mb-4">
            <Bell size={32} />
          </div>

          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">
            Notificationlarni yuklab bo‘lmadi
          </h3>

          <p className="mt-2 text-sm text-slate-400">{error}</p>

          <button
            onClick={fetchNotifications}
            className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <div className="w-full mt-20 min-h-screen p-6 md:p-10 max-w-5xl">
        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <Bell size={24} />
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                {t("notifications")}
              </h1>

              <p className="text-sm text-slate-400 mt-1">
                So‘nggi bildirishnomalar
              </p>
            </div>
          </div>

          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={markAllRead}
              disabled={isMarkingAll}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition disabled:opacity-50"
            >
              <CheckCheck size={17} />
              {isMarkingAll ? "Saqlanmoqda..." : "Barchasini o‘qilgan qilish"}
            </button>
          )}
        </div>

        {/* LIST */}

        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((n) => {
              const translation = getTranslation(n);

              const isLoadingAction = actionLoadingId === n._id;

              return (
                <div
                  key={n._id}
                  onClick={() => openNotification(n)}
                  className={cn(
                    "group relative flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer",
                    n.isRead
                      ? "bg-white dark:bg-slate-900/40 border-slate-200 dark:border-white/5"
                      : "bg-white dark:bg-slate-900 border-blue-500/30 shadow-sm",
                    "hover:border-slate-300 dark:hover:border-white/10 hover:shadow-md",
                  )}
                >
                  {/* ICON */}

                  <div
                    className={cn(
                      "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                      getIconColor(n.type),
                    )}
                  >
                    {getIcon(n.type)}
                  </div>

                  {/* CONTENT */}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className={cn(
                          "text-sm font-semibold truncate",
                          n.isRead
                            ? "text-slate-600 dark:text-slate-300"
                            : "text-slate-900 dark:text-white",
                        )}
                      >
                        {translation.title}
                      </h3>

                      {!n.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </div>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {translation.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400">
                      <span>{getTime(n.createdAt)}</span>

                      <span>•</span>

                      <span>{getTypeLabel(n.type)}</span>

                      {n.senderId && (
                        <>
                          <span>•</span>
                          <span>{getSenderName(n)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div
                    className="shrink-0 flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* READ / UNREAD */}

                    <button
                      onClick={() => changeReadState(n, !n.isRead)}
                      disabled={isLoadingAction}
                      title={n.isRead ? "O‘qilmagan qilish" : "O‘qilgan qilish"}
                      className={cn(
                        "p-2 rounded-lg transition",
                        n.isRead
                          ? "text-slate-400 hover:text-blue-500 hover:bg-blue-500/10"
                          : "text-blue-500 hover:bg-blue-500/10",
                        "disabled:opacity-40",
                      )}
                    >
                      {n.isRead ? <Mail size={17} /> : <MailOpen size={17} />}
                    </button>

                    {/* DELETE */}

                    <button
                      onClick={() => deleteNotification(n._id)}
                      disabled={isLoadingAction}
                      aria-label="Notificationni o‘chirish"
                      title="O‘chirish"
                      className="p-2 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition disabled:opacity-40"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center">
              <div className="inline-flex p-5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 mb-4">
                <Bell size={32} />
              </div>

              <h3 className="text-lg font-semibold text-slate-500">
                Hozircha bildirishnomalar yo‘q
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Yangi notification kelganda shu yerda ko‘rinadi.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          MODAL
          ===================================================== */}

      {selectedNotification && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[calc(100vh-24px)] sm:max-h-[85vh] overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 shadow-2xl"
          >
            {(() => {
              const n = selectedNotification;

              const translation = getTranslation(n);

              return (
                <>
                  {/* MODAL HEADER */}

                  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-white/5">
                    <div
                      className={cn(
                        "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                        getIconColor(n.type),
                      )}
                    >
                      {getIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                        {translation.title}
                      </h2>

                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span>{getTypeLabel(n.type)}</span>

                        <span>•</span>

                        <span>{getTime(n.createdAt)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedNotification(null)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* MODAL BODY */}

                  <div className="overflow-y-auto max-h-[calc(100vh-100px)] sm:max-h-[calc(85vh-65px)] p-4 space-y-3">
                    {/* MESSAGE */}

                    <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 p-4">
                      <p className="text-sm leading-6 text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                        {translation.message}
                      </p>
                    </div>

                    {/* INFO GRID */}

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] p-3">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          {n.isRead ? (
                            <CircleCheck
                              size={14}
                              className="text-emerald-500"
                            />
                          ) : (
                            <Circle size={14} className="text-blue-500" />
                          )}
                          Holati
                        </div>

                        <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                          {n.isRead ? "O‘qilgan" : "O‘qilmagan"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] p-3">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          {n.recipientType === "public" ? (
                            <Globe size={14} />
                          ) : (
                            <UserRound size={14} />
                          )}
                          Qabul qiluvchi
                        </div>

                        <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                          {n.recipientType === "public" ? "Barchaga" : "Sizga"}
                        </p>
                      </div>
                    </div>

                    {/* SENDER */}

                    <div className="rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] p-3">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <UserRound size={14} />
                        Yuboruvchi
                      </div>

                      <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                        {getSenderName(n)}
                      </p>
                    </div>

                    {/* TIME */}

                    <div className="rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] p-3">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                        <Clock size={14} />
                        Yuborilgan
                      </div>

                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        {getFullDate(n.createdAt)}
                      </p>
                    </div>

                    {/* LINK */}

                    {n.link && (
                      <a
                        href={n.link}
                        onClick={() => changeReadState(n, true)}
                        className="flex items-center justify-between gap-3 rounded-xl border border-blue-500/10 bg-blue-500/5 p-3 text-blue-500 hover:bg-blue-500/10 transition"
                      >
                        <div className="min-w-0">
                          <p className="text-[11px] text-blue-500/70">Havola</p>

                          <p className="text-sm truncate">{n.link}</p>
                        </div>

                        <ExternalLink size={17} className="shrink-0" />
                      </a>
                    )}

                    {/* ACTIONS */}

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => changeReadState(n, !n.isRead)}
                        disabled={actionLoadingId === n._id}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50",
                          n.isRead
                            ? "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                            : "bg-blue-600 text-white hover:bg-blue-700",
                        )}
                      >
                        {n.isRead ? (
                          <>
                            <Mail size={16} />
                            O‘qilmagan qilish
                          </>
                        ) : (
                          <>
                            <CheckCheck size={16} />
                            O‘qilgan qilish
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => deleteNotification(n._id, true)}
                        disabled={actionLoadingId === n._id}
                        className="px-4 py-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/15 transition disabled:opacity-50"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}

export default Page;
