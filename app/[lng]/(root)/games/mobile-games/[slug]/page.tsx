/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  IoArrowBack,
  IoLogoAndroid,
  IoLogoApple,
  IoStar,
  IoThumbsUpOutline,
  IoShieldCheckmarkOutline,
  IoGameControllerOutline,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoMailOutline,
  IoGlobeOutline,
} from "react-icons/io5";
import Link from "next/link";
import CommentModal from "@/components/modals/comment-modal";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useTheme } from "@/components/ui/theme-provider";
import TextSign from "@/components/sign/text-sign";
import useTranslate from "@/hooks/use-translate";

const MOCK_COMMENTS = [
  {
    id: 1,
    user: "Asadbek Dev",
    date: "15 May, 2026",
    rating: 5,
    text: "Grafika mobil uchun shunchaki bomba! Ayniqsa HDR sozlamalarda oyin vapshe boshqacha korinar ekan.",
    likes: 42,
  },
];

export default function MobileGameDetail() {
  const [mounted, setMounted] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const { theme } = useTheme();
  const t = useTranslate();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const isDark = theme === "dark";

  return (
    <main
      className={cn(
        "relative min-h-screen pt-[20vh] pb-20 px-4 md:px-12 transition-colors duration-500",
        isDark ? "bg-slate-950 text-slate-300" : "bg-slate-50 text-slate-800",
      )}
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* BREADCRUMBS & NAVIGATION */}
        <div className="flex items-center justify-between">
          <Link
            href="/games/mobile-games"
            className={cn(
              "flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-black transition-all",
              isDark
                ? "opacity-40 hover:opacity-100"
                : "text-slate-500 hover:text-green-600",
            )}
          >
            <IoArrowBack /> {t("back")}
          </Link>
        </div>

        {/* HERO SECTION: ICON & MAIN ACTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div
              className={cn(
                "w-40 h-40 md:w-52 md:h-52 rounded-[3rem] overflow-hidden shadow-2xl border-8 shrink-0 rotate-3 transition-transform hover:rotate-0",
                isDark ? "border-white/5" : "border-white",
              )}
            >
              <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-900 flex items-center justify-center text-white font-black text-5xl italic shadow-inner">
                PUBG
              </div>
            </div>

            <div className="space-y-4 text-center md:text-left">
              <h1
                className={cn(
                  "text-5xl md:text-7xl font-black uppercase tracking-tighter italic leading-tight",
                  isDark ? "text-white" : "text-slate-900",
                )}
              >
                PUBG <span className="text-green-500">MOBILE</span>
              </h1>
              <p
                className={cn(
                  "text-lg max-w-xl italic opacity-70",
                  !isDark && "text-slate-600",
                )}
              >
                Dunyoning eng mashhur taktik shooter oyini. 100 kishi bitta
                orolda, faqat bitta golib!
              </p>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div
              className={cn(
                "p-6 rounded-[2.5rem] border text-center space-y-4",
                isDark
                  ? "bg-white/5 border-white/5"
                  : "bg-white border-slate-200 shadow-xl",
              )}
            >
              <div className="flex justify-around items-center">
                <div className="text-center">
                  <p className="text-2xl font-black italic">
                    4.8 <span className="text-green-500">★</span>
                  </p>
                  <p className="text-[10px] uppercase opacity-50 font-bold">
                    12M {t("Reviews")}
                  </p>
                </div>
                <div className="w-[1px] h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-black italic">500M+</p>
                  <p className="text-[10px] uppercase opacity-50 font-bold">
                    {t("loaded")}
                  </p>
                </div>
              </div>
              <button className="w-full py-5 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black uppercase shadow-[0_10px_30px_rgba(22,163,74,0.3)] transition-all active:scale-95">
                {t("Dowload")}
              </button>
            </div>
          </div>
        </section>

        <div
          className={cn(
            "flex flex-wrap items-center gap-6 py-4 border-y",
            isDark ? "border-white/10" : "border-slate-200",
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                isDark ? "opacity-60" : "text-slate-400",
              )}
            >
              {t("uploaded")}:
            </span>
            <span className="text-sm font-bold text-blue-500 underline underline-offset-4">
              Vertex Admin
            </span>
          </div>
          <TextSign />
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                isDark ? "opacity-60" : "text-slate-400",
              )}
            >
              {t("category")}:
            </span>
            <span
              className={cn(
                "text-sm font-bold",
                isDark ? "text-slate-300" : "text-slate-700",
              )}
            >
              Action / Multiplayer
            </span>
          </div>
          <TextSign />
          <div className="flex items-center gap-2 text-xs font-bold uppercase">
            <span
              className={cn(
                "text-[10px]",
                isDark ? "opacity-60" : "text-slate-400",
              )}
            >
              {t("Release")}:
            </span>
            <span className={isDark ? "text-slate-300" : "text-slate-700"}>
              20 May, 2026
            </span>
          </div>
          <TextSign />
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-tighter">
            <span
              className={cn(
                "text-[10px]",
                isDark ? "opacity-60" : "text-slate-400",
              )}
            >
              {t("Developer")}:
            </span>
            <span className="text-blue-500">Vertex Studio</span>
          </div>
        </div>

        {/* SCREENSHOTS (Landscape Style) */}
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-40">
              {t("GamePlayPreview")}
            </h3>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1.1}
            breakpoints={{
              768: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3.2 },
            }}
            className="rounded-3xl"
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <SwiperSlide key={i}>
                <div
                  className={cn(
                    "aspect-[16/9] rounded-3xl bg-slate-800 border-2 overflow-hidden",
                    isDark ? "border-white/5" : "border-slate-200",
                  )}
                >
                  <div className="w-full h-full bg-gradient-to-tr from-slate-900 to-slate-700 flex items-center justify-center">
                    <IoGameControllerOutline size={40} className="opacity-10" />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* DETAILED INFO GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            {/* WHATS NEW */}
            <div
              className={cn(
                "p-8 rounded-[2rem] border-2 border-dashed",
                isDark
                  ? "border-green-500/20 bg-green-500/5"
                  : "border-green-200 bg-green-50",
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500 rounded-lg text-white">
                  <IoTimeOutline size={20} />
                </div>
                <h3 className="text-xl font-black uppercase italic">
                  {t("NewUpdated")} (v3.2)
                </h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm italic">
                  <IoCheckmarkCircle className="text-green-500 mt-1 shrink-0" />
                  <span>
                    Yangi Mecha Fusion rejimi qoshildi - robotlar jangi endi
                    PUBGda!
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm italic">
                  <IoCheckmarkCircle className="text-green-500 mt-1 shrink-0" />
                  <span>
                    Livik xaritasi toliq optimallashtirildi, FPS barqarorligi
                    +20%.
                  </span>
                </li>
              </ul>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black uppercase italic border-b-4 border-green-500 w-fit pb-2">
                {t("AboutGame")}
              </h3>
              <div
                className={cn(
                  "text-lg md:text-xl leading-relaxed italic text-balance",
                  isDark ? "text-slate-300" : "text-slate-700",
                )}
              >
                PUBG MOBILE ozining ajoyib grafikasi va dinamik oyin jarayoni
                bilan ajralib turadi. Siz dostlaringiz bilan Squad bolib
                oynashingiz yoki yakka tartibda (Solo) mahoratingizni
                sinashingiz mumkin. Har bir qurolning oziga xos qaytish (recoil)
                kuchi va ovozi bor.
              </div>
            </div>

            {/* FULL TECH SPECS TABLE */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black uppercase italic">
                {t("FullData")}
              </h3>
              <div
                className={cn(
                  "grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-3xl border",
                  isDark
                    ? "bg-white/5 border-white/5"
                    : "bg-white border-slate-200 shadow-sm",
                )}
              >
                <TechRow label={t("version")} value="3.2.0.18742" />
                <TechRow label={t("DowloadSize")} value="1.42 GB" />
                <TechRow label={t("GameData")} value="~3.5 GB" />
                <TechRow
                  label={t("Developer")}
                  value="Level Infinite (Tencent Music)"
                />
                <TechRow label={t("ReleaseDate")} value="19 Mart, 2018" />
                <TechRow
                  label={t("language")}
                  value="48 ta (O'zbek tili mavjud)"
                />
              </div>
            </div>
          </div>

          {/* SIDEBAR: SYSTEM & DEVELOPER */}
          <div className="lg:col-span-4 space-y-8">
            {/* SYSTEM REQUIREMENTS */}
            <div
              className={cn(
                "p-8 rounded-[3rem] border space-y-6",
                isDark
                  ? "bg-black/20 border-white/5"
                  : "bg-white border-slate-200 shadow-lg",
              )}
            >
              <h3 className="text-xl font-black uppercase italic text-green-500">
                {t("SystemRequirements")}
              </h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-xs font-black uppercase opacity-40">
                    <IoLogoAndroid /> Android
                  </p>
                  <p className="text-sm font-bold">
                    OS 9.0+ / 4GB RAM / Snapdragon 660+
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-xs font-black uppercase opacity-40">
                    <IoLogoApple /> iOS
                  </p>
                  <p className="text-sm font-bold">
                    iOS 11.0+ / iPhone 8 Plus yoki yaxshiroq
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex gap-3">
                  <IoWarningOutline
                    className="text-orange-500 shrink-0"
                    size={20}
                  />
                  <p className="text-[10px] font-bold italic text-orange-500/80">
                    Eslatma: Barqaror oyin uchun kamida 6GB bosh joy tavsiya
                    etiladi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        <section className="pt-10 space-y-10">
          <div className="flex items-end justify-between border-b-2 gap-2 flex-col border-white/5 pb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-4xl font-black italic uppercase">
                {t("User")} {""}
                {t("comment")}
              </h3>
              <span className="px-4 py-1 bg-green-500 text-white text-xs font-black rounded-full">
                12.4M
              </span>
            </div>
            <button
              onClick={() => setIsCommentOpen(true)}
              className="w-auto p-4 px-12 text-center border-2 border-blue-500/50 text-blue-500 rounded-xl font-black uppercase italic hover:bg-blue-500 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              {t("comment")}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MOCK_COMMENTS.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  "p-10 rounded-[3rem] border-2 transition-all hover:border-green-500/40 hover:translate-y-[-5px]",
                  isDark
                    ? "bg-white/5 border-white/5"
                    : "bg-white border-slate-200 shadow-md",
                )}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white font-black">
                      {comment.user[0]}
                    </div>
                    <div>
                      <h4 className="font-black text-lg italic">
                        {comment.user}
                      </h4>
                      <p className="text-[10px] uppercase font-bold opacity-40">
                        {comment.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex text-green-500 gap-1">
                    <IoStar />
                    <IoStar />
                    <IoStar />
                    <IoStar />
                    <IoStar />
                  </div>
                </div>
                <p
                  className={cn(
                    "text-lg italic leading-relaxed mb-6",
                    isDark ? "text-slate-400" : "text-slate-600",
                  )}
                >
                  {comment.text}
                </p>
                <div className="flex items-center gap-2 opacity-40 hover:opacity-100 cursor-pointer transition-opacity">
                  <IoThumbsUpOutline />
                  <span className="text-xs font-black">
                    {comment.likes} {t("useful")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <CommentModal
          isOpen={isCommentOpen}
          onClose={() => setIsCommentOpen(false)}
          isDark={isDark}
        />
      </div>
    </main>
  );
}

// Yordamchi komponent
function TechRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 px-2">
      <span className="text-xs font-black uppercase opacity-40 italic">
        {label}
      </span>
      <span className="text-sm font-bold italic">{value}</span>
    </div>
  );
}

function StarRating({
  value,
  size = 18,
  activeColor = "text-orange-500",
}: {
  value: number;
  size?: number;
  activeColor?: string;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFull = star <= Math.floor(value);
        const isHalf = !isFull && star === Math.ceil(value) && value % 1 !== 0;
        return (
          <div key={star} className="relative">
            <IoStar size={size} className="text-slate-300" />
            <div
              className={cn("absolute inset-0 overflow-hidden", activeColor)}
              style={{ width: isFull ? "100%" : isHalf ? "50%" : "0%" }}
            >
              <IoStar size={size} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
