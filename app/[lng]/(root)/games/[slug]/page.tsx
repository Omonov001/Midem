/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useTheme } from "@/components/ui/theme-provider";
import { useEffect, useState, ReactNode, use, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  IoArrowBack,
  IoCheckmarkCircle,
  IoDownloadOutline,
  IoPersonCircleOutline,
  IoStar,
  IoThumbsUpOutline,
  IoTimeOutline,
} from "react-icons/io5";
import Link from "next/link";
import CommentModal from "@/components/modals/comment-modal";
import BuyFormModal from "@/components/modals/buy-form";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import TextSign from "@/components/sign/text-sign";
import { MdOutlineReviews } from "react-icons/md";
import useTranslate from "@/hooks/use-translate";

const MOCK_COMMENTS = [
  {
    id: 1,
    user: "Asadbek Dev",
    date: "15 May, 2026",
    rating: 5,
    text: "Oyin grafikasiga gap yoq! Ayniqsa caselardan tushadigan itemlar juda noyob ekan.",
    likes: 12,
  },
];

interface StatCardProps {
  icon: ReactNode;
  val: string;
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

export default function PCGameDetail({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [downloadingOs, setDownloadingOs] = useState<string | null>(null);

  // Pastdagi yuklash/talablar bo'limiga skrol qilish uchun ref
  const downloadSectionRef = useRef<HTMLDivElement>(null);

  const t = useTranslate();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      fetch(`/api/games/${slug}`)
        .then((res) => {
          if (!res.ok) throw new Error("Oyin topilmadi");
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
    }
  }, [slug]);

  // Tugma bosilganda sahifani pastga skrol qilish
  const scrollToDownloadSection = () => {
    downloadSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleOsActionClick = (osKey: string, fileName: string) => {
    if (!game) return;

    const isPaid = game.priceType === "paid";
    const userHasBought = game.userHasBought || false;

    if (isPaid && !userHasBought) {
      setIsBuyModalOpen(true);
      return;
    }

    onDownloadClick(osKey, fileName);
  };

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, isPaid, userHasBought }),
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

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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

  const langObj = game.langData?.uz || game.langData?.en || {};
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

  const osDetailsObj = game.osDetails
    ? game.osDetails instanceof Map
      ? Object.fromEntries(game.osDetails)
      : game.osDetails
    : {};

  const selectedOS = game.selectedOS || {};
  const activeOsKeys = Object.keys(selectedOS).filter(
    (key) => selectedOS[key] === true,
  );

  return (
    <main
      className={cn(
        "relative min-h-screen pt-20 md:pt-[12vh] pb-20 px-4 sm:px-6 md:px-12 transition-colors duration-500",
        isDark ? "bg-slate-950 text-slate-300" : "bg-white text-slate-900",
      )}
    >
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-10">
        {/* BREADCRUMBS */}
        <Link
          href="/games"
          className={cn(
            "flex items-center gap-2 text-xs uppercase tracking-widest transition-all w-fit",
            isDark
              ? "opacity-50 hover:opacity-100 text-white"
              : "text-slate-500 hover:text-blue-600",
          )}
        >
          <IoArrowBack /> {t("back") || "Orqaga"}
        </Link>

        {/* TOP GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* CHAP TOMON: SWIPER */}
          <div className="lg:col-span-8 w-full order-2 lg:order-1">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000 }}
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

          {/* O'NG SIDEBAR */}
          <div
            className={cn(
              "lg:col-span-4 p-5 md:p-6 rounded-2xl flex flex-col justify-between space-y-6 border transition-all order-1 lg:order-2",
              isDark
                ? "bg-[#171a21] border-white/5"
                : "bg-slate-50 border-slate-200 shadow-xl",
            )}
          >
            <div className="space-y-4">
              {/* ICON (COVER) */}
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

              {/* TITLE VA SUBTITLE */}
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

              {/* REYTING BLOCK */}
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
                    value={game.rating || 4.5}
                    size={20}
                    activeColor="text-blue-500"
                  />
                  <span
                    className={cn(
                      "text-lg sm:text-xl font-black italic",
                      isDark ? "text-blue-400" : "text-blue-600",
                    )}
                  >
                    {game.rating || 4.5}
                  </span>
                </div>
              </div>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-2 gap-2.5">
              <StatCard
                icon={<IoDownloadOutline className="text-lg sm:text-xl" />}
                val={game.downloadsCount || "0"}
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

            {/* --- TEPADAGI ASOSIY TUGMA (BOSILGANDA PASTGA TUSHIRADI) --- */}
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
                ? `Sotib olish (${game.price || "—"})`
                : "Yuklab olish bo'limiga o'tish"}
            </button>
          </div>
        </section>

        {/* ABOUT & REQUIREMENTS SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* OYIN HAQIDA BOLIMI */}
          <div className="lg:col-span-8 space-y-6">
            <h3 className="text-lg sm:text-xl font-bold uppercase tracking-widest text-blue-500 border-b border-blue-500/30 pb-2 w-fit">
              Oyin haqida
            </h3>

            <div
              className={cn(
                "text-base sm:text-lg md:text-xl font-medium leading-relaxed italic text-balance",
                "break-words overflow-hidden", // <--- SHU YERGA QO'SHILDI
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

            {/* TOLIQ MALUMOTLAR GRID */}
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
                  label="Oyin ichidagi hajm"
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

            {/* WHATS NEW BLOCK */}
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

          {/* O'NG TOMONDA SHARH YOZISH TUGMASI */}
          <div className="lg:col-span-4 space-y-6">
            <button
              onClick={() => setIsCommentOpen(true)}
              className="w-full py-3.5 sm:py-4 border-2 border-blue-500/50 text-blue-500 rounded-xl font-black text-xs sm:text-sm uppercase italic hover:bg-blue-500 hover:text-white transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              {t("comment") || "Sharh yozish"}
            </button>
          </div>
        </section>

        {/* --- TIZIM TALABLARI & FAYLLAR (OS DETAILS) BO'LIMI (RASMDAGIDEK) --- */}
        <section
          ref={downloadSectionRef}
          className="pt-6 space-y-6 scroll-mt-24"
        >
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-blue-500 border-b border-blue-500/30 pb-3 w-fit">
            TIZIM TALABLARI & FAYLLAR (OS DETAILS)
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
                    <div className="space-y-4">
                      {/* OS NOMI VA VERSIONS */}
                      <div className="flex justify-between items-center border-b pb-3 border-white/10">
                        <h4 className="text-lg font-black uppercase tracking-wider text-blue-400">
                          {osKey}
                        </h4>
                        <span className="text-[10px] font-bold uppercase opacity-50">
                          v1
                        </span>
                      </div>

                      {/* TALABLAR RO'YXATI */}
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between border-b border-white/5 pb-1.5">
                          <span className="opacity-60 font-semibold">OS:</span>
                          <span className="font-bold">{reqs.os || "—"}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1.5">
                          <span className="opacity-60 font-semibold">CPU:</span>
                          <span className="font-bold">{reqs.cpu || "—"}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1.5">
                          <span className="opacity-60 font-semibold">GPU:</span>
                          <span className="font-bold">{reqs.gpu || "—"}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1.5">
                          <span className="opacity-60 font-semibold">RAM:</span>
                          <span className="font-bold">{reqs.ram || "—"}</span>
                        </div>
                      </div>

                      {/* FAYL YO'LI */}
                      <div className="pt-2">
                        <p className="text-[10px] uppercase font-bold opacity-50 truncate">
                          Fayl:{" "}
                          <span className="normal-case font-mono">
                            {fileName || "Mavjud emas"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* FAYLINI YUKLAB OLISH TUGMASI */}
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
                        <span>Sotib olish ({game.price || "—"})</span>
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

        {/* COMMENTS SECTION */}
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
            <span
              className={cn(
                "px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase",
                isDark ? "bg-white/10 text-white" : "bg-blue-100 text-blue-600",
              )}
            >
              {MOCK_COMMENTS.length} ta sharh
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {MOCK_COMMENTS.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  "p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] border transition-all hover:scale-[1.01]",
                  isDark
                    ? "bg-white/5 border-white/10"
                    : "bg-slate-50 border-slate-200 shadow-md",
                )}
              >
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="flex items-center gap-3">
                    <IoPersonCircleOutline
                      size={36}
                      className="text-blue-500 shrink-0"
                    />
                    <div>
                      <h4
                        className={cn(
                          "font-bold text-xs sm:text-sm leading-none",
                          isDark ? "text-white" : "text-slate-800",
                        )}
                      >
                        {comment.user}
                      </h4>
                      <span
                        className={cn(
                          "text-[9px] sm:text-[10px] uppercase font-black",
                          isDark ? "opacity-50" : "text-slate-400",
                        )}
                      >
                        {comment.date}
                      </span>
                    </div>
                  </div>
                  <StarRating
                    value={comment.rating}
                    size={14}
                    activeColor="text-orange-500"
                  />
                </div>
                <p
                  className={cn(
                    "text-xs sm:text-sm leading-relaxed mb-4 italic",
                    isDark ? "text-slate-300" : "text-slate-600",
                  )}
                >
                  {comment.text}
                </p>
                <div
                  className={cn(
                    "flex items-center gap-2 cursor-pointer transition-all w-fit",
                    isDark
                      ? "opacity-50 hover:opacity-100 text-white"
                      : "text-slate-400 hover:text-blue-500",
                  )}
                >
                  <IoThumbsUpOutline size={16} />
                  <span className="text-xs font-bold">
                    {comment.likes} foydali
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MODALLAR */}
        <CommentModal
          isOpen={isCommentOpen}
          onClose={() => setIsCommentOpen(false)}
          isDark={isDark}
        />

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
