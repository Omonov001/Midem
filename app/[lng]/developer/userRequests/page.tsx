"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  X,
  Save,
  Trash2,
  Bell,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { MOCK_USER_REQUESTS, UserRequest } from "@/constants/index";

// Kop tilli NotificationModal componenti va tiplari import qilinadi
import NotificationModal, {
  NotificationPayload,
} from "@/components/modals/notification-modal";

interface DeleteConfirmState {
  isOpen: boolean;
  type: "single" | "all";
  id?: string;
  name?: string;
}

export default function UserRequestsPage() {
  const [requests, setRequests] = useState<UserRequest[]>(MOCK_USER_REQUESTS);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Custom Select dropdownlari holati
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const typeRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(
    null,
  );
  const [editStatus, setEditStatus] =
    useState<UserRequest["status"]>("pending");
  const [editPriority, setEditPriority] =
    useState<UserRequest["priority"]>("medium");

  // --- CONFIRM DELETE MODAL HOLATI ---
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    isOpen: false,
    type: "single",
  });

  // --- NOTIFICATION MODAL HOLATLARI ---
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifTargetUser, setNotifTargetUser] = useState<{
    id: number | string;
    name: string;
  } | null>(null);

  // --- TOAST HOLATI ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tashqariga bosilganda dropdownlarni yopish
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setTypeDropdownOpen(false);
      }
      if (
        statusRef.current &&
        !statusRef.current.contains(event.target as Node)
      ) {
        setStatusDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const typeMap = {
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
    other: { label: "Boshqa", color: "bg-slate-500/10 text-slate-500" },
  };

  const statusMap = {
    pending: {
      label: "Kutilmoqda",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      icon: Clock,
    },
    investigating: {
      label: "Organilmoqda",
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      icon: HelpCircle,
    },
    resolved: {
      label: "Hal qilindi",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      icon: CheckCircle2,
    },
    rejected: {
      label: "Rad etildi",
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      icon: XCircle,
    },
  };

  const priorityMap = {
    low: "bg-emerald-500",
    medium: "bg-amber-500",
    high: "bg-rose-500",
  };

  const handleOpenDialog = (req: UserRequest) => {
    setSelectedRequest(req);
    setEditStatus(req.status);
    setEditPriority(req.priority);
  };

  const handleSaveChanges = () => {
    if (!selectedRequest) return;
    setRequests((prev) =>
      prev.map((item) =>
        item.id === selectedRequest.id
          ? { ...item, status: editStatus, priority: editPriority }
          : item,
      ),
    );
    setSelectedRequest(null);
  };

  // --- OCHIRISH CONFIRM MODALINI OCHISH ---
  const triggerDeleteSingle = (
    id: string,
    name: string,
    e?: React.MouseEvent,
  ) => {
    if (e) e.stopPropagation();
    setDeleteConfirm({
      isOpen: true,
      type: "single",
      id,
      name,
    });
  };

  const triggerDeleteAll = () => {
    setDeleteConfirm({
      isOpen: true,
      type: "all",
    });
  };

  // --- HAQIQIY OCHIRISH AMALI (CONFIRM BOLGANDA) ---
  const handleConfirmDelete = () => {
    if (deleteConfirm.type === "single" && deleteConfirm.id) {
      setRequests((prev) =>
        prev.filter((item) => item.id !== deleteConfirm.id),
      );
      if (selectedRequest?.id === deleteConfirm.id) {
        setSelectedRequest(null);
      }
    } else if (deleteConfirm.type === "all") {
      setRequests([]);
      setSelectedRequest(null);
    }
    setDeleteConfirm({ isOpen: false, type: "single" });
  };

  // Notification Modalini Ochish
  const handleOpenNotificationModal = (
    userId: string | number,
    userName: string,
    e?: React.MouseEvent,
  ) => {
    if (e) e.stopPropagation();
    setNotifTargetUser({ id: userId, name: userName });
    setIsNotifModalOpen(true);
  };

  // Notification Submit bolganda ishlaydigan funksiya
  const handleNotificationSubmit = (payload: NotificationPayload) => {
    console.log("Yuborilgan Notification Payload:", payload);

    const recipient = payload.recipientName
      ? `${payload.recipientName} ga`
      : "Hammaga";
    setToastMessage(`${recipient} bildirishnoma muvaffaqiyatli yuborildi!`);

    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || req.status === selectedStatus;
    const matchesType = selectedType === "all" || req.type === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  const typeOptions = [
    { value: "all", label: "Barchasi (Turi)" },
    { value: "game_suggestion", label: "Oyin Taklifi" },
    { value: "bug_report", label: "Xatolik (Bug)" },
    { value: "partnership", label: "Hamkorlik" },
    { value: "other", label: "Boshqa" },
  ];

  const statusOptions = [
    { value: "all", label: "Barchasi (Holati)" },
    { value: "pending", label: "Kutilmoqda" },
    { value: "investigating", label: "Organilmoqda" },
    { value: "resolved", label: "Hal qilindi" },
    { value: "rejected", label: "Rad etildi" },
  ];

  return (
    <div className="w-full min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-200 py-16">
      {/* --- TOAST NOTIFICATION --- */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 dark:border-slate-200 font-bold text-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- STICKY PANEL --- */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
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
                Jami: {requests.length}
              </span>
              <span className="px-2 py-0.5 text-amber-600 dark:text-amber-400">
                Kutilmoqda:{" "}
                {requests.filter((r) => r.status === "pending").length}
              </span>
            </div>

            {requests.length > 0 && (
              <button
                onClick={triggerDeleteAll}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-black rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hammasini ochirish
              </button>
            )}
          </div>
        </div>

        {/* --- FILTRLAR PANELi --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
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

          {/* Turi boyicha Custom Select */}
          <div className="relative" ref={typeRef}>
            <button
              onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-900/80 transition-colors"
            >
              <span>
                {typeOptions.find((opt) => opt.value === selectedType)?.label}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${typeDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {typeDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden py-1"
                >
                  {typeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSelectedType(opt.value);
                        setTypeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedType === opt.value
                          ? "bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Holati boyicha Custom Select */}
          <div className="relative" ref={statusRef}>
            <button
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-900/20 transition-colors"
            >
              <span>
                {
                  statusOptions.find((opt) => opt.value === selectedStatus)
                    ?.label
                }
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${statusDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {statusDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden py-1"
                >
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSelectedStatus(opt.value);
                        setStatusDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedStatus === opt.value
                          ? "bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* --- ROYXAT --- */}
      <div className="mt-4 bg-white dark:bg-slate-900/20 rounded-2xl border border-slate-100 dark:border-slate-900/60 overflow-hidden shadow-sm">
        {filteredRequests.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="divide-y divide-slate-100 dark:divide-slate-900/40"
          >
            {filteredRequests.map((req) => {
              const currentStatus = statusMap[req.status];
              const StatusIcon = currentStatus.icon;
              const currentType = typeMap[req.type];

              return (
                <motion.div
                  key={req.id}
                  variants={itemVariants}
                  onClick={() => handleOpenDialog(req)}
                  className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/60 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3 max-w-2xl">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center font-black text-sm flex-shrink-0">
                      {req.userName.charAt(0).toUpperCase()}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                          {req.id}
                        </span>
                        <h3 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                          {req.userName}
                        </h3>
                      </div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-1">
                        {req.subject}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 border-t border-dashed border-slate-100 dark:border-slate-900/20 md:border-t-0 pt-2.5 md:pt-0">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black rounded-md uppercase tracking-wide ${currentType.color}`}
                    >
                      {currentType.label}
                    </span>

                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-xl border ${currentStatus.color}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{currentStatus.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${priorityMap[req.priority]}`}
                      />
                    </div>

                    <button
                      onClick={(e) =>
                        handleOpenNotificationModal(req.id, req.userName, e)
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-500 transition-colors ml-1"
                      title="Ogohlantirish yuborish"
                    >
                      <Bell className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) =>
                        triggerDeleteSingle(req.id, req.userName, e)
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                      title="Ochirish"
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
            <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Hech qanday sorov topilmadi
            </h3>
          </div>
        )}
      </div>

      {/* --- EDIT / DETAIL MODAL DIALOG --- */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="absolute inset-0 bg-slate-950/70"
            />

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="relative w-full max-w-xl rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col max-h-[80vh] overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black text-slate-900 dark:text-white">
                      {selectedRequest.userName}
                    </h2>
                    <span className="text-[10px] font-mono text-slate-450 dark:text-slate-500">
                      ({selectedRequest.id})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-550 dark:text-slate-400 font-medium">
                    {selectedRequest.userEmail} • {selectedRequest.createdAt}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-4 space-y-3 overflow-y-auto flex-1 pr-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-black rounded uppercase ${typeMap[selectedRequest.type].color}`}
                  >
                    {typeMap[selectedRequest.type].label}
                  </span>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {selectedRequest.subject}
                  </h3>
                </div>

                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line border-l-2 border-slate-200 dark:border-slate-700 pl-3 py-1">
                  {selectedRequest.message}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3 flex-shrink-0">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Holat:
                  </span>
                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value as UserRequest["status"])
                    }
                    className="w-full px-2 py-1.5 text-xs font-bold rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 outline-none text-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="pending">Kutilmoqda</option>
                    <option value="investigating">Organilmoqda</option>
                    <option value="resolved">Hal etildi</option>
                    <option value="rejected">Rad etildi</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Muhimlik:
                  </span>
                  <select
                    value={editPriority}
                    onChange={(e) =>
                      setEditPriority(e.target.value as UserRequest["priority"])
                    }
                    className="w-full px-2 py-1.5 text-xs font-bold rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 outline-none text-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="low">Past</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yuqori</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-slate-850 mt-3 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      triggerDeleteSingle(
                        selectedRequest.id,
                        selectedRequest.userName,
                      )
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Ochirish
                  </button>

                  <button
                    onClick={() =>
                      handleOpenNotificationModal(
                        selectedRequest.id,
                        selectedRequest.userName,
                      )
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg text-indigo-500 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 transition-colors"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    Ogohlantirish yuborish
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                  >
                    Yopish
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-black rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Saqlash
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CONFIRM DELETE MODAL --- */}
      <AnimatePresence>
        {deleteConfirm.isOpen && (
          <div className="fixed inset-0 z-[99990] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setDeleteConfirm({ isOpen: false, type: "single" })
              }
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
                <div className="p-3 rounded-full bg-rose-500/10 text-rose-500">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-wider">
                    {deleteConfirm.type === "all"
                      ? "Barcha sorovlarni ochirasizmi?"
                      : "Sorovni ochirasizmi?"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[280px]">
                    {deleteConfirm.type === "all"
                      ? "Haqiqatan ham barcha foydalanuvchi sorovlarini ochirib tashlamoqchimisiz? Bu amalni ortga qaytarib bolmaydi."
                      : `${deleteConfirm.name ? `"${deleteConfirm.name}" ga tegishli` : "Ushbu"} sorovni royxatdan ochirishni tasdiqlaysizmi?`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full pt-2">
                  <button
                    onClick={() =>
                      setDeleteConfirm({ isOpen: false, type: "single" })
                    }
                    className="py-2 text-xs font-black rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-150 active:scale-95"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="py-2 text-xs font-black rounded-xl text-white bg-rose-600 hover:bg-rose-700 transition-all duration-150 active:scale-95 shadow-lg shadow-rose-500/10"
                  >
                    Ha, ochirish
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- REUSABLE MULTI-LANG NOTIFICATION MODAL --- */}
      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        onSubmit={handleNotificationSubmit}
        isPublic={false}
        targetUser={notifTargetUser}
      />
    </div>
  );
}
