"use client";

import { useTheme } from "@/components/ui/theme-provider";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  IoArrowBack,
  IoShareSocialOutline,
  IoBookmarkOutline,
  IoChatbubbleOutline,
  IoChevronBack,
  IoChevronForward,
  IoEyeOutline, // Ko'rishlar uchun
  IoHeartOutline, // Like uchun
} from "react-icons/io5";
import Link from "next/link";
import CommentModal from "@/components/modals/comment-modal";
import useTranslate from "@/hooks/use-translate";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function NewsDetailPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const t = useTranslate();

  const images = [
    { id: 1, label: "Rasm 1", color: "from-blue-600/20 to-purple-600/20" },
    { id: 2, label: "Rasm 2", color: "from-red-600/20 to-orange-600/20" },
    { id: 3, label: "Rasm 3", color: "from-emerald-600/20 to-teal-600/20" },
  ];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";

  return (
    <main
      className={cn(
        "relative min-h-screen pt-[12vh] pb-20 px-4 lg:px-12 transition-colors duration-500",
        isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900",
      )}
    >
      <div className="max-w-4xl mx-auto">
        {/* TOP NAV */}
        <div className="flex items-center justify-between mb-10">
          <Link
            href="/news"
            className="group flex items-center gap-2 text-blue-500 font-bold"
          >
            <div className="p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <IoArrowBack className="size-5" />
            </div>
            <span>{t("back")}</span>
          </Link>

          <div className="flex gap-3">
            <button
              className={cn(
                "p-3 rounded-2xl border backdrop-blur-md transition-all",
                isDark
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-slate-200 shadow-sm",
              )}
            >
              <IoShareSocialOutline className="size-5" />
            </button>
            <button
              className={cn(
                "p-3 rounded-2xl border backdrop-blur-md transition-all",
                isDark
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-slate-200 shadow-sm",
              )}
            >
              <IoBookmarkOutline className="size-5" />
            </button>
          </div>
        </div>

        {/* --- SWIPER SECTION --- */}
        <div
          className={cn(
            "group relative w-full aspect-video rounded-[3rem] overflow-hidden border shadow-2xl transition-all duration-500",
            isDark
              ? "border-white/10 shadow-blue-500/5"
              : "border-slate-200 shadow-slate-200",
          )}
        >
          <Swiper
            modules={[Pagination, Autoplay, Navigation]}
            pagination={{ clickable: true }}
            navigation={{
              nextEl: ".swiper-button-next-custom",
              prevEl: ".swiper-button-prev-custom",
            }}
            autoplay={{ delay: 4000 }}
            className="w-full h-full"
          >
            {images.map((item) => (
              <SwiperSlide key={item.id}>
                <div
                  className={cn("w-full h-full bg-gradient-to-br", item.color)}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all hidden md:flex">
            <IoChevronBack className="size-6" />
          </button>
          <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all hidden md:flex">
            <IoChevronForward className="size-6" />
          </button>
        </div>

        {/* --- STATISTIKA VA LIKE BUTTON --- */}
        <div className="flex items-center justify-between mt-6 mb-8 px-2">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-500 font-bold">
              <IoEyeOutline className="size-5 text-blue-500" />
              <span className="text-sm">1.2k {t("views")}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-bold">
              <IoHeartOutline className="size-5 text-red-500" />
              <span className="text-sm">850 {t("likes")}</span>
            </div>
          </div>

          <button
            className={cn(
              "flex items-center cursor-pointer gap-2 px-4 py-2 rounded-xl border font-bold transition-all active:scale-90",
              isDark
                ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                : "bg-red-50 border-red-100 text-red-600 hover:bg-red-600 hover:text-white",
            )}
          >
            <IoHeartOutline className="size-5" />
          </button>
        </div>

        {/* CONTENT INFO */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.05] uppercase">
            Yangi <span className="text-blue-600">Jang Maydoni</span> <br />
            va Qahramonlar Tizimi
          </h1>

          <div
            className={cn(
              "flex flex-wrap items-center justify-between p-5 rounded-[2rem] border backdrop-blur-xl transition-all gap-4",
              isDark
                ? "bg-white/[0.03] border-white/10"
                : "bg-white border-slate-200 shadow-sm",
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 p-0.5">
                <div
                  className={cn(
                    "w-full h-full rounded-[0.9rem]",
                    isDark ? "bg-slate-900" : "bg-slate-100",
                  )}
                />
              </div>
              <div>
                <p className="font-bold text-sm tracking-tight">Admin Garen</p>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                  20 May, 2026
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCommentsOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"
            >
              <IoChatbubbleOutline className="size-5" />
              <span>Izohlar</span>
            </button>
          </div>

          <article
            className={cn(
              "pt-6 pb-10 text-lg md:text-xl leading-relaxed font-medium italic space-y-8",
              isDark ? "text-slate-300" : "text-slate-600",
            )}
          >
            <p className="first-letter:text-6xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-blue-600">
              Ushbu yangilanishda biz foydalanuvchilarimiz uchun yanada qulay va
              qiziqarli interfeysni taqdim etamiz.
            </p>
            <p>{t("newsLastText")}</p>
          </article>
        </div>
      </div>

      <CommentModal
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        isDark={isDark}
      />

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: ${isDark ? "#fff" : "#2563eb"} !important;
        }
        .swiper-pagination-bullet-active {
          width: 20px;
          border-radius: 10px;
          transition: all 0.3s;
        }
      `}</style>
    </main>
  );
}
