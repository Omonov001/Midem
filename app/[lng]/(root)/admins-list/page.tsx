"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShieldCheck,
  Send,
  CheckCircle2,
  X,
  ChevronDown,
  Mail,
  Crown,
  Code2,
  ShieldAlert,
  MessageSquare,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "developer";
  isOnline: boolean;
  picture?: string;
  username?: string;
  lastSeen?: string;
}

interface RecipientsResponse {
  admins?: AdminUser[];
  recipients?: AdminUser[];
  users?: AdminUser[];
  data?: AdminUser[];
  error?: string;
}

export default function AdminsListPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
  const [adminsError, setAdminsError] = useState<string | null>(null);

  const { user, isLoaded } = useUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);

  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

  const [requestType, setRequestType] = useState<string>("game_suggestion");

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // =========================================================
  // ADMIN / OWNER / DEVELOPER LARINI OLISH
  // =========================================================

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setIsLoadingAdmins(true);
        setAdminsError(null);

        const response = await fetch("/api/messages/recipients", {
          method: "GET",
          cache: "no-store",
        });

        const data: RecipientsResponse | AdminUser[] = await response.json();

        console.log("RECIPIENTS API:", data);

        if (!response.ok) {
          const errorMessage =
            !Array.isArray(data) && data?.error
              ? data.error
              : "Adminlarni olishda xatolik yuz berdi";

          throw new Error(errorMessage);
        }

        let recipients: AdminUser[] = [];

        if (Array.isArray(data)) {
          recipients = data;
        } else if (Array.isArray(data.admins)) {
          recipients = data.admins;
        } else if (Array.isArray(data.recipients)) {
          recipients = data.recipients;
        } else if (Array.isArray(data.users)) {
          recipients = data.users;
        } else if (Array.isArray(data.data)) {
          recipients = data.data;
        }

        setAdmins(recipients);
      } catch (error) {
        console.error("GET /api/messages/recipients xatosi:", error);

        setAdminsError(
          error instanceof Error
            ? error.message
            : "Adminlarni olishda xatolik yuz berdi",
        );

        setAdmins([]);
      } finally {
        setIsLoadingAdmins(false);
      }
    };

    fetchAdmins();
  }, []);

  // =========================================================
  // DROPDOWN OUTSIDE CLICK
  // =========================================================

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =========================================================
  // OPTIONS
  // =========================================================

  const roleOptions = [
    {
      value: "all",
      label: "Barcha Rollar",
    },
    {
      value: "owner",
      label: "OWNER",
    },
    {
      value: "admin",
      label: "ADMIN",
    },
    {
      value: "developer",
      label: "DEVELOPER",
    },
  ];

  const typeOptions = [
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
  // ROLE BADGES
  // =========================================================

  const roleBadgeMap = {
    owner: {
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: Crown,
    },

    admin: {
      color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      icon: ShieldAlert,
    },

    developer: {
      color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      icon: Code2,
    },
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredAdmins = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return admins.filter((admin) => {
      const matchesSearch =
        !query ||
        admin.name.toLowerCase().includes(query) ||
        admin.email.toLowerCase().includes(query) ||
        admin.username?.toLowerCase().includes(query);

      const matchesRole = selectedRole === "all" || admin.role === selectedRole;

      return matchesSearch && matchesRole;
    });
  }, [admins, searchQuery, selectedRole]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const onlineCount = admins.filter((admin) => admin.isOnline).length;

  // =========================================================
  // OPEN MODAL
  // =========================================================

  const openMessageModal = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setRequestType("game_suggestion");
    setSubject("");
    setMessage("");
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeMessageModal = () => {
    if (isSubmitting) return;

    setSelectedAdmin(null);
    setSubject("");
    setMessage("");
    setRequestType("game_suggestion");
  };

  // =========================================================
  // SEND REQUEST
  // =========================================================
  // BUGUNCHA FAQAT UI TEST.
  // KEYINGI BOSQICHDA POST /api/messages ULaymiz.
  // =========================================================

  const handleSendRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedAdmin) return;

    if (!isLoaded || !user) {
      setToastMessage("Foydalanuvchi aniqlanmadi.");

      setTimeout(() => {
        setToastMessage(null);
      }, 3000);

      return;
    }

    if (!subject.trim() || !message.trim()) {
      setToastMessage("Mavzu va xabarni to'ldiring.");

      setTimeout(() => {
        setToastMessage(null);
      }, 3000);

      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: selectedAdmin.id,
          requestType,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Xabar yuborishda xatolik yuz berdi");
      }

      console.log("MESSAGE SENT:", data);

      setToastMessage(`${selectedAdmin.name} ga so'rovingiz yuborildi!`);

      setSelectedAdmin(null);
      setSubject("");
      setMessage("");
      setRequestType("game_suggestion");

      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    } catch (error) {
      console.error("POST /api/messages xatosi:", error);

      setToastMessage(
        error instanceof Error
          ? error.message
          : "Xabar yuborishda xatolik yuz berdi.",
      );

      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="w-full my-15 p-10">
      {/* =====================================================
          TOAST
      ====================================================== */}

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
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 dark:border-slate-200 font-bold text-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />

            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          MAIN CONTAINER
      ====================================================== */}

      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xl flex flex-col gap-5 overflow-hidden">
        {/* ===================================================
            HEADER
        ==================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-2xl shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-950 dark:text-white uppercase">
                Loyiha Mamurlari
              </h1>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Savol va takliflar boyicha tegishli adminlar bilan boglaning
              </p>
            </div>
          </div>

          {/* STATISTICS */}

          <div className="flex items-center gap-2 text-[11px] font-bold bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800 self-start sm:self-auto">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white shadow-sm">
              Jami: {admins.length}
            </span>

            <span className="px-2.5 py-1 text-emerald-600 dark:text-emerald-400">
              Online: {onlineCount}
            </span>
          </div>
        </div>

        {/* ===================================================
            SEARCH & FILTER
        ==================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* SEARCH */}

          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="text"
              placeholder="Ism yoki email boyicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 focus:border-indigo-500 outline-none text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          {/* ROLE DROPDOWN */}

          <div className="relative" ref={roleRef}>
            <button
              type="button"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            >
              <span>
                {roleOptions.find((opt) => opt.value === selectedRole)?.label}
              </span>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  roleDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {roleDropdownOpen && (
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
                  className="absolute left-0 right-0 mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden py-1"
                >
                  {roleOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSelectedRole(option.value);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors ${
                        selectedRole === option.value
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

        {/* ===================================================
            LIST
        ==================================================== */}

        <div className="max-h-[420px] overflow-y-auto pr-1 sm:pr-2 [scrollbar-width:thin] [scrollbar-color:#a5b4fc_transparent] dark:[scrollbar-color:#312e81_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-indigo-300/60 dark:[&::-webkit-scrollbar-thumb]:bg-indigo-900/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-indigo-500">
          {/* LOADING */}

          {isLoadingAdmins ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-3" />

              <p className="text-xs font-bold text-slate-400">
                Mamurlar yuklanmoqda...
              </p>
            </div>
          ) : adminsError ? (
            /* ERROR */

            <div className="flex flex-col items-center justify-center text-center py-16">
              <ShieldCheck className="w-10 h-10 text-red-300 dark:text-red-900 mb-2" />

              <h3 className="text-xs font-bold text-red-500">
                Malumotlarni yuklashda xatolik
              </h3>

              <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                {adminsError}
              </p>
            </div>
          ) : filteredAdmins.length > 0 ? (
            /* ADMIN LIST */

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredAdmins.map((admin) => {
                const roleBadge = roleBadgeMap[admin.role];

                const RoleIcon = roleBadge.icon;

                return (
                  <div
                    key={admin.id}
                    className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-3.5 sm:p-4 hover:border-indigo-500/40 transition-all flex flex-col justify-between gap-3 overflow-hidden"
                  >
                    {/* USER INFO */}

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* AVATAR */}

                        <div className="relative shrink-0">
                          {admin.picture ? (
                            <img
                              src={admin.picture}
                              alt={admin.name}
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-inner">
                              {admin.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                          )}

                          {/* ONLINE */}

                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-slate-50 dark:border-slate-950 ${
                              admin.isOnline ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                        </div>

                        {/* NAME + EMAIL */}

                        <div className="space-y-0.5 min-w-0">
                          <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {admin.name}
                          </h3>

                          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium truncate">
                            <Mail className="w-3 h-3 shrink-0" />

                            <span className="truncate">{admin.email}</span>
                          </p>
                        </div>
                      </div>

                      {/* ROLE */}

                      <div
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black rounded-lg border uppercase tracking-wider shrink-0 ${roleBadge.color}`}
                      >
                        <RoleIcon className="w-3 h-3" />

                        <span>{admin.role}</span>
                      </div>
                    </div>

                    {/* FOOTER */}

                    <div className="pt-2.5 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-slate-400 truncate">
                        ID: {admin.id}
                      </span>

                      <button
                        type="button"
                        onClick={() => openMessageModal(admin)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] sm:text-[11px] font-black rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all active:scale-95 shadow-sm shrink-0"
                      >
                        <Send className="w-3 h-3" />
                        Sorov Yuborish
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* EMPTY */

            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShieldCheck className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />

              <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Siz qidirgan mamur topilmadi
              </h3>

              <p className="text-[10px] text-slate-400 mt-1">
                Qidiruv yoki rol filtrini ozgartirib koring.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          MESSAGE MODAL
      ====================================================== */}

      <AnimatePresence>
        {selectedAdmin && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* BACKDROP */}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMessageModal}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* MODAL */}

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 10,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 10,
              }}
              className="relative w-full max-w-lg rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              {/* MODAL HEADER */}

              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />

                  <div>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white">
                      Murojaat yuborish
                    </h2>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Qabul qiluvchi:{" "}
                      <span className="font-bold text-indigo-500">
                        {selectedAdmin.name} ({selectedAdmin.role.toUpperCase()}
                        )
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeMessageModal}
                  disabled={isSubmitting}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* FORM */}

              <form onSubmit={handleSendRequest} className="space-y-3">
                {/* REQUEST TYPE */}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Sorov Turi
                  </label>

                  <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none text-slate-800 dark:text-white"
                  >
                    {typeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SUBJECT */}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Mavzu
                  </label>

                  <input
                    type="text"
                    required
                    maxLength={150}
                    placeholder="Murojaat mazmunini qisqacha yozing..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>

                {/* MESSAGE */}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Batafsil Xabar
                  </label>

                  <textarea
                    required
                    rows={4}
                    maxLength={5000}
                    placeholder="Barcha tafsilotlarni yozib qoldiring..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-white placeholder-slate-400 resize-none"
                  />
                </div>

                {/* BUTTONS */}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={closeMessageModal}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    Bekor qilish
                  </button>

                  <button
                    type="submit"
                    disabled={
                      isSubmitting || !subject.trim() || !message.trim()
                    }
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-black rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-3.5 h-3.5" />

                    {isSubmitting ? "Yuborilmoqda..." : "Yuborish"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
