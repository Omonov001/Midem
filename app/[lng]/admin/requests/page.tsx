/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Link from "next/link";
import {
  Check,
  X,
  Eye,
  Calendar,
  Sparkles,
  Gamepad2,
  Newspaper,
  Layers,
  Laptop,
  Smartphone,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import NotificationModal, {
  NotificationPayload,
  MultiLangContent,
  Language,
} from "@/components/modals/notification-modal";

type TabType = "all" | "news" | "games";

interface SelectedRequestItem {
  id: string;
  title: string;
  type: "news" | "games";
  actionType: "approve" | "reject";
  developerId: string;
  developerUsername: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
};

export default function NewsRequests() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [newsRequests, setNewsRequests] = useState<any[]>([]);
  const [gameRequests, setGameRequests] = useState<any[]>([]);

  // =========================================================
  // FETCH REQUESTS
  // =========================================================

  const fetchRequests = async () => {
    try {
      setIsLoading(true);

      const res = await fetch("/api/admin/requests");

      if (!res.ok) {
        throw new Error("Requests API error");
      }

      const data = await res.json();

      if (data.success) {
        setGameRequests(data.games || []);
        setNewsRequests(data.news || []);
      }
    } catch (error) {
      console.error("Sorovlarni yuklashda xatolik:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRequests();
  }, []);

  // =========================================================
  // CONFIRM MODAL
  // =========================================================

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    item: SelectedRequestItem | null;
  }>({
    isOpen: false,
    item: null,
  });

  // =========================================================
  // NOTIFICATION MODAL
  // =========================================================

  const [notifState, setNotifState] = useState<{
    isOpen: boolean;
    item: SelectedRequestItem | null;
  }>({
    isOpen: false,
    item: null,
  });

  // =========================================================
  // FORMAT REQUESTS
  // =========================================================

  const combinedRequests = useMemo(() => {
    const formattedNews = newsRequests.map((item) => {
      const devObj = item.userId || item.developerId || item.authorId;

      const devId =
        typeof devObj === "object" ? devObj?._id : devObj || item._id;

      const devUsername =
        typeof devObj === "object"
          ? devObj?.username || devObj?.name || "Foydalanuvchi"
          : "Foydalanuvchi";

      return {
        id: item._id || item.id,
        slug: item.slug,

        title: item.translations?.uz?.title || "Sarlavhasiz",

        subtitle: item.gameTitle || "Mustaqil yangilik",

        content: item.translations?.uz?.content || "",

        type: "news" as const,

        createdAt: item.createdAt || new Date().toISOString(),

        badge: "Yangilik",

        icon: (
          <Newspaper className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        ),

        bgIcon: "bg-indigo-50 dark:bg-indigo-950/40",

        detailUrl: `/admin/requests/new/${item.slug}`,

        developerId: devId?.toString() || "",

        developerUsername: devUsername,
      };
    });

    const formattedGames = gameRequests.map((game) => {
      const devObj = game.developerId || game.userId;

      const devId =
        typeof devObj === "object" ? devObj?._id : devObj || game._id;

      const devUsername =
        typeof devObj === "object"
          ? devObj?.username || devObj?.name || "Dasturchi"
          : "Dasturchi";

      return {
        id: game._id || game.id,
        slug: game.slug,

        title:
          game.langData?.uz?.title || game.langData?.en?.title || "Nomsiz Oyin",

        subtitle: `@${devUsername}`,

        content:
          game.langData?.uz?.Maindescription ||
          game.langData?.uz?.description ||
          "",

        type: "games" as const,

        createdAt: game.createdAt || new Date().toISOString(),

        badge: game.langData?.uz?.category || "Oyin",

        icon: (
          <Gamepad2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        ),

        bgIcon: "bg-emerald-50 dark:bg-emerald-950/40",

        detailUrl: `/admin/requests/game/${game.slug}`,

        platform: game.platform,

        price: game.priceType === "free" ? "Bepul" : game.price,

        developerId: devId?.toString() || "",

        developerUsername: devUsername,
      };
    });

    return [...formattedNews, ...formattedGames].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [newsRequests, gameRequests]);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredRequests = useMemo(() => {
    if (activeTab === "all") {
      return combinedRequests;
    }

    return combinedRequests.filter((item) => item.type === activeTab);
  }, [combinedRequests, activeTab]);

  // =========================================================
  // OPEN CONFIRM
  // =========================================================

  const openConfirm = (
    id: string,
    title: string,
    type: "news" | "games",
    actionType: "approve" | "reject",
    developerId: string,
    developerUsername: string,
  ) => {
    setConfirmModal({
      isOpen: true,
      item: {
        id,
        title,
        type,
        actionType,
        developerId,
        developerUsername,
      },
    });
  };

  const closeConfirm = () => {
    setConfirmModal({
      isOpen: false,
      item: null,
    });
  };

  // =========================================================
  // APPROVE / REJECT
  // =========================================================

  const handleConfirmAccept = async () => {
    const selectedItem = confirmModal.item;

    if (!selectedItem) return;

    closeConfirm();

    try {
      const res = await fetch("/api/admin/action-request", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetId: selectedItem.id,

          targetType: selectedItem.type,

          action: selectedItem.actionType,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Remove request from UI
        if (selectedItem.type === "news") {
          setNewsRequests((prev) =>
            prev.filter((i) => (i._id || i.id) !== selectedItem.id),
          );
        } else {
          setGameRequests((prev) =>
            prev.filter((i) => (i._id || i.id) !== selectedItem.id),
          );
        }

        // ===================================================
        // OPEN NEW DYNAMIC NOTIFICATION MODAL
        // ===================================================

        setNotifState({
          isOpen: true,
          item: selectedItem,
        });
      } else {
        alert(data.message || "Xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Action error:", error);

      alert("Server bilan boglanishda xatolik!");
    }
  };

  // =========================================================
  // CLOSE NOTIFICATION MODAL
  // =========================================================

  const handleCloseNotifModal = () => {
    setNotifState({
      isOpen: false,
      item: null,
    });
  };

  // =========================================================
  // NOTIFICATION SUBMIT
  // =========================================================
  //
  // MUHIM:
  // NotificationModal yangi system orqali
  // /api/notifications ga yuboradi.
  //
  // Bu callback faqat parent state'ni yopadi.
  //
  // Eski /api/admin/send-notification
  // BU YERDA ISHLATILMAYDI.
  // =========================================================

  const handleNotificationSubmit = (_payload: NotificationPayload) => {
    handleCloseNotifModal();
  };

  // =========================================================
  // DYNAMIC INITIAL VALUES
  // =========================================================

  const getInitialValues = (): Partial<Record<Language, MultiLangContent>> => {
    const activeItem = notifState.item;

    if (!activeItem) {
      return {};
    }

    const isApprove = activeItem.actionType === "approve";

    const isNews = activeItem.type === "news";

    const subjectName = isNews ? "yangiligingiz" : "oyiningiz";

    return {
      uz: {
        title: isApprove
          ? `${isNews ? "Yangilik" : "Oyin"} tasdiqlandi`
          : `${isNews ? "Yangilik" : "Oyin"} rad etildi`,

        message: isApprove
          ? `Siz yuborgan "${activeItem.title}" ${subjectName} sorovi tasdiqlandi va platformada elon qilindi.`
          : `Afsuski, siz yuborgan "${activeItem.title}" ${subjectName} sorovi moderatsiyadan otmadi va rad etildi.`,
      },

      ru: {
        title: isApprove
          ? `${isNews ? "Новость" : "Игра"} одобрена`
          : `${isNews ? "Новость" : "Игра"} отклонена`,

        message: isApprove
          ? `Ваша заявка "${activeItem.title}" была успешно рассмотрена и опубликована.`
          : `К сожалению, ваша заявка "${activeItem.title}" не прошла модерацию и была отклонена.`,
      },

      en: {
        title: isApprove
          ? `${isNews ? "News" : "Game"} approved`
          : `${isNews ? "News" : "Game"} rejected`,

        message: isApprove
          ? `Your submission "${activeItem.title}" has been reviewed and published.`
          : `Unfortunately, your submission "${activeItem.title}" did not pass moderation and was rejected.`,
      },

      tr: {
        title: isApprove
          ? `${isNews ? "Haber" : "Oyun"} onaylandı`
          : `${isNews ? "Haber" : "Oyun"} reddedildi`,

        message: isApprove
          ? `Gönderdiğiniz "${activeItem.title}" talebiniz incelendi ve yayınlandı.`
          : `Ne yazık ki "${activeItem.title}" talebiniz moderasyondan geçemedi ve reddedildi.`,
      },
    };
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="w-full my-14 min-h-screen p-0 text-slate-800 dark:text-slate-100 transition-colors duration-200 overflow-hidden">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Kelib Tushgan Sorovlar
            </h2>

            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
          </div>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Adminlar tasdiqlashi uchun yuborilgan yangiliklar va oyinlar
            royxati.
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl w-fit mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-lg uppercase tracking-wider transition-all duration-150 ${
            activeTab === "all"
              ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Barchasi</span>
        </button>

        <button
          onClick={() => setActiveTab("news")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-lg uppercase tracking-wider transition-all duration-150 ${
            activeTab === "news"
              ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Newspaper className="w-3.5 h-3.5" />
          <span>Yangiliklar</span>
        </button>

        <button
          onClick={() => setActiveTab("games")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-lg uppercase tracking-wider transition-all duration-150 ${
            activeTab === "games"
              ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Oyinlar</span>
        </button>
      </div>

      {/* REQUEST CARDS */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />

          <p className="text-xs font-bold">Sorovlar yuklanmoqda...</p>
        </div>
      ) : (
        <motion.div
          key={activeTab}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((item) => (
                <motion.div
                  key={`${item.type}-${item.id}`}
                  variants={cardVariants}
                  layout="position"
                  exit="exit"
                  className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900/40 hover:bg-slate-100/60 dark:hover:bg-slate-900/80 transition-all duration-200 border border-slate-100/80 dark:border-slate-900/40"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${item.bgIcon}`}>
                          {item.icon}
                        </div>

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-black rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.badge}
                        </span>

                        {item.type === "games" && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1">
                            {item.platform === "pc" ||
                            item.platform === "both" ? (
                              <Laptop className="w-3 h-3" />
                            ) : null}

                            {item.platform === "mobile" ||
                            item.platform === "both" ? (
                              <Smartphone className="w-3 h-3" />
                            ) : null}

                            <span className="uppercase">{item.platform}</span>
                          </span>
                        )}
                      </div>

                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.createdAt.slice(0, 10)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                        {item.title}
                      </h3>

                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                        {item.subtitle}{" "}
                        {item.type === "games" && `• ${item.price}`}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {item.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-900/40">
                    <Link
                      href={item.detailUrl}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 transition-all duration-150 active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Batafsil
                    </Link>

                    <div className="flex items-center gap-2">
                      {/* REJECT */}
                      <button
                        onClick={() =>
                          openConfirm(
                            item.id,
                            item.title,
                            item.type,
                            "reject",
                            item.developerId,
                            item.developerUsername,
                          )
                        }
                        className="p-1.5 sm:p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-all duration-150 active:scale-95"
                        title="Rad etish"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* APPROVE */}
                      <button
                        onClick={() =>
                          openConfirm(
                            item.id,
                            item.title,
                            item.type,
                            "approve",
                            item.developerId,
                            item.developerUsername,
                          )
                        }
                        className="p-1.5 sm:p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl transition-all duration-150 active:scale-95"
                        title="Tasdiqlash"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-1 xl:col-span-2 py-12 text-center text-xs text-slate-400 dark:text-slate-500 font-bold">
                Bu bolimda hech qanday sorovlar qolmadi.
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* =====================================================
          CONFIRM MODAL
      ===================================================== */}

      <AnimatePresence>
        {confirmModal.isOpen && confirmModal.item && (
          <div className="fixed inset-0 z-[99990] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeConfirm}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-[4px]"
            />

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 16,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 16,
              }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              className="relative w-full max-w-sm rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div
                  className={`p-3 rounded-full ${
                    confirmModal.item.actionType === "approve"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-rose-500/10 text-rose-500"
                  }`}
                >
                  {confirmModal.item.actionType === "approve" ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <AlertTriangle className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-wider">
                    {confirmModal.item.actionType === "approve"
                      ? "Tasdiqlaysizmi?"
                      : "Rad etasizmi?"}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[280px]">
                    {confirmModal.item.actionType === "approve"
                      ? `"${confirmModal.item.title}" sorovini tasdiqlashni va bildirishnoma modalini ochishni xohlaysizmi?`
                      : `"${confirmModal.item.title}" sorovini rad etishni xohlaysizmi?`}
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
                      confirmModal.item.actionType === "approve"
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

      {/* =====================================================
          DYNAMIC NOTIFICATION MODAL
      ===================================================== */}

      <NotificationModal
        isOpen={notifState.isOpen}
        onClose={handleCloseNotifModal}
        onSubmit={handleNotificationSubmit}
        isPublic={false}
        targetUser={{
          id: notifState.item?.developerId || "",

          name: notifState.item?.developerUsername || "Dasturchi",
        }}
        initialValues={getInitialValues()}
      />
    </div>
  );
}
