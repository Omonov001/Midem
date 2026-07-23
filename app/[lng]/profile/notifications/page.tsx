"use client";

import {
  Bell,
  CheckCheck,
  Trash2,
  Trophy,
  ShoppingBag,
  Info,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import useTranslate from "@/hooks/use-translate";

// Demo malumotlar
const initialNotifications = [
  {
    id: 1,
    type: "achievement",
    title: "Yangi daraja!",
    description:
      "Tabriklaymiz! Siz Elden Ring oyinida 100-darajaga kotarildingiz.",
    time: "2 daqiqa oldin",
    isUnread: true,
    icon: <Trophy className="text-yellow-500" />,
    color: "bg-yellow-500/10",
  },
  {
    id: 2,
    type: "purchase",
    title: "Xarid muvaffaqiyatli",
    description:
      "Sizning Cyberpunk 2077 uchun tolovingiz qabul qilindi. Oyin kutubxonangizga qoshildi.",
    time: "3 soat oldin",
    isUnread: true,
    icon: <ShoppingBag className="text-green-500" />,
    color: "bg-green-500/10",
  },
  {
    id: 3,
    type: "system",
    title: "Tizim yangilanishi",
    description:
      "Profil sozlamalarida yangi xavfsizlik funksiyalari qoshildi. Tekshirib koring.",
    time: "1 kun oldin",
    isUnread: false,
    icon: <Info className="text-blue-500" />,
    color: "bg-blue-500/10",
  },
];

function Page() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const t = useTranslate();

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isUnread: false })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  return (
    <div className="w-full mt-20 min-h-screen p-6 md:p-10 max-w-5xl">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="relative">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
              <Bell size={28} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
              {t("notifications")}
            </h1>
          </div>
        </div>

        <button
          onClick={markAllRead}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-black uppercase italic text-xs hover:bg-blue-600 hover:text-white transition-all active:scale-95"
        >
          <CheckCheck size={18} />
          {t("allRemove")}
        </button>
      </div>

      {/* --- NOTIFICATIONS LIST --- */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                "group relative flex items-start gap-4 p-5 rounded-[2rem] border transition-all duration-300",
                n.isUnread
                  ? "bg-white dark:bg-slate-900 border-blue-500/50 shadow-xl shadow-blue-500/5"
                  : "bg-slate-50/50 dark:bg-white/[0.02] border-transparent opacity-80 hover:opacity-100",
              )}
            >
              {/* Icon Box */}
              <div className={cn("shrink-0 p-4 rounded-2xl", n.color)}>
                {n.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className={cn(
                      "text-lg font-black uppercase italic tracking-tight truncate",
                      n.isUnread
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-500",
                    )}
                  >
                    {n.title}
                  </h3>
                  {n.isUnread && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-2">
                  {n.description}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Zap size={10} />
                  {n.time}
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => deleteNotification(n.id)}
                className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <div className="inline-flex p-6 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 mb-4">
              <Bell size={40} />
            </div>
            <h3 className="text-xl font-black uppercase italic text-slate-500">
              Bildirishnomalar yoq
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
