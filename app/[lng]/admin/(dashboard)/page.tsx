/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Gamepad2,
  MessageSquare,
  Users,
  Layers,
  ArrowUpRight,
  Clock,
  Sun,
  Moon,
} from "lucide-react";

const statsData = [
  {
    id: 1,
    name: "Sorovlari",
    value: "12 ta",
    change: "+4 bugun",
    icon: Gamepad2,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    id: 2,
    name: "Foydalanuvchi so'rovlar",
    value: "45 ta",
    change: "+10 yangi",
    icon: MessageSquare,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    id: 3,
    name: "Jami foydalanuvchilar",
    value: "1,240 ta",
    change: "+12% osish",
    icon: Users,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    id: 4,
    name: "Faol oyinlar",
    value: "88 ta",
    change: "Stabil",
    icon: Layers,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
  },
];

const recentUserRequests = [
  {
    id: 1,
    user: "@ali_dev",
    text: "Meni developer darajasiga kotaring, yangi oyin kodini yozdim...",
    time: "5 daqiqa oldin",
    urgent: true,
  },
  {
    id: 2,
    user: "@samar_01",
    text: "Sayt zor ishlamoqda, lekin qidiruv tizimini biroz maslahat bersam boladimi?",
    time: "2 soat oldin",
    urgent: false,
  },
];

function Page() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-500">
      {/* Kontent maydoni */}
      <main className="flex-1 my-15 max-md:my-20 max-w-7xl mx-auto w-full overflow-hidden">
        {/* Header */}
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
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-200">
              {/* Yashil indikator - nafisroq qilindi */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>

              {/* Matn qismi */}
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
          </div>
        </div>

        {/* 1. STATISTIKA KARTALARI (KATTALIGI ME'YORLASHTIRILDI): O'ta gigant ham, mini ham emas (min-width: 210px) */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.05 } },
          }}
          // 210px o'rtacha ekranlarda va sidebar borligida mukammal joylashishni ta'minlaydi
          className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-5 mb-8"
        >
          {statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { type: "spring", stiffness: 120 },
                  },
                }}
                whileHover={{ y: -2 }}
                className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50 flex items-center justify-between cursor-pointer group transition-all"
              >
                <div className="space-y-1 min-w-0 pr-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {stat.name}
                  </p>
                  <div className="flex items-baseline gap-2">
                    {/* Raqamlar o'rtacha o'lchamda (xl sm:text-2xl) */}
                    <span className="text-xl sm:text-xl font-extrabold tracking-tight">
                      {stat.value}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {stat.change}
                    </span>
                  </div>
                </div>
                {/* Ikonka bloki ham hamma ekranda normal va barqaror turadi */}
                <div
                  className={`p-3 rounded-xl shrink-0 ${stat.bg} ${stat.color} group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5.5 h-5.5" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* 2. ISH PANELLARI (KATTALASHTIRILGAN): Ichki masofalar p-6 va yozuvlar yiriklashtirildi */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Oyin sorovlari vidjeti */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
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

              <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 my-5 text-center">
                <Clock
                  className="w-8 h-8 text-amber-500 mx-auto mb-3 animate-spin"
                  style={{ animationDuration: "12s" }}
                />
                <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
                  Navbatda 12 ta yangi oyin bor
                </p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
                  Tizimda elon qilinishi kutilmoqda
                </p>
              </div>
            </div>

            <button className="w-full mt-4 py-3.5 px-5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-sm hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group shadow-md">
              Sorovlarni boshqarish
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </motion.div>

          {/* Foydalanuvchilar xabarlari */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50"
          >
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  Oxirgi Foydalanuvchi Sorovlari
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Rol sorash va taklif xatlari
                </p>
              </div>
              <span className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                <MessageSquare className="w-6 h-6" />
              </span>
            </div>

            <div className="space-y-4">
              {recentUserRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-indigo-600 dark:text-indigo-400">
                      {req.user}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      {req.time}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                    {req.text}
                  </p>
                  {req.urgent && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-rose-500 font-extrabold bg-rose-50 dark:bg-rose-950/20 px-2.5 py-1 w-max rounded-lg">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      Tezkor
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default Page;
