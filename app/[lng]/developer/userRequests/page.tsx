"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MessageSquare,
  AlertCircle,
  Clock,
  X,
  Bell,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Trash2,
} from "lucide-react";

import NotificationModal, {
  NotificationPayload,
} from "@/components/modals/notification-modal";

// =========================================================
// TYPES
// =========================================================

type MessageRequestType =
  | "game_suggestion"
  | "bug_report"
  | "partnership"
  | "other";

interface MessageUser {
  _id: string;
  name: string;
  email: string;
  picture?: string;
  role: "user" | "admin" | "owner" | "developer";
  username?: string;
}

interface MessageItem {
  id: string;
  sender: MessageUser | null;
  receiver: MessageUser | null;
  requestType: MessageRequestType;
  subject: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

interface MessagesResponse {
  success?: boolean;
  data?: MessageItem[];
  error?: string;
}

interface DeleteConfirmState {
  isOpen: boolean;
  id?: string;
  name?: string;
}

// =========================================================
// PAGE
// =========================================================

export default function UserRequestsPage() {
  const { user, isLoaded } = useUser();

  // =======================================================
  // REAL MESSAGES
  // =======================================================

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // =======================================================
  // FILTERS
  // =======================================================

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);

  const typeRef = useRef<HTMLDivElement>(null);

  // =======================================================
  // SELECTED MESSAGE
  // =======================================================

  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(
    null,
  );

  // =======================================================
  // DELETE UI
  // =======================================================

  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    isOpen: false,
  });

  const [isDeleting, setIsDeleting] = useState(false);

  // =======================================================
  // NOTIFICATION
  // =======================================================

  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  const [notifTargetUser, setNotifTargetUser] = useState<{
    id: number | string;
    name: string;
  } | null>(null);

  const [isSendingNotification, setIsSendingNotification] = useState(false);

  // =======================================================
  // TOAST
  // =======================================================

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);

    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // =========================================================
  // TYPE MAP
  // =========================================================

  const typeMap: Record<
    MessageRequestType,
    {
      label: string;
      color: string;
    }
  > = {
    game_suggestion: {
      label: "Oyin Taklifi",
      color: "bg-indigo-500/10 text-indigo-500",
    },

    bug_report: {
      label: "Xatolik (Bug)",
      color: "bg-rose-500/10 text-rose-500",
    },

    partnership: {
      label: "Hamkorlik",
      color: "bg-amber-500/10 text-amber-500",
    },

    other: {
      label: "Boshqa",
      color: "bg-slate-500/10 text-slate-500",
    },
  };

  // =========================================================
  // TYPE OPTIONS
  // =========================================================

  const typeOptions = [
    {
      value: "all",
      label: "Barchasi (Turi)",
    },
    {
      value: "game_suggestion",
      label: "Oyin Taklifi",
    },
    {
      value: "bug_report",
      label: "Xatolik (Bug)",
    },
    {
      value: "partnership",
      label: "Hamkorlik",
    },
    {
      value: "other",
      label: "Boshqa",
    },
  ];

  // =========================================================
  // FETCH REAL MESSAGES
  // =========================================================

  const fetchMessages = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await fetch(
        `/api/messages?userId=${encodeURIComponent(user.id)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data: MessagesResponse = await response.json();

      console.log("MESSAGES API:", data);

      if (!response.ok) {
        throw new Error(data.error || "Xabarlarni olishda xatolik yuz berdi");
      }

      setMessages(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("GET /api/messages xatosi:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Xabarlarni olishda xatolik yuz berdi",
      );

      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // LOAD MESSAGES
  // =========================================================

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      setErrorMessage("Foydalanuvchi aniqlanmadi.");
      return;
    }

    fetchMessages();
  }, [isLoaded, user?.id]);

  // =========================================================
  // CLOSE DROPDOWN OUTSIDE
  // =========================================================

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setTypeDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =========================================================
  // SEARCH + FILTER
  // =========================================================

  const filteredMessages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return messages.filter((msg) => {
      const senderName = msg.sender?.name?.toLowerCase() || "";
      const senderEmail = msg.sender?.email?.toLowerCase() || "";
      const subject = msg.subject?.toLowerCase() || "";
      const content = msg.message?.toLowerCase() || "";
      const id = msg.id?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        senderName.includes(query) ||
        senderEmail.includes(query) ||
        subject.includes(query) ||
        content.includes(query) ||
        id.includes(query);

      const matchesType =
        selectedType === "all" || msg.requestType === selectedType;

      return matchesSearch && matchesType;
    });
  }, [messages, searchQuery, selectedType]);

  // =========================================================
  // OPEN MESSAGE
  // =========================================================

  const handleOpenMessage = (message: MessageItem) => {
    setSelectedMessage(message);
  };

  // =========================================================
  // OPEN NOTIFICATION
  // =========================================================

  const handleOpenNotificationModal = (
    userId: string,
    userName: string,
    e?: React.MouseEvent,
  ) => {
    if (e) {
      e.stopPropagation();
    }

    if (!userId) {
      showToast("Foydalanuvchi ID topilmadi.");
      return;
    }

    setNotifTargetUser({
      id: userId,
      name: userName,
    });

    setIsNotifModalOpen(true);
  };

  // =========================================================
  // REAL NOTIFICATION SUBMIT
  // =========================================================

  const handleNotificationSubmit = (payload: NotificationPayload) => {
    console.log("Notification yuborildi:", payload);

    const recipient =
      payload.recipientType === "public"
        ? "Hammaga"
        : payload.recipientName
          ? `${payload.recipientName} ga`
          : "Foydalanuvchiga";

    setIsNotifModalOpen(false);
    setNotifTargetUser(null);

    setToastMessage(`${recipient} notification muvaffaqiyatli yuborildi!`);

    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // =========================================================
  // DELETE UI
  // =========================================================

  const triggerDeleteSingle = (
    id: string,
    name: string,
    e?: React.MouseEvent,
  ) => {
    if (e) {
      e.stopPropagation();
    }

    setDeleteConfirm({
      isOpen: true,
      id,
      name,
    });
  };

  // =========================================================
  // DELETE CONFIRM
  // =========================================================

  const handleConfirmDelete = async () => {
    const messageId = deleteConfirm.id;

    if (!messageId) {
      setDeleteConfirm({
        isOpen: false,
      });

      showToast("Message ID topilmadi.");
      return;
    }

    if (!user?.id) {
      setDeleteConfirm({
        isOpen: false,
      });

      showToast("Foydalanuvchi aniqlanmadi.");
      return;
    }

    try {
      setIsDeleting(true);

      const response = await fetch(
        `/api/messages?id=${encodeURIComponent(
          messageId,
        )}&userId=${encodeURIComponent(user.id)}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      console.log("DELETE MESSAGE API:", data);

      if (!response.ok) {
        throw new Error(data.error || "Message ochirishda xatolik yuz berdi");
      }

      setMessages((prevMessages) =>
        prevMessages.filter((message) => message.id !== messageId),
      );

      setSelectedMessage((currentSelectedMessage) => {
        if (currentSelectedMessage?.id === messageId) {
          return null;
        }

        return currentSelectedMessage;
      });

      setDeleteConfirm({
        isOpen: false,
      });

      showToast("Message muvaffaqiyatli ochirildi.");
    } catch (error) {
      console.error("DELETE /api/messages xatosi:", error);

      setDeleteConfirm({
        isOpen: false,
      });

      showToast(
        error instanceof Error
          ? error.message
          : "Message ochirishda xatolik yuz berdi",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // =========================================================
  // ANIMATIONS
  // =========================================================

  const containerVariants = {
    hidden: {
      opacity: 0,
    },

    show: {
      opacity: 1,

      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 15,
    },

    show: {
      opacity: 1,
      y: 0,

      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (!isLoaded) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />

          <p className="text-xs font-bold text-slate-400">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="w-full min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-200 py-16">
      {/* TOAST */}

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{
              opacity: 0,
              y: -50,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -20,
              scale: 0.9,
            }}
            transition={{
              duration: 0.25,
            }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 dark:border-slate-200 font-bold text-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />

            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER + FILTERS */}

      <motion.div
        initial={{
          opacity: 0,
          y: -10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        className="sticky top-[100px] z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md py-4 border-b border-slate-100 dark:border-slate-900/40 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-500" />

            <h1 className="text-lg font-black tracking-tight text-slate-950 dark:text-white uppercase">
              Foydalanuvchilar Sorovlari
            </h1>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center gap-2 text-[11px] font-bold bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-xl border border-slate-200/10">
              <span className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white shadow-sm">
                Jami: {messages.length}
              </span>
            </div>

            <button
              type="button"
              onClick={fetchMessages}
              className="px-3 py-1.5 text-[11px] font-black rounded-xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-600 hover:text-white transition-all"
            >
              Yangilash
            </button>
          </div>
        </div>

        {/* FILTERS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {/* SEARCH */}

          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />

            <input
              type="text"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-transparent focus:border-indigo-500/30 outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          {/* TYPE */}

          <div className="relative" ref={typeRef}>
            <button
              type="button"
              onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-900/80 transition-colors"
            >
              <span>
                {typeOptions.find((opt) => opt.value === selectedType)?.label}
              </span>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  typeDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {typeDropdownOpen && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: 5,
                  }}
                  transition={{
                    duration: 0.15,
                  }}
                  className="absolute left-0 right-0 mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden py-1"
                >
                  {typeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSelectedType(option.value);
                        setTypeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedType === option.value
                          ? "bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* MESSAGE LIST */}

      <div className="mt-4 bg-white dark:bg-slate-900/20 rounded-2xl border border-slate-100 dark:border-slate-900/60 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="w-full py-16 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-3" />

            <p className="text-xs font-bold text-slate-400">
              Xabarlar yuklanmoqda...
            </p>
          </div>
        ) : errorMessage ? (
          <div className="w-full py-16 flex flex-col items-center justify-center text-center p-6">
            <AlertCircle className="w-8 h-8 text-rose-400 mb-2" />

            <h3 className="text-sm font-bold text-rose-500">
              Xabarlarni yuklashda xatolik
            </h3>

            <p className="text-xs text-slate-400 mt-1">{errorMessage}</p>

            <button
              type="button"
              onClick={fetchMessages}
              className="mt-4 px-4 py-2 text-xs font-black rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
            >
              Qayta urinish
            </button>
          </div>
        ) : filteredMessages.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="divide-y divide-slate-100 dark:divide-slate-900/40"
          >
            {filteredMessages.map((msg) => {
              const currentType = typeMap[msg.requestType];

              const senderName = msg.sender?.name || "Nomalum foydalanuvchi";

              return (
                <motion.div
                  key={
                    msg.id ||
                    `${msg.sender?._id || "unknown"}-${msg.createdAt}-${msg.subject}`
                  }
                  variants={itemVariants}
                  onClick={() => handleOpenMessage(msg)}
                  className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/60 transition-all cursor-pointer"
                >
                  {/* USER + SUBJECT */}

                  <div className="flex items-start gap-3 max-w-2xl min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center font-black text-sm flex-shrink-0 overflow-hidden">
                      {msg.sender?.picture ? (
                        <img
                          src={msg.sender.picture}
                          alt={senderName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        senderName.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                          {msg.id}
                        </span>

                        <h3 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                          {senderName}
                        </h3>
                      </div>

                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-1">
                        {msg.subject}
                      </p>

                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        {msg.message}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT SIDE */}

                  <div className="flex items-center justify-between md:justify-end gap-3 border-t border-dashed border-slate-100 dark:border-slate-900/20 md:border-t-0 pt-2.5 md:pt-0">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black rounded-md uppercase tracking-wide ${currentType.color}`}
                    >
                      {currentType.label}
                    </span>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />

                      {new Date(msg.createdAt).toLocaleDateString("uz-UZ")}
                    </div>

                    {/* NOTIFICATION */}

                    {msg.sender && (
                      <button
                        type="button"
                        onClick={(e) =>
                          handleOpenNotificationModal(
                            msg.sender?._id || "",
                            senderName,
                            e,
                          )
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-500 transition-colors"
                        title="Ogohlantirish yuborish"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* DELETE */}

                    <button
                      type="button"
                      onClick={(e) =>
                        triggerDeleteSingle(msg.id, senderName, e)
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                      title="Message ochirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="w-full py-16 flex flex-col items-center justify-center text-center p-6">
            <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />

            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Hech qanday sorov topilmadi
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Hozircha sizga yuborilgan xabarlar mavjud emas.
            </p>
          </div>
        )}
      </div>

      {/* MESSAGE DETAIL MODAL */}

      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() => setSelectedMessage(null)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{
                opacity: 0,
                y: 10,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 10,
                scale: 0.97,
              }}
              className="relative w-full max-w-xl rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
            >
              {/* HEADER */}

              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black text-slate-900 dark:text-white truncate">
                      {selectedMessage.sender?.name || "Nomalum"}
                    </h2>

                    <span className="text-[9px] font-mono text-slate-400 truncate">
                      {selectedMessage.id}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {selectedMessage.sender?.email || "Email mavjud emas"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* CONTENT */}

              <div className="py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-[9px] font-black rounded uppercase ${
                      typeMap[selectedMessage.requestType].color
                    }`}
                  >
                    {typeMap[selectedMessage.requestType].label}
                  </span>

                  <span className="text-[10px] text-slate-400">
                    {new Date(selectedMessage.createdAt).toLocaleString(
                      "uz-UZ",
                    )}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {selectedMessage.subject}
                </h3>

                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line border-l-2 border-indigo-500/40 pl-3 py-1">
                  {selectedMessage.message}
                </div>

                {/* SENDER INFO */}

                <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
                  <p className="text-[9px] font-black uppercase text-slate-400 mb-2">
                    Yuboruvchi
                  </p>

                  <div className="flex items-center gap-2">
                    {selectedMessage.sender?.picture ? (
                      <img
                        src={selectedMessage.sender.picture}
                        alt={selectedMessage.sender.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                        {(selectedMessage.sender?.name || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">
                        {selectedMessage.sender?.name || "Nomalum"}
                      </p>

                      <p className="text-[10px] text-slate-400">
                        {selectedMessage.sender?.email || "Email mavjud emas"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER */}

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                {selectedMessage.sender && (
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenNotificationModal(
                        selectedMessage.sender?._id || "",
                        selectedMessage.sender?.name || "User",
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-indigo-500 hover:bg-indigo-500/10 transition-colors"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    Ogohlantirish
                  </button>
                )}

                {/* DELETE FROM DETAIL */}

                <button
                  type="button"
                  onClick={(e) =>
                    triggerDeleteSingle(
                      selectedMessage.id,
                      selectedMessage.sender?.name || "Nomalum foydalanuvchi",
                      e,
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Ochirish
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="ml-auto px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Yopish
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM */}

      <AnimatePresence>
        {deleteConfirm.isOpen && (
          <div className="fixed inset-0 z-[99990] flex items-center justify-center p-4">
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() =>
                !isDeleting &&
                setDeleteConfirm({
                  isOpen: false,
                })
              }
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              className="relative w-full max-w-sm rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Message ochirish
                  </h3>

                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Bu amalni ortga qaytarib bolmaydi.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {deleteConfirm.name}
                </span>{" "}
                yuborgan messageni ochirishni tasdiqlaysizmi?
              </p>

              <div className="flex justify-end gap-2 mt-5">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() =>
                    setDeleteConfirm({
                      isOpen: false,
                    })
                  }
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-50"
                >
                  Yopish
                </button>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Ochirilmoqda...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      Ochirish
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =====================================================
          NOTIFICATION MODAL
      ====================================================== */}

      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => {
          setIsNotifModalOpen(false);
          setNotifTargetUser(null);
        }}
        onSubmit={handleNotificationSubmit}
        isPublic={false}
        targetUser={notifTargetUser}
      />
    </div>
  );
}
