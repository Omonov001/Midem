/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useTheme } from "@/components/ui/theme-provider";
import { useEffect, useState, ReactNode, use, useRef } from "react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

import {
  IoArrowBack,
  IoCheckmarkCircle,
  IoClose,
  IoDownloadOutline,
  IoStar,
  IoTimeOutline,
} from "react-icons/io5";

import Link from "next/link";
import CommentModal from "@/components/modals/comment-modal";
import BuyFormModal from "@/components/modals/buy-form";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import TextSign from "@/components/sign/text-sign";
import { MdOutlineReviews } from "react-icons/md";
import useTranslate from "@/hooks/use-translate";

interface StatCardProps {
  icon: ReactNode;
  val: string | number;
  label: string;
  isDark: boolean;
  color: string;
}

interface RequirementRowProps {
  label: string;
  val: string;
  isDark: boolean;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface PendingDownload {
  osKey: string;
  fileName: string;
}

export default function PCGameDetail({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const paramsFromUrl = useParams();
  const locale = (paramsFromUrl.locale as string) || "uz";

  const { resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [downloadingOs, setDownloadingOs] = useState<string | null>(null);

  // DOWNLOAD GUIDE MODAL
  const [isDownloadGuideOpen, setIsDownloadGuideOpen] = useState(false);

  const [guideWatched, setGuideWatched] = useState(false);

  const [pendingDownload, setPendingDownload] =
    useState<PendingDownload | null>(null);

  // Pastdagi yuklash/talablar bo'limiga scroll
  const downloadSectionRef = useRef<HTMLDivElement>(null);

  const t = useTranslate();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);

    fetch(`/api/games/${slug}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Oyin topilmadi");
        }

        return res.json();
      })
      .then((data) => {
        setGame(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Game loading error:", err);
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  // ==========================================
  // SCROLL TO DOWNLOAD SECTION
  // ==========================================

  const scrollToDownloadSection = () => {
    downloadSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // ==========================================
  // DOWNLOAD GUIDE MODAL
  // ==========================================

  const openDownloadGuide = (osKey: string, fileName: string) => {
    if (!fileName) {
      alert("Bu operatsion tizim uchun yuklab olish fayli topilmadi!");
      return;
    }

    setPendingDownload({
      osKey,
      fileName,
    });

    setGuideWatched(false);
    setIsDownloadGuideOpen(true);
  };

  const closeDownloadGuide = () => {
    setIsDownloadGuideOpen(false);
    setPendingDownload(null);
    setGuideWatched(false);
  };

  // ==========================================
  // OS ACTION
  // ==========================================

  const handleOsActionClick = (osKey: string, fileName: string) => {
    if (!game) return;

    const isPaid = game.priceType === "paid";
    const userHasBought = game.userHasBought || false;

    // Pullik o'yin
    if (isPaid && !userHasBought) {
      setIsBuyModalOpen(true);
      return;
    }

    // Bepul o'yin -> avval guide video
    openDownloadGuide(osKey, fileName);
  };

  // ==========================================
  // REAL DOWNLOAD
  // ==========================================

  const onDownloadClick = async (osKey: string, fileName: string) => {
    if (!fileName) {
      alert("Bu operatsion tizim uchun yuklab olish fayli topilmadi!");
      return;
    }

    const isPaid = game.priceType === "paid";
    const userHasBought = game.userHasBought || false;

    setDownloadingOs(osKey);

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName,
          gameId: game._id,
          isPaid,
          userHasBought,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Yuklab olishda xatolik yuz berdi!");
        return;
      }

      if (data.downloadUrl) {
        const link = document.createElement("a");

        link.href = data.downloadUrl;

        link.setAttribute("download", fileName);

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Download handling error:", err);

      alert("Tarmoqda xatolik yuz berdi!");
    } finally {
      setDownloadingOs(null);
    }
  };

  // ==========================================
  // DOWNLOAD GUIDE -> ACTUAL DOWNLOAD
  // ==========================================

  const handleGuideContinue = () => {
    if (!guideWatched || !pendingDownload) {
      return;
    }

    const { osKey, fileName } = pendingDownload;

    // Modalni yopamiz
    setIsDownloadGuideOpen(false);
    setPendingDownload(null);
    setGuideWatched(false);

    // Haqiqiy download
    onDownloadClick(osKey, fileName);
  };

  // ==========================================
  // MOUNT
  // ==========================================

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark";

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error || !game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-bold text-red-500">Oyin topilmadi!</p>

        <Link href="/games" className="underline text-blue-500">
          Orqaga qaytish
        </Link>
      </div>
    );
  }

  // ==========================================
  // LANGUAGE DATA
  // ==========================================

  const langObj =
    game.langData?.[locale] || game.langData?.uz || game.langData?.en || {};

  const {
    title = "",
    subtitle = "",
    Maindescription = "",
    description = "",
    category = "Action",
    availableLanguagesCount = "1",
    iconPreview = null,
    screenshotPreviews = [],
    whatsNew = [],
  } = langObj;

  const techData = game.techData || {};

  // ==========================================
  // OS DATA
  // ==========================================

  const osDetailsObj = game.osDetails
    ? game.osDetails instanceof Map
      ? Object.fromEntries(game.osDetails)
      : game.osDetails
    : {};

  const selectedOS = game.selectedOS || {};

  const activeOsKeys = Object.keys(selectedOS).filter(
    (key) => selectedOS[key] === true,
  );

  // ==========================================
  // UI
  // ==========================================

  return (
    <main
      className={cn(
        "relative min-h-screen pt-20 md:pt-[12vh] pb-20 px-4 sm:px-6 md:px-12 transition-colors duration-500",
        isDark ? "bg-slate-950 text-slate-300" : "bg-white text-slate-900",
      )}
    >
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-10">
        {/* ==========================================
            BREADCRUMBS
        ========================================== */}

        <Link
          href="/games"
          className={cn(
            "flex items-center gap-2 text-xs uppercase tracking-widest transition-all w-fit",
            isDark
              ? "opacity-50 hover:opacity-100 text-white"
              : "text-slate-500 hover:text-blue-600",
          )}
        >
          <IoArrowBack />
          {t("back") || "Orqaga"}
        </Link>

        {/* ==========================================
            TOP GRID
        ========================================== */}

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ==========================================
              LEFT - SWIPER
          ========================================== */}

          <div className="lg:col-span-8 w-full order-2 lg:order-1">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              navigation
              pagination={{
                clickable: true,
              }}
              autoplay={{
                delay: 3000,
              }}
              className={cn(
                "rounded-xl overflow-hidden border shadow-xl md:shadow-2xl aspect-video w-full",
                isDark
                  ? "border-white/10 bg-slate-900"
                  : "border-slate-200 bg-slate-100",
              )}
            >
              {screenshotPreviews.length > 0 ? (
                screenshotPreviews.map((imgUrl: string, i: number) => (
                  <SwiperSlide key={i}>
                    <img
                      src={imgUrl}
                      alt={`Screenshot ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide>
                  <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500 italic text-sm">
                    SCREENSHOTS MAVJUD EMAS
                  </div>
                </SwiperSlide>
              )}
            </Swiper>

            {/* METADATA BAR */}

            <div
              className={cn(
                "flex flex-wrap items-center my-4 justify-between sm:justify-start gap-4 sm:gap-6 py-4 border-y text-xs md:text-sm",
                isDark ? "border-white/10" : "border-slate-200",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-[10px] sm:text-xs font-black uppercase tracking-widest",
                    isDark ? "opacity-60" : "text-slate-400",
                  )}
                >
                  Kategoriya:
                </span>

                <span
                  className={cn(
                    "font-bold",
                    isDark ? "text-slate-300" : "text-slate-700",
                  )}
                >
                  {category}
                </span>
              </div>

              <TextSign className="hidden sm:inline" />

              <div className="flex items-center gap-2 font-bold uppercase">
                <span
                  className={cn(
                    "text-[10px] sm:text-xs",
                    isDark ? "opacity-60" : "text-slate-400",
                  )}
                >
                  Chiqarilgan:
                </span>

                <span className={isDark ? "text-slate-300" : "text-slate-700"}>
                  {techData.releaseDate || "—"}
                </span>
              </div>

              <TextSign className="hidden sm:inline" />

              <div className="flex items-center gap-2 font-bold uppercase tracking-tighter">
                <span
                  className={cn(
                    "text-[10px] sm:text-xs",
                    isDark ? "opacity-60" : "text-slate-400",
                  )}
                >
                  Dasturchi:
                </span>

                <span className="text-blue-500">
                  {techData.developer || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* ==========================================
              RIGHT SIDEBAR
          ========================================== */}

          <div
            className={cn(
              "lg:col-span-4 p-5 md:p-6 rounded-2xl flex flex-col justify-between space-y-6 border transition-all order-1 lg:order-2",
              isDark
                ? "bg-[#171a21] border-white/5"
                : "bg-slate-50 border-slate-200 shadow-xl",
            )}
          >
            <div className="space-y-4">
              {/* COVER */}

              <div
                className={cn(
                  "aspect-video w-full rounded-xl flex items-center justify-center border italic text-xs overflow-hidden shadow-inner",
                  isDark
                    ? "bg-slate-800 border-white/5 opacity-90 text-white"
                    : "bg-white border-slate-200 text-slate-400",
                )}
              >
                {iconPreview ? (
                  <img
                    src={iconPreview}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "Main Cover Yoq"
                )}
              </div>

              {/* TITLE */}

              <div className="space-y-1.5 text-center lg:text-left">
                <h1
                  className={cn(
                    "text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight italic leading-tight break-words",
                    isDark ? "text-white" : "text-slate-900",
                  )}
                >
                  {title}
                </h1>

                {subtitle && (
                  <p className="text-xs sm:text-sm font-semibold opacity-70 italic break-words">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* RATING */}

              <div
                className={cn(
                  "flex flex-col items-center lg:items-start p-3.5 sm:p-4 rounded-2xl border",
                  isDark
                    ? "bg-black/20 border-white/5"
                    : "bg-blue-50/50 border-blue-100",
                )}
              >
                <p
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest mb-1.5",
                    isDark ? "opacity-40" : "text-blue-500",
                  )}
                >
                  {t("Rating") || "Reyting"}
                </p>

                <div className="flex items-center gap-3">
                  <StarRating
                    value={game.rating || 5}
                    size={20}
                    activeColor="text-blue-500"
                  />

                  <span
                    className={cn(
                      "text-lg sm:text-xl font-black italic",
                      isDark ? "text-blue-400" : "text-blue-600",
                    )}
                  >
                    {game.rating || 5}
                  </span>
                </div>
              </div>
            </div>

            {/* STAT CARDS */}

            <div className="grid grid-cols-2 gap-2.5">
              <StatCard
                icon={<IoDownloadOutline className="text-lg sm:text-xl" />}
                val={game.gameDownloads ?? 0}
                label={t("loaded") || "Yuklanishlar"}
                isDark={isDark}
                color="text-blue-500"
              />

              <StatCard
                icon={<MdOutlineReviews className="text-lg sm:text-xl" />}
                val={game.reviewsCount || "0"}
                label={t("Reviews") || "Sharhlar"}
                isDark={isDark}
                color="text-green-500"
              />
            </div>

            {/* MAIN DOWNLOAD BUTTON */}

            <button
              onClick={() => {
                if (game.priceType === "paid" && !game.userHasBought) {
                  setIsBuyModalOpen(true);
                } else {
                  scrollToDownloadSection();
                }
              }}
              className={cn(
                "w-full cursor-pointer py-3.5 sm:py-4 text-white rounded-xl font-bold text-xs sm:text-sm uppercase shadow-lg transition-all flex items-center justify-center gap-2",
                "bg-gradient-to-r from-green-600 to-green-500 hover:brightness-110 active:scale-95",
              )}
            >
              <IoDownloadOutline className="text-lg" />

              {game.priceType === "paid" && !game.userHasBought
                ? `Sotib olish (${game.price || "—"}$)`
                : "Yuklab olish bo‘limiga o'tish"}
            </button>
          </div>
        </section>

        {/* ==========================================
            ABOUT
        ========================================== */}

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* LEFT */}

          <div className="lg:col-span-8 space-y-6">
            <h3 className="text-lg sm:text-xl font-bold uppercase tracking-widest text-blue-500 border-b border-blue-500/30 pb-2 w-fit">
              Oyin haqida
            </h3>

            <div
              className={cn(
                "text-base sm:text-lg md:text-xl font-medium leading-relaxed italic text-balance",
                "break-words overflow-hidden",
                isDark ? "text-slate-200" : "text-slate-800",
              )}
            >
              {Maindescription || "Asosiy tavsif mavjud emas."}
            </div>

            <p
              className={cn(
                "text-xs sm:text-sm leading-relaxed italic text-balance",
                isDark ? "text-slate-400" : "text-slate-500",
              )}
            >
              {description || "Qoshimcha tavsif kiritilmagan."}
            </p>

            {/* FULL INFO */}

            <div className="space-y-4 sm:space-y-6 pt-4">
              <h3 className="text-xl sm:text-2xl font-black uppercase italic">
                Toliq Malumotlar
              </h3>

              <div
                className={cn(
                  "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border",
                  isDark
                    ? "bg-white/5 border-white/5"
                    : "bg-white border-slate-200 shadow-sm",
                )}
              >
                <TechRow label="Versiya" value={techData.version || "—"} />

                <TechRow
                  label="Yuklash hajmi"
                  value={techData.downloadSize || "—"}
                />

                <TechRow
                  label="Oyin ichidagi hajmi"
                  value={techData.inGameSize || "—"}
                />

                <TechRow label="Dasturchi" value={techData.developer || "—"} />

                <TechRow
                  label="Chiqarilgan sana"
                  value={techData.releaseDate || "—"}
                />

                <TechRow
                  label="Tillar soni"
                  value={`${availableLanguagesCount || 1} ta`}
                />
              </div>
            </div>

            {/* WHATS NEW */}

            {whatsNew.length > 0 && (
              <div
                className={cn(
                  "p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] border-2 border-dashed",
                  isDark
                    ? "border-green-500/20 bg-green-500/5"
                    : "border-green-200 bg-green-50",
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500 rounded-lg text-white">
                    <IoTimeOutline size={20} />
                  </div>

                  <h3 className="text-lg sm:text-xl font-black uppercase italic">
                    Yangi yangilanishlar
                  </h3>
                </div>

                <ul className="space-y-3">
                  {whatsNew.map((item: string, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm italic"
                    >
                      <IoCheckmarkCircle className="text-green-500 mt-0.5 shrink-0 text-base" />

                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* RIGHT COMMENT */}

          <div className="lg:col-span-4 space-y-6">
            <button
              onClick={() => setIsCommentOpen(true)}
              className="w-full py-3.5 sm:py-4 border-2 border-blue-500/50 text-blue-500 rounded-xl font-black text-xs sm:text-sm uppercase italic hover:bg-blue-500 hover:text-white transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              {t("comment") || "Sharh yozish"}
            </button>
          </div>
        </section>

        {/* ==========================================
            OS / DOWNLOAD SECTION
        ========================================== */}

        <section
          ref={downloadSectionRef}
          className="pt-6 space-y-6 scroll-mt-24"
        >
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-blue-500 border-b border-blue-500/30 pb-3 w-fit">
            TIZIM TALABLARI & FAYLLAR
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeOsKeys.length > 0 ? (
              activeOsKeys.map((osKey) => {
                const osDetail = osDetailsObj[osKey] || {};

                const reqs = osDetail.requirements || {};

                const fileName = osDetail.fileName || "";

                const isThisDownloading = downloadingOs === osKey;

                return (
                  <div
                    key={osKey}
                    className={cn(
                      "p-6 rounded-2xl border space-y-5 flex flex-col justify-between shadow-lg",
                      isDark
                        ? "bg-[#171a21]/80 border-white/10 text-white"
                        : "bg-slate-50 border-slate-200 text-slate-900",
                    )}
                  >
                    {/* OS INFO */}

                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b pb-3 border-white/10">
                        <h4 className="text-lg font-black uppercase tracking-wider text-blue-400">
                          {osKey}
                        </h4>

                        <span className="text-[10px] font-bold uppercase opacity-50">
                          v1
                        </span>
                      </div>

                      {/* REQUIREMENTS */}

                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between border-b border-white/5 pb-1.5 gap-3">
                          <span className="opacity-60 font-semibold">OS:</span>

                          <span className="font-bold text-right break-words">
                            {reqs.os || "—"}
                          </span>
                        </div>

                        <div className="flex justify-between border-b border-white/5 pb-1.5 gap-3">
                          <span className="opacity-60 font-semibold">CPU:</span>

                          <span className="font-bold text-right break-words">
                            {reqs.cpu || "—"}
                          </span>
                        </div>

                        <div className="flex justify-between border-b border-white/5 pb-1.5 gap-3">
                          <span className="opacity-60 font-semibold">GPU:</span>

                          <span className="font-bold text-right break-words">
                            {reqs.gpu || "—"}
                          </span>
                        </div>

                        <div className="flex justify-between border-b border-white/5 pb-1.5 gap-3">
                          <span className="opacity-60 font-semibold">RAM:</span>

                          <span className="font-bold text-right break-words">
                            {reqs.ram || "—"}
                          </span>
                        </div>
                      </div>

                      {/* FILE */}

                      <div className="pt-2">
                        <p className="text-[10px] uppercase font-bold opacity-50 truncate">
                          Fayl:{" "}
                          <span className="normal-case font-mono">
                            {fileName || "Mavjud emas"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* DOWNLOAD BUTTON */}

                    <button
                      onClick={() => handleOsActionClick(osKey, fileName)}
                      disabled={isThisDownloading}
                      className={cn(
                        "w-full cursor-pointer py-3.5 px-4 text-white rounded-xl font-bold text-xs sm:text-sm uppercase shadow-md transition-all flex items-center justify-center gap-2 mt-4",
                        isThisDownloading
                          ? "bg-slate-600 opacity-70 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-600 to-green-500 hover:brightness-110 active:scale-95",
                      )}
                    >
                      {isThisDownloading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Yuklanmoqda...
                        </span>
                      ) : game.priceType === "paid" && !game.userHasBought ? (
                        <span>Sotib olish ({game.price || "—"}$)</span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <IoDownloadOutline className="text-base" />
                          Faylni yuklab olish
                        </span>
                      )}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center text-xs italic opacity-60 py-4">
                Operatsion tizimlar yoki talablar kiritilmagan.
              </div>
            )}
          </div>
        </section>

        {/* ==========================================
            COMMENTS
        ========================================== */}

        <section className="pt-8 sm:pt-10 space-y-6 sm:space-y-8">
          <div
            className={cn(
              "flex items-center gap-4 border-b pb-4",
              isDark ? "border-white/5" : "border-slate-200",
            )}
          >
            <h3 className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter text-blue-500">
              Sharhlar
            </h3>

            <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase bg-blue-500/10 text-blue-500">
              SOON
            </span>
          </div>

          <div
            className={cn(
              "relative min-h-[180px] rounded-2xl sm:rounded-[2rem] border flex items-center justify-center overflow-hidden",
              isDark
                ? "bg-white/5 border-white/10"
                : "bg-slate-50 border-slate-200",
            )}
          >
            <div className="absolute inset-0 backdrop-blur-sm" />

            <div className="relative z-10 text-center">
              <p className="text-3xl sm:text-4xl font-black italic tracking-widest text-blue-500">
                SOON
              </p>

              <p className="mt-2 text-xs uppercase font-bold opacity-40">
                Sharhlar tez orada
              </p>
            </div>
          </div>
        </section>

        {/* ==========================================
            DOWNLOAD GUIDE MODAL
        ========================================== */}

        {isDownloadGuideOpen && (
          <div className="fixed inset-0 z-[99999999] w-full h-full flex items-center justify-center p-3">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => {
                if (guideWatched) {
                  closeDownloadGuide();
                }
              }}
            />

            {/* Compact Modal */}
            <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Windows yuklab olish qo‘llanmasi
                  </h2>

                  <p className="mt-0.5 text-xs text-zinc-400">
                    Videoni ko‘rib, keyin yuklab olishni davom ettiring.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeDownloadGuide}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/10 hover:text-white"
                >
                  <IoClose size={20} />
                </button>
              </div>

              {/* Video */}
              <div className="bg-black p-2">
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                  <video
                    key={pendingDownload?.fileName || "download-guide"}
                    id="windows-download-guide"
                    className="h-full w-full object-contain"
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    src="/videos/windows-unblock.mp4"
                    onEnded={() => {
                      setGuideWatched(true);
                    }}
                  />
                </div>
              </div>

              {/* Bottom */}
              <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
                <div className="text-xs text-zinc-400">
                  {guideWatched ? (
                    <span className="text-emerald-400">
                      ✓ Video ko‘rib chiqildi
                    </span>
                  ) : (
                    "Videoni oxirigacha ko‘ring"
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Replay */}
                  {guideWatched && (
                    <button
                      type="button"
                      onClick={() => {
                        const video = document.getElementById(
                          "windows-download-guide",
                        ) as HTMLVideoElement | null;

                        if (video) {
                          video.currentTime = 0;
                          video.play();
                        }
                      }}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10"
                    >
                      Qayta ko‘rish
                    </button>
                  )}

                  {/* Continue */}
                  <button
                    type="button"
                    disabled={!guideWatched}
                    onClick={handleGuideContinue}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition",
                      guideWatched
                        ? "bg-white text-black hover:bg-zinc-200"
                        : "cursor-not-allowed bg-white/10 text-zinc-500",
                    )}
                  >
                    <IoDownloadOutline size={17} />

                    {guideWatched ? "Davom etish" : "Videoni ko‘ring"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            COMMENT MODAL
        ========================================== */}

        <CommentModal
          isOpen={isCommentOpen}
          onClose={() => setIsCommentOpen(false)}
          isDark={isDark}
        />

        {/* ==========================================
            BUY MODAL
        ========================================== */}

        <BuyFormModal
          isOpen={isBuyModalOpen}
          onClose={() => setIsBuyModalOpen(false)}
          gameTitle={title}
          gamePrice={game.price || "0 so'm"}
          gameId={game._id}
        />
      </div>
    </main>
  );
}

// ==========================================
// STAR RATING
// ==========================================

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
              style={{
                width: isFull ? "100%" : isHalf ? "50%" : "0%",
              }}
            >
              <IoStar size={size} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// STAT CARD
// ==========================================

function StatCard({ icon, val, label, isDark, color }: StatCardProps) {
  return (
    <div
      className={cn(
        "p-2.5 sm:p-3 rounded-xl border text-center transition-transform hover:scale-105",
        isDark
          ? "bg-black/40 border-white/5 text-white"
          : "bg-white border-slate-200 shadow-sm text-slate-900",
      )}
    >
      <div className={cn("mx-auto mb-1 flex justify-center", color)}>
        {icon}
      </div>

      <p className="text-xs sm:text-sm font-black leading-none">{val}</p>

      <p
        className={cn(
          "text-[8px] uppercase font-bold mt-1 truncate",
          isDark ? "opacity-50" : "text-slate-400",
        )}
      >
        {label}
      </p>
    </div>
  );
}

// ==========================================
// REQUIREMENT ROW
// ==========================================

function RequirementRow({ label, val, isDark }: RequirementRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col border-b pb-2",
        isDark ? "border-white/5" : "border-slate-200",
      )}
    >
      <span
        className={cn(
          "text-[10px] uppercase font-bold",
          isDark ? "opacity-40" : "text-slate-400",
        )}
      >
        {label}
      </span>

      <span
        className={cn(
          "text-xs sm:text-sm font-bold break-words",
          isDark ? "text-slate-200" : "text-slate-700",
        )}
      >
        {val}
      </span>
    </div>
  );
}

// ==========================================
// TECH ROW
// ==========================================

function TechRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0 px-1">
      <span className="text-[10px] sm:text-xs font-black uppercase opacity-40 italic">
        {label}
      </span>

      <span className="text-xs sm:text-sm font-bold italic truncate max-w-[60%] text-right">
        {value}
      </span>
    </div>
  );
}
