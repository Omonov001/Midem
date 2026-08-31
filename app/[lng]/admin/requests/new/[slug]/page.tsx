/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
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
  AlertTriangle,
  Loader2,
} from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import NotificationModal, {
  NotificationPayload,
  MultiLangContent,
  Language,
} from "@/components/modals/notification-modal";

type AllowedLangs = "uz" | "ru" | "en" | "tu";

export default function NewsDetailRequest() {
  const params = useParams();
  const router = useRouter();

  const slugParam = params?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam || "";

  const [activeLang, setActiveLang] = useState<AllowedLangs>("uz");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newsItem, setNewsItem] = useState<any>(null);

  // --- 1. MONGODBDAN SLUG ORQALI MALUMOTNI OLISH ---
  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/requests");
        const data = await res.json();

        if (data.success && data.news) {
          // Barcha news ichidan hozirgi slugga mosini topamiz
          const found = data.news.find((item: any) => item.slug === slug);
          setNewsItem(found || null);
        }
      } catch (error) {
        console.error("Yangilik tafsilotini yuklashda xatolik:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchNewsDetail();
    }
  }, [slug]);

  // --- Confirm Modal State ---
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "approve" | "reject" | null;
  }>({
    isOpen: false,
    type: null,
  });

  // --- Notification Modal State ---
  const [notifState, setNotifState] = useState<{
    isOpen: boolean;
    actionType: "approve" | "reject" | null;
  }>({
    isOpen: false,
    actionType: null,
  });

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
        <p className="text-xs font-bold">Yangilik yuklanmoqda...</p>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center text-slate-800 dark:text-slate-100 p-6">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-black">Yangilik topilmadi</h2>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Orqaga qaytish
          </button>
        </div>
      </div>
    );
  }

  const currentTranslation =
    newsItem.translations?.[activeLang] || newsItem.translations?.["uz"];
  const allBanners = currentTranslation?.banners || [];

  // Muallif (User) malumotlarini aniqlab olamiz
  const authorObj = newsItem.authorId;
  const authorId = typeof authorObj === "object" ? authorObj?._id : authorObj;
  const authorUsername =
    (typeof authorObj === "object" &&
      (authorObj?.username || authorObj?.name)) ||
    "Muallif";

  // --- Confirm Modal Boshqaruvi ---
  const openConfirm = (type: "approve" | "reject") => {
    setConfirmModal({ isOpen: true, type });
  };

  const closeConfirm = () => {
    setConfirmModal({ isOpen: false, type: null });
  };

  const handleCloseNotifModal = () => {
    setNotifState({
      isOpen: false,
      actionType: null,
    });
    handlePush();
  };

  // --- 1. Confirm modalda "Ha, davom etish" bosilganda ---
  const handleConfirmAccept = async () => {
    const currentType = confirmModal.type; // "approve" yoki "reject"
    closeConfirm();

    if (!currentType) return;

    try {
      // 🚀 1. Darhol bazada statusni o'zgartiramiz (PATCH so'rovi)
      const res = await fetch("/api/admin/action-request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId: newsItem._id,
          targetType: "news",
          action: currentType,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Xatolik yuz berdi");
        return;
      }

      // 2. Bazadan muvaffaqiyatli o'tgach, Notification oynasini ochamiz
      setNotifState({
        isOpen: true,
        actionType: currentType,
      });
    } catch (error) {
      console.error("Action error:", error);
      alert("Server bilan bog'lanishda xatolik!");
    }
  };
  const handlePush = async () => {
    router.push("/admin/requests");
  };
  // --- 2. Notification modal yuborilganda yoki yopilganda ---
  const handleNotificationSubmit = async (payload: NotificationPayload) => {
    try {
      // Agar bildirishnoma matni kiritilib yuborilsa, developerga jo'natamiz
      if (authorId) {
        await fetch("/api/admin/send-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: authorId,
            targetId: authorId,
            targetType: "user",
            notification: payload,
          }),
        });
      }
    } catch (error) {
      console.error("Notification send error:", error);
    } finally {
      handleCloseNotifModal();
      router.push("/admin/requests");
    }
  };

  const getInitialValues = (): Partial<Record<Language, MultiLangContent>> => {
    const isApprove = notifState.actionType === "approve";
    const titleUz = currentTranslation?.title || "Yangilik";

    return {
      uz: {
        title: isApprove
          ? "Yangiligingiz tasdiqlandi"
          : "Yangiligingiz rad etildi",
        message: isApprove
          ? `Siz yuborgan "${titleUz}" yangilik sorovi korib chiqildi va platformada elon qilindi.`
          : `Afsuski, siz yuborgan "${titleUz}" yangilik sorovi moderatsiyadan otmadi va rad etildi.`,
      },
      ru: {
        title: isApprove ? "Ваша новость одобрена" : "Ваша новость отклонена",
        message: isApprove
          ? `Ваша заявка на новость "${titleUz}" была рассмотрена и опубликована.`
          : `К сожалению, ваша заявка на новость "${titleUz}" была отклонена.`,
      },
      en: {
        title: isApprove ? "Your news approved" : "Your news rejected",
        message: isApprove
          ? `Your news request "${titleUz}" has been reviewed and published.`
          : `Unfortunately, your news request "${titleUz}" was rejected.`,
      },
      tr: {
        title: isApprove ? "Haberiniz onaylandı" : "Haberiniz reddedildi",
        message: isApprove
          ? `"${titleUz}" haber talebiniz incelendi ve yayınlandı.`
          : `Ne yazık ki "${titleUz}" haber talebiniz reddedildi.`,
      },
    };
  };

  return (
    <div className="w-full my-15 min-h-screen p-0 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* 1. Navigatsiya paneli */}
      <div className="flex items-center justify-between gap-3 pb-5">
        <Link
          href="/admin/requests"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 transition-all duration-150 active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Royxatga qaytish</span>
        </Link>

        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>Sana: {new Date(newsItem.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* 2. Asosiy Maket */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Chap va Markaziy blok (66%) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Swiper Slider */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950">
            {allBanners.length > 0 ? (
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                watchOverflow={true}
                className="w-full h-full custom-swiper"
              >
                {allBanners.map((banner: string, index: number) => (
                  <SwiperSlide key={`${banner}-${index}`}>
                    <img
                      src={banner}
                      alt={`News Banner ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600 text-xs">
                Rasm mavjud emas
              </div>
            )}
          </div>

          {/* Tarjima va Kontent */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-900/40">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Globe className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-wider">
                  TARJIMA:
                </span>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl">
                {(["uz", "ru", "en", "tu"] as AllowedLangs[]).map((lang) => (
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
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                {currentTranslation?.title || "Sarlavha yoq"}
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium whitespace-pre-line">
                {currentTranslation?.content || "Matn mavjud emas"}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Ong tomon: Sidebar (33%) */}
        <div className="space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h3 className="text-xs font-black uppercase tracking-wider">
                SOROV MALUMOTLARI
              </h3>
            </div>

            <div className="space-y-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-900/40">
                <span>Muallif:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  @{authorUsername}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-900/40">
                <span>Korinish:</span>
                <span className="text-slate-800 dark:text-white capitalize">
                  {newsItem.visibility}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 py-1">
                <span>Slug nomi:</span>
                <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/60 p-2.5 rounded-lg break-all">
                  {newsItem.slug}
                </span>
              </div>
            </div>

            {/* Rad etish va Tasdiqlash tugmalari */}
            <div className="grid grid-cols-2 gap-3 pt-2">
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

      {/* --- 1. DASTLABKI CONFIRM MODAL DIALOG --- */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[99990] flex items-center justify-center p-4">
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
                      ? "Ushbu yangilik sorovini tasdiqlash uchun xabar sahifasiga otasizmi?"
                      : "Ushbu yangilik sorovini rad etish sababini kiritmoqchimisiz?"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full pt-2">
                  <button
                    onClick={closeConfirm}
                    className="py-2 text-xs font-black rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-150 active:scale-95"
                  >
                    Orqaga
                  </button>
                  <button
                    onClick={handleConfirmAccept}
                    className={`py-2 text-xs font-black rounded-xl text-white transition-all duration-150 active:scale-95 ${
                      confirmModal.type === "approve"
                        ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/10"
                        : "bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/10"
                    }`}
                  >
                    Ha, davom etish
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- 2. FOYDALANUVCHI (DEV)GA BILDIRISHNOMA YUBORISH MODALI --- */}
      <NotificationModal
        isOpen={notifState.isOpen}
        onClose={handleCloseNotifModal}
        onSubmit={handleNotificationSubmit}
        isPublic={false}
        targetUser={{
          id: authorId || "",
          name: authorUsername,
        }}
        initialValues={getInitialValues()}
      />

      <style jsx global>{`
        .custom-swiper .swiper-button-next,
        .custom-swiper .swiper-button-prev {
          background: rgba(255, 255, 255, 0.8) !important;
          color: #1e293b !important;
          backdrop-filter: blur(8px);
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

        :global(.dark) .custom-swiper .swiper-button-next,
        :global(.dark) .custom-swiper .swiper-button-prev {
          background: rgba(15, 23, 42, 0.75) !important;
          color: #ffffff !important;
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
