/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { handleGameDownload } from "@/lib/dowload";
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
  Loader2,
  User,
  Tag,
  FileText,
  AlignLeft,
} from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { LanguageType, IGameDocument } from "@/models/game.model";
import NotificationModal, {
  NotificationPayload,
  MultiLangContent,
  Language,
} from "@/components/modals/notification-modal";

const TEST_SCREENSHOTS = [
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
];

export default function GameDetailRequest() {
  const params = useParams();
  const router = useRouter();

  const [slug, setSlug] = useState<string>("");
  const [activeLang, setActiveLang] = useState<LanguageType>("uz");

  // --- MongoDB State ---
  const [gameItem, setGameItem] = useState<IGameDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // --- Dasturchi malumotlarini saqlab turish uchun state ---
  const [savedDevInfo, setSavedDevInfo] = useState<{
    id: string;
    name: string;
    gameTitle: string;
    actionType: "approve" | "reject" | null;
  } | null>(null);

  // --- Tasdiqlash Modali State ---
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "approve" | "reject" | null;
  }>({
    isOpen: false,
    type: null,
  });

  // --- Notification Modal State ---
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  // --- Toast Message State ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const getSlug = async () => {
      if (params?.slug) {
        const resolvedSlug = await params.slug;
        setSlug(typeof resolvedSlug === "string" ? resolvedSlug : "");
      }
    };
    getSlug();
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const fetchGame = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/games/${slug}`);

        const contentType = res.headers.get("content-type");
        if (
          !res.ok ||
          !contentType ||
          !contentType.includes("application/json")
        ) {
          throw new Error("Oyin malumotlari topilmadi");
        }

        const data = await res.json();
        setGameItem(data);
      } catch (err) {
        console.error("Yuklashda xatolik:", err);
        setGameItem(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!gameItem) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center text-slate-800 dark:text-slate-100 p-6">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-black">Oyin topilmadi</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bunday slug bilan bogliq oyin bazada mavjud emas yoki allaqachon
            korib chiqilgan.
          </p>
          <button
            onClick={() => router.push("/admin/requests")}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Royxatga qaytish
          </button>
        </div>
      </div>
    );
  }

  const langData = gameItem.langData?.[activeLang] || gameItem.langData?.uz;
  const techData = gameItem.techData || {};

  const screenshots =
    langData?.screenshotPreviews && langData.screenshotPreviews.length > 0
      ? langData.screenshotPreviews
      : TEST_SCREENSHOTS;

  const iconSrc =
    langData?.iconPreview ||
    "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?auto=format&fit=crop&w=150&h=150&q=80";

  const openConfirm = (type: "approve" | "reject") => {
    setConfirmModal({ isOpen: true, type });
  };

  const closeConfirm = () => {
    setConfirmModal({ isOpen: false, type: null });
  };

  // 1-QADAM: developerId ichidan haqiqiy ID va ISMNI to'g'ri olish
  // 1-QADAM: developerId ichidan username ni olish
  const handleConfirmAccept = async () => {
    const actionType = confirmModal.type;
    const targetId = (gameItem as any)._id || (gameItem as any).id;

    if (!actionType || !targetId) return;

    // 💥 Populate bo'lgan developerId obyektini olamiz
    const devObj = (gameItem as any).developerId;

    // MongoDB foydalanuvchi ID-si
    const devId = typeof devObj === "object" ? devObj?._id : devObj;

    // 💥 FAQAT USERNAME'NI OLAMIZ:
    const devUsername =
      (typeof devObj === "object" && (devObj?.username || devObj?.name)) ||
      "Dasturchi";

    const title = langData?.title || "Oyin";

    if (!devId) {
      alert("Xatolik: developerId topilmadi!");
      return;
    }

    setSavedDevInfo({
      id: devId.toString(),
      name: devUsername, // 👈 Notification modalining burchagida developerId'dagi USERNAME chiqadi!
      gameTitle: title,
      actionType: actionType,
    });

    closeConfirm();

    try {
      setIsSubmitting(true);

      // Statusni PATCH qilamiz
      const res = await fetch("/api/admin/action-request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId,
          targetType: "games",
          action: actionType,
        }),
      });

      const contentType = res.headers.get("content-type");
      const data =
        contentType && contentType.includes("application/json")
          ? await res.json()
          : null;

      if (!res.ok || !data?.success) {
        throw new Error(
          data?.message || "Request statusini o'zgartirib bo'lmadi.",
        );
      }

      setToastMessage(
        actionType === "approve"
          ? "Oyin muvaffaqiyatli tasdiqlandi!"
          : "Oyin rad etildi!",
      );

      // Status muvaffaqiyatli o'zgargandan keyin
      // yangi dinamik notification modalini ochamiz.
      setIsNotifModalOpen(true);
    } catch (err: any) {
      console.error("Action PATCH xatosi:", err);
      alert("Server bilan boglanishda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2-QADAM: Yangi NotificationModal o'zining /api/notifications API'si orqali yuboradi.
  // Bu sahifa faqat modalni yopadi va requestlar ro'yxatiga qaytadi.
  const handleNotificationSubmit = (_payload: NotificationPayload) => {
    setIsNotifModalOpen(false);
    handleNotifClose();
  };

  // Notification Modal yopilganda (Submit qilinganda yoki Bekor qilinganda)
  const handleNotifClose = () => {
    setIsNotifModalOpen(false);
    setTimeout(() => {
      router.push("/admin/requests");
    }, 500);
  };

  const getInitialValues = (): Partial<Record<Language, MultiLangContent>> => {
    const isApprove = savedDevInfo?.actionType === "approve";
    const gameTitle = savedDevInfo?.gameTitle || langData?.title || "Oyin";

    return {
      uz: {
        title: isApprove ? "Oyin tasdiqlandi" : "Oyin rad etildi",
        message: isApprove
          ? `Siz yuborgan "${gameTitle}" oyini sorovi tasdiqlandi va platformada elon qilindi.`
          : `Afsuski, siz yuborgan "${gameTitle}" oyini sorovi moderatsiyadan otmadi va rad etildi.`,
      },
      ru: {
        title: isApprove ? "Игра одобрена" : "Игра отклонена",
        message: isApprove
          ? `Ваша заявка "${gameTitle}" была успешно рассмотрена и опубликована.`
          : `К сожалению, ваша заявка "${gameTitle}" не прошла модерацию и была отклонена.`,
      },
      en: {
        title: isApprove ? "Game approved" : "Game rejected",
        message: isApprove
          ? `Your submission "${gameTitle}" has been reviewed and published.`
          : `Unfortunately, your submission "${gameTitle}" did not pass moderation and was rejected.`,
      },
      tr: {
        title: isApprove ? "Oyun onaylandı" : "Oyun reddedildi",
        message: isApprove
          ? `Gönderdiğiniz "${gameTitle}" talebiniz incelendi ve yayınlandı.`
          : `Ne yazık ki "${gameTitle}" talebiniz moderasyondan geçemedi ve reddedildi.`,
      },
    };
  };

  return (
    <div className="w-full my-10 min-h-screen p-0 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
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
          href="/admin/requests"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 transition-all duration-150 active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Royxatga qaytish</span>
        </Link>

        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            Sana:{" "}
            {gameItem.createdAt
              ? String(gameItem.createdAt).slice(0, 10)
              : "N/A"}
          </span>
        </div>
      </div>

      {/* Asosiy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Chap blok */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <div className="flex items-start gap-4 min-w-0">
            <img
              src={iconSrc}
              alt="Game Icon"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 dark:border-slate-900 shadow-sm shrink-0"
            />
            <div className="space-y-1 min-w-0 flex-1">
              {langData?.subtitle && (
                <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 break-words">
                  {langData.subtitle}
                </p>
              )}

              <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight break-words">
                {langData?.title || "Nomsiz Oyin"}
              </h1>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {langData?.category && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 flex items-center gap-1 break-all">
                    <Tag className="w-3 h-3 shrink-0" /> {langData.category}
                  </span>
                )}
                {techData.developer && (
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 break-all">
                    <User className="w-3 h-3 shrink-0" /> {techData.developer}
                  </span>
                )}
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
              {screenshots.map((screen: string, index: number) => (
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

          {/* Tarjima Selectori va Tavsiflar */}
          <div className="space-y-5 min-w-0">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-900/40 flex-wrap">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Globe className="w-4 h-4 shrink-0" />
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
              className="space-y-4 min-w-0"
            >
              {langData?.Maindescription && (
                <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl space-y-2 overflow-hidden">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="text-[11px] font-black uppercase tracking-wider">
                      MAIN DESCRIPTION (QISQA MALUMOT)
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-bold leading-relaxed break-all whitespace-pre-line">
                    {langData.Maindescription}
                  </p>
                </div>
              )}

              <div className="p-4 bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl space-y-2 overflow-hidden">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <AlignLeft className="w-4 h-4 shrink-0" />
                  <span className="text-[11px] font-black uppercase tracking-wider">
                    DESCRIPTION (TOLIQ TAVSIF)
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium whitespace-pre-line break-all">
                  {langData?.description ||
                    "Ushbu tilda toliq tavsif kiritilmagan."}
                </p>
              </div>

              {langData?.whatsNew && langData.whatsNew.length > 0 && (
                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-900/40 rounded-2xl space-y-2 overflow-hidden">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    YANGI OZGARISHLAR ({activeLang.toUpperCase()}):
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pl-4 list-disc font-medium break-all">
                    {langData.whatsNew.map((update: string, idx: number) => (
                      <li key={idx}>{update}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </div>

          {/* Tizim talablari (osDetails) */}
          <div className="space-y-4 pt-2 min-w-0">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              TIZIM TALABLARI & FAYLLAR (OS DETAILS)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameItem.osDetails &&
                Object.entries(gameItem.osDetails).map(
                  ([osKey, detail]: [string, any]) => (
                    <div
                      key={osKey}
                      className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-150/40 dark:border-slate-900/40 space-y-4 flex flex-col justify-between min-w-0 overflow-hidden"
                    >
                      <div className="space-y-3 min-w-0">
                        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/40 pb-2">
                          <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400">
                            {osKey}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold">
                            v{techData.version || "1.0.0"}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-[11px] font-semibold text-slate-550 dark:text-slate-400">
                          <div className="flex justify-between gap-2">
                            <span>OS:</span>{" "}
                            <span className="text-slate-800 dark:text-white text-right break-all">
                              {detail.requirements?.os || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span>CPU:</span>{" "}
                            <span className="text-slate-800 dark:text-white text-right break-all">
                              {detail.requirements?.cpu || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span>GPU:</span>{" "}
                            <span className="text-slate-800 dark:text-white text-right break-all">
                              {detail.requirements?.gpu || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span>RAM:</span>{" "}
                            <span className="text-slate-800 dark:text-white text-right break-all">
                              {detail.requirements?.ram || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/40 space-y-2 min-w-0">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 min-w-0">
                          <span
                            className="font-mono break-all line-clamp-1"
                            title={detail.fileName}
                          >
                            Fayl: {detail.fileName || "Nomalum"}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleGameDownload(
                              detail.fileName,
                              gameItem.priceType === "paid",
                              true,
                            )
                          }
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-black rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-slate-950 transition-all duration-150 active:scale-95 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Faylni yuklab olish</span>
                        </button>
                      </div>
                    </div>
                  ),
                )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-20 h-fit self-start min-w-0">
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
              <h3 className="text-xs font-black uppercase tracking-wider">
                TEXNIK MALUMOTLAR
              </h3>
            </div>

            <div className="space-y-3 text-xs font-semibold text-slate-500 dark:text-slate-400 min-w-0">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60 gap-2">
                <span className="shrink-0">Platforma:</span>
                <span className="flex items-center gap-2 text-slate-800 dark:text-white uppercase font-bold text-[11px] shrink-0">
                  {gameItem.platform === "both" && (
                    <>
                      <span className="flex items-center gap-1">
                        <Laptop className="w-3.5 h-3.5 text-indigo-500" /> PC
                      </span>
                      <span>|</span>
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

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60 gap-2">
                <span className="shrink-0">Versiya:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white break-all text-right">
                  {techData.version || "1.0.0"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60 gap-2">
                <span className="shrink-0">Chiqarilgan sana:</span>
                <span className="text-slate-800 dark:text-white text-right break-all">
                  {techData.releaseDate || "N/A"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60 gap-2">
                <span className="shrink-0">Narx turi:</span>
                <span className="font-bold uppercase text-slate-800 dark:text-white text-[10px] break-all text-right">
                  {gameItem.priceType} ({gameItem.price})
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60 gap-2">
                <span className="shrink-0">Yuklab olish hajmi:</span>
                <span className="text-slate-800 dark:text-white font-mono break-all text-right">
                  {techData.downloadSize || "N/A"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60 gap-2">
                <span className="shrink-0">Oyin ichi hajmi:</span>
                <span className="text-slate-800 dark:text-white font-mono break-all text-right">
                  {techData.inGameSize || "N/A"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60 gap-2">
                <span className="shrink-0">Mavjud tillar soni:</span>
                <span className="text-slate-800 dark:text-white font-mono break-all text-right">
                  {langData?.availableLanguagesCount || "4"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60 gap-2">
                <span className="shrink-0">Holati (Visibility):</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                    gameItem.visibility === "public"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : gameItem.request === "approved"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-rose-500/10 text-rose-500"
                  }`}
                >
                  {gameItem.visibility}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 py-1 min-w-0">
                <span>Slug:</span>
                <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-950 p-2.5 rounded-lg break-all border border-slate-200 dark:border-slate-800 block">
                  {gameItem.slug}
                </span>
              </div>
            </div>

            {/* Boshqaruv tugmalari */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <button
                disabled={isSubmitting}
                onClick={() => openConfirm("reject")}
                className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-black rounded-xl text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition-all duration-150 active:scale-95 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Rad etish
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => openConfirm("approve")}
                className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-black rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-150 active:scale-95 shadow-md shadow-indigo-600/10 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
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
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[280px] break-all">
                    {confirmModal.type === "approve"
                      ? `"${langData?.title || "Oyin"}" sorovini tasdiqlamoqchimisiz?`
                      : `"${langData?.title || "Oyin"}" sorovini rad etmoqchimisiz?`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full pt-2">
                  <button
                    disabled={isSubmitting}
                    onClick={closeConfirm}
                    className="py-2 text-xs font-black rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-150 active:scale-95 disabled:opacity-50"
                  >
                    Bekor qilish
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={handleConfirmAccept}
                    className={`py-2 text-xs font-black rounded-xl text-white transition-all duration-150 active:scale-95 flex items-center justify-center gap-1.5 ${
                      confirmModal.type === "approve"
                        ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/10"
                        : "bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/10"
                    } disabled:opacity-50`}
                  >
                    {isSubmitting && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    )}
                    Ha, davom etish
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification Modal (Ixtiyoriy yuboriladi yoki yopiladi) */}
      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={handleNotifClose}
        onSubmit={handleNotificationSubmit}
        isPublic={false}
        targetUser={{
          id: savedDevInfo?.id || "",
          name: savedDevInfo?.name || "Dasturchi",
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
          transition: opacity 0.2s ease;
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

        .custom-swiper .swiper-button-next::after,
        .custom-swiper .swiper-button-prev::after {
          font-size: 11px !important;
          font-weight: 900 !important;
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
