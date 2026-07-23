"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Calendar,
  Check,
  X,
  Sparkles,
  Laptop,
  Smartphone,
  Download,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { GameData, MOCK_GAMES, LanguageType } from "@/constants/index";
import NotificationModal, {
  NotificationPayload,
} from "@/components/modals/notification-modal";

// Kop tilli NotificationModal componenti va tiplari import qilinadi

const TEST_SCREENSHOTS = [
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80",
];

export default function GameDetailRequest() {
  const params = useParams();
  const router = useRouter();

  const slug = typeof params?.slug === "string" ? params.slug : "";
  const [activeLang, setActiveLang] = useState<LanguageType>("uz");

  // --- Tasdiqlash Modali uchun State ---
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "approve" | "reject" | null;
  }>({
    isOpen: false,
    type: null,
  });

  // --- Notification Modal State ---
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifTargetUser, setNotifTargetUser] = useState<{
    id: number | string;
    name: string;
  } | null>(null);

  // --- Toast Message State ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const gameItem: GameData | undefined = MOCK_GAMES.find(
    (game) => game.slug === slug,
  );

  if (!gameItem) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center text-slate-800 dark:text-slate-100 p-6">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-black">Oyin topilmadi</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bunday slug bilan bogliq oyin tizimda mavjud emas.
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-755 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Orqaga qaytish
          </button>
        </div>
      </div>
    );
  }

  const currentLangData = gameItem.langData[activeLang];

  const screenshots =
    currentLangData.screenshotPreviews &&
    currentLangData.screenshotPreviews.length > 0
      ? currentLangData.screenshotPreviews
      : TEST_SCREENSHOTS;

  const iconSrc =
    currentLangData.iconPreview ||
    "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?auto=format&fit=crop&w=150&h=150&q=80";

  const openConfirm = (type: "approve" | "reject") => {
    setConfirmModal({ isOpen: true, type });
  };

  const closeConfirm = () => {
    setConfirmModal({ isOpen: false, type: null });
  };

  // Tasdiqlash yoki Rad etish tugmasi bosilganda:
  const handleAction = () => {
    closeConfirm();

    // Dasturchiga xabar yuborish uchun Notification modalini ochamiz
    setNotifTargetUser({
      id: gameItem.id || "dev_1",
      name: currentLangData.developer,
    });
    setIsNotifModalOpen(true);
  };

  // Notification yuborilgach ishlaydigan funksiya
  const handleNotificationSubmit = (payload: NotificationPayload) => {
    console.log("Dasturchiga yuborilgan notification:", payload);

    // Toast xabarini chiqarish
    setToastMessage(
      `Oyin qarori saqlandi va ${currentLangData.developer} ga bildirishnoma yuborildi!`,
    );

    // 2.5 soniyadan song royxatga yonaltirish
    setTimeout(() => {
      setToastMessage(null);
      router.push("/admin/requests");
    }, 2500);
  };

  const handleInstallFile = (osName: string) => {
    let downloadUrl = "";
    if (osName.toLowerCase() === "android") {
      downloadUrl =
        "https://github.com/SecUSo/privacy-friendly-2048/releases/download/v2.1.1/2048-v2.1.1.apk";
    } else {
      downloadUrl =
        "https://github.com/gabrielecirulli/2048/archive/refs/heads/master.zip";
    }

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", `test-game-${osName.toLowerCase()}`);
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full my-15 min-h-screen p-0 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* --- TOAST BILDIRISHNOMA --- */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100000] flex items-center gap-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 dark:border-slate-200 font-bold text-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigatsiya paneli */}
      <div className="flex items-center justify-between gap-3 pb-5">
        <Link
          href="/admin/requests/new"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 transition-all duration-150 active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Royxatga qaytish</span>
        </Link>

        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>Sana: {gameItem.createdAt.slice(0, 10)}</span>
        </div>
      </div>

      {/* Asosiy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Chap blok */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-start gap-4">
            <img
              src={iconSrc}
              alt="Game Icon"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 dark:border-slate-900"
            />
            <div className="space-y-1">
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {currentLangData.title}
              </h1>
              <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-bold">
                {currentLangData.subtitle}
              </p>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                  {currentLangData.category}
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  Dasturchi: {currentLangData.developer}
                </span>
              </div>
            </div>
          </div>

          {/* Screenshotlar Slideri */}
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              className="w-full h-full custom-swiper"
            >
              {screenshots.map((screen, index) => (
                <SwiperSlide key={`${screen}-${index}`}>
                  <img
                    src={screen}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Tarjima Selectori va Tavsif */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-900/40">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Globe className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-wider">
                  TARJIMA TILI:
                </span>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl">
                {(["uz", "ru", "en", "tr"] as LanguageType[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`px-3 py-1.5 text-xs font-black rounded-lg uppercase transition-all duration-150 ${
                      activeLang === lang
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <motion.div
              key={activeLang}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                OYIN HAQIDA
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line font-medium">
                {currentLangData.description}
              </p>
            </motion.div>
          </div>

          {/* Tizim talablari */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              TIZIM TALABLARI & FAYLLAR
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(gameItem.osDetails).map(([osName, detail]) => (
                <div
                  key={osName}
                  className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-150/40 dark:border-slate-900/40 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/40 pb-2">
                      <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400">
                        {osName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold">
                        v{currentLangData.version}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px] font-semibold text-slate-550 dark:text-slate-400">
                      <div className="flex justify-between">
                        <span>OS:</span>{" "}
                        <span className="text-slate-800 dark:text-white">
                          {detail.requirements.os}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>CPU:</span>{" "}
                        <span className="text-slate-800 dark:text-white">
                          {detail.requirements.cpu}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>GPU:</span>{" "}
                        <span className="text-slate-800 dark:text-white">
                          {detail.requirements.gpu}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>RAM:</span>{" "}
                        <span className="text-slate-800 dark:text-white">
                          {detail.requirements.ram}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/40 space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span
                        className="font-mono truncate"
                        title={detail.fileName}
                      >
                        {detail.fileName}
                      </span>
                    </div>

                    <button
                      onClick={() => handleInstallFile(osName)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-black rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-slate-950 transition-all duration-150 active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Faylni yuklab olish (Test)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ong tomon: Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h3 className="text-xs font-black uppercase tracking-wider">
                OYIN METADATASI
              </h3>
            </div>

            <div className="space-y-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-900/40">
                <span>Platformalar:</span>
                <span className="flex items-center gap-2 text-slate-800 dark:text-white uppercase font-bold text-[11px]">
                  {gameItem.platform === "both" && (
                    <>
                      <span className="flex items-center gap-1">
                        <Laptop className="w-3.5 h-3.5 text-indigo-500" /> PC
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-500" />{" "}
                        Mobile
                      </span>
                    </>
                  )}
                  {gameItem.platform === "pc" && (
                    <span className="flex items-center gap-1">
                      <Laptop className="w-3.5 h-3.5 text-indigo-500" /> PC
                    </span>
                  )}
                  {gameItem.platform === "mobile" && (
                    <span className="flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-500" />{" "}
                      Mobile
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-900/40">
                <span>Narxi:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-450">
                  {gameItem.priceType === "free" ? "Bepul" : gameItem.price}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-900/40">
                <span>Yuklab olish hajmi:</span>
                <span className="text-slate-800 dark:text-white">
                  {currentLangData.downloadSize}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-900/40">
                <span>Oyin ichi hajmi:</span>
                <span className="text-slate-800 dark:text-white">
                  {currentLangData.inGameSize}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-900/40">
                <span>Korinishi:</span>
                <span className="text-slate-800 dark:text-white capitalize">
                  {gameItem.visibility}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 py-1">
                <span>Slug:</span>
                <span className="font-mono text-[11px] text-slate-550 dark:text-slate-450 bg-slate-100 dark:bg-slate-900/60 p-2.5 rounded-lg break-all">
                  {gameItem.slug}
                </span>
              </div>
            </div>

            {gameItem.whatsNew && gameItem.whatsNew.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  YANGI OZGARISHLAR:
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pl-4 list-disc font-medium">
                  {gameItem.whatsNew.map((update, idx) => (
                    <li key={idx}>{update}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-4">
              <button
                onClick={() => openConfirm("reject")}
                className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-black rounded-xl text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition-all duration-150 active:scale-95"
              >
                <X className="w-4 h-4" />
                Rad etish
              </button>
              <button
                onClick={() => openConfirm("approve")}
                className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-black rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-150 active:scale-95 shadow-md shadow-indigo-600/10"
              >
                <Check className="w-4 h-4" />
                Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeConfirm}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-[4px]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative w-full max-w-sm rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div
                  className={`p-3 rounded-full ${
                    confirmModal.type === "approve"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-rose-500/10 text-rose-500"
                  }`}
                >
                  {confirmModal.type === "approve" ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <AlertTriangle className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-wider">
                    {confirmModal.type === "approve"
                      ? "Tasdiqlaysizmi?"
                      : "Rad etasizmi?"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[280px]">
                    {confirmModal.type === "approve"
                      ? `"${currentLangData.title}" oyinini tasdiqlab, tizimga chiqarmoqchimisiz?`
                      : `"${currentLangData.title}" oyinini sorovini bekor qilmoqchimisiz?`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full pt-2">
                  <button
                    onClick={closeConfirm}
                    className="py-2 text-xs font-black rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/20 dark:hover:bg-slate-755 transition-all duration-150 active:scale-95"
                  >
                    Orqaga
                  </button>
                  <button
                    onClick={handleAction}
                    className={`py-2 text-xs font-black rounded-xl text-white transition-all duration-150 active:scale-95 ${
                      confirmModal.type === "approve"
                        ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/10"
                        : "bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/10"
                    }`}
                  >
                    Ha, bajarilsin
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- OYIN DASTURCHISIGA BILDIRISHNOMA YUBORISH MODALI --- */}
      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        onSubmit={handleNotificationSubmit}
        isPublic={false}
        targetUser={notifTargetUser}
      />

      <style jsx global>{`
        /* Swiper Tugmalari */
        .custom-swiper .swiper-button-next,
        .custom-swiper .swiper-button-prev {
          background: rgba(255, 255, 255, 0.8) !important;
          color: #1e293b !important;

          :global(.dark) & {
            background: rgba(15, 23, 42, 0.75) !important;
            color: #ffffff !important;
          }

          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);

          width: 32px;
          height: 32px;
          border-radius: 30% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;

          opacity: 0;
          transition:
            opacity 0.2s ease,
            background 0.2s ease,
            color 0.1s ease;
        }

        .custom-swiper:hover .swiper-button-next,
        .custom-swiper:hover .swiper-button-prev {
          opacity: 1;
        }

        .custom-swiper .swiper-button-next:hover,
        .custom-swiper .swiper-button-prev:hover {
          background: #4f46e5 !important;
          color: #ffffff !important;
        }

        .custom-swiper .swiper-button-next::after,
        .custom-swiper .swiper-button-prev::after {
          font-size: 11px !important;
          font-weight: 900 !important;
        }

        .custom-swiper .swiper-button-disabled {
          opacity: 0 !important;
          pointer-events: none !important;
        }

        .custom-swiper .swiper-pagination-bullet {
          background: #64748b !important;
          opacity: 0.6;
        }

        .custom-swiper .swiper-pagination-bullet-active {
          background: #6366f1 !important;
          opacity: 1;
          width: 16px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
