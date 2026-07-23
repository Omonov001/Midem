"use client";

import { useState } from "react";
import { useTheme } from "@/components/ui/theme-provider";
import {
  Settings,
  Moon,
  Sun,
  BellRing,
  ShieldCheck, // ShieldLock orniga ShieldCheck ishlatsang aniq chiqadi
  Languages,
  UserCircle,
  Smartphone,
  Eye,
  Check,
  Lock, // Qoshimcha xavfsizlik ikonasi
} from "lucide-react";
import { cn } from "@/lib/utils";
import useTranslate from "@/hooks/use-translate";

// 1. TOGGLE KOMPONENTINI PAGE TASHQARISIGA CHIQARDIM (Xatolikni yoqotadi)
const Toggle = ({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "relative w-14 h-7 rounded-full transition-all duration-300 shadow-inner shrink-0",
      active
        ? "bg-blue-600 shadow-blue-500/40"
        : "bg-slate-300 dark:bg-slate-800",
    )}
  >
    <div
      className={cn(
        "absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-all duration-300 flex items-center justify-center shadow-md",
        active ? "translate-x-7" : "translate-x-0",
      )}
    >
      {active && <Check size={12} className="text-blue-600 font-bold" />}
    </div>
  </button>
);

function Page() {
  const { setTheme, theme } = useTheme();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const t = useTranslate();

  return (
    <div className="w-full my-20 min-h-screen p-6 md:p-10 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="relative mb-12">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <Settings size={28} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
            {t("settings")}
          </h1>
        </div>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-transparent rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* INTERFEYS SOZLAMALARI */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8 transition-all hover:shadow-2xl hover:shadow-blue-500/5">
          <div className="flex items-center gap-3 mb-8">
            <Eye className="text-blue-600" size={24} />
            <h2 className="text-xl font-black uppercase italic dark:text-white tracking-tight">
              {t("InterFaceSettings")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "group relative p-6 rounded-3xl border-2 transition-all flex items-center justify-between",
                theme === "dark"
                  ? "border-blue-600 bg-blue-600/5"
                  : "border-slate-100 dark:border-white/5 hover:border-blue-600/50",
              )}
            >
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 text-blue-500">
                  <Moon size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black uppercase italic text-sm dark:text-white">
                    {t("DarkMode")}
                  </p>
                  <p className="text-xs text-slate-500 font-bold">
                    {t("DarkModeDesc")}
                  </p>
                </div>
              </div>
              {theme === "dark" && (
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <Check size={14} />
                </div>
              )}
            </button>

            <button
              onClick={() => setTheme("light")}
              className={cn(
                "group relative p-6 rounded-3xl border-2 transition-all flex items-center justify-between",
                theme === "light"
                  ? "border-blue-600 bg-blue-600/5"
                  : "border-slate-100 dark:border-white/5 hover:border-blue-600/50",
              )}
            >
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-slate-100 text-orange-500">
                  <Sun size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black uppercase italic text-sm dark:text-white">
                    {t("LightMode")}
                  </p>
                  <p className="text-xs text-slate-500 font-bold">
                    {t("LightModeDesc")}
                  </p>
                </div>
              </div>
              {theme === "light" && (
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <Check size={14} />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* BILDIRISHNOMALAR VA XAVFSIZLIK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Notifications */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8">
            <div className="flex items-center gap-3 mb-8">
              <BellRing className="text-blue-600" size={24} />
              <h2 className="text-xl font-black uppercase italic dark:text-white">
                {t("notifications")}
              </h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm dark:text-slate-200 uppercase tracking-tighter italic">
                  {t("notifications")}
                </p>
                <p className="text-xs text-slate-500 font-medium tracking-tight">
                  {t("notificationDescription")}
                </p>
              </div>
              <Toggle
                active={notifEnabled}
                onClick={() => setNotifEnabled(!notifEnabled)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
