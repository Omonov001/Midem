"use client";

import React, { useState, useRef, useEffect } from "react";
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

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "DEVELOPER";
  isOnline: boolean;
}

const MOCK_ADMINS: AdminUser[] = [
  {
    id: "ADM-101",
    name: "Jasur Rahimov",
    email: "jasur@gameportal.com",
    role: "OWNER",
    isOnline: true,
  },
  {
    id: "ADM-102",
    name: "Sardor Azimov",
    email: "sardor@gameportal.com",
    role: "ADMIN",
    isOnline: false,
  },
  {
    id: "ADM-103",
    name: "Malika Ismoilova",
    email: "malika@gameportal.com",
    role: "DEVELOPER",
    isOnline: true,
  },
  {
    id: "ADM-104",
    name: "Bekzod Aliyev",
    email: "bekzod@gameportal.com",
    role: "ADMIN",
    isOnline: true,
  },
  {
    id: "ADM-105",
    name: "Diyorbek Qodirov",
    email: "diyorbek@gameportal.com",
    role: "DEVELOPER",
    isOnline: false,
  },
  {
    id: "ADM-106",
    name: "Aziza Umarova",
    email: "aziza@gameportal.com",
    role: "ADMIN",
    isOnline: true,
  },
  {
    id: "ADM-107",
    name: "Diyorbekk Qodirov",
    email: "diyorbekk@gameportal.com",
    role: "DEVELOPER",
    isOnline: false,
  },
  {
    id: "ADM-108",
    name: "Azizaaaa Umarova",
    email: "azizaa@gameportal.com",
    role: "ADMIN",
    isOnline: true,
  },
];

export default function AdminsListPage() {
  const [admins] = useState<AdminUser[]>(MOCK_ADMINS);
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const roleOptions = [
    { value: "all", label: "Barcha Rollar" },
    { value: "OWNER", label: "OWNER" },
    { value: "ADMIN", label: "ADMIN" },
    { value: "DEVELOPER", label: "DEVELOPER" },
  ];

  const typeOptions = [
    { value: "game_suggestion", label: "Oyin Taklifi" },
    { value: "bug_report", label: "Xatolik (Bug)" },
    { value: "partnership", label: "Hamkorlik" },
    { value: "other", label: "Boshqa" },
  ];

  const roleBadgeMap = {
    OWNER: {
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: Crown,
    },
    ADMIN: {
      color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      icon: ShieldAlert,
    },
    DEVELOPER: {
      color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      icon: Code2,
    },
  };

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "all" || admin.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim() || !selectedAdmin) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setToastMessage(
        `${selectedAdmin.name} ga sorovingiz muvaffaqiyatli yuborildi!`,
      );
      setSelectedAdmin(null);
      setSubject("");
      setMessage("");

      setTimeout(() => setToastMessage(null), 3000);
    }, 600);
  };

  return (
    <div className="w-full my-15 p-10">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 dark:border-slate-200 font-bold text-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xl flex flex-col gap-5 overflow-hidden">
        {/* HEADER */}
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

          <div className="flex items-center gap-2 text-[11px] font-bold bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800 self-start sm:self-auto">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white shadow-sm">
              Jami: {admins.length}
            </span>
            <span className="px-2.5 py-1 text-emerald-600 dark:text-emerald-400">
              Online: {admins.filter((a) => a.isOnline).length}
            </span>
          </div>
        </div>

        {/* SEARCH & FILTER */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

          <div className="relative" ref={roleRef}>
            <button
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
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-0 right-0 mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden py-1"
                >
                  {roleOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSelectedRole(opt.value);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors ${
                        selectedRole === opt.value
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

        {/* EKRAN MOS SCROLL AREA (DARK / LIGHT REJIMGA MOSLANGAN CHIROYLI SCROLL) */}
        <div className="max-h-[420px] overflow-y-auto pr-1 sm:pr-2 [scrollbar-width:thin] [scrollbar-color:#a5b4fc_transparent] dark:[scrollbar-color:#312e81_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-indigo-300/60 dark:[&::-webkit-scrollbar-thumb]:bg-indigo-900/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-indigo-500">
          {filteredAdmins.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredAdmins.map((admin) => {
                const RoleBadge = roleBadgeMap[admin.role];
                const RoleIcon = RoleBadge.icon;

                return (
                  <div
                    key={admin.id}
                    className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-3.5 sm:p-4 hover:border-indigo-500/40 transition-all flex flex-col justify-between gap-3 overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-inner">
                            {admin.name.charAt(0)}
                          </div>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-slate-50 dark:border-slate-950 ${
                              admin.isOnline ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                        </div>

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

                      <div
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black rounded-lg border uppercase tracking-wider shrink-0 ${RoleBadge.color}`}
                      >
                        <RoleIcon className="w-3 h-3" />
                        <span>{admin.role}</span>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        ID: {admin.id}
                      </span>

                      <button
                        onClick={() => setSelectedAdmin(admin)}
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
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShieldCheck className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
              <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Siz qidirgan admin yoki rol topilmadi
              </h3>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedAdmin && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAdmin(null)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
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
                        {selectedAdmin.name} ({selectedAdmin.role})
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAdmin(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSendRequest} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Sorov Turi
                  </label>
                  <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none text-slate-800 dark:text-white"
                  >
                    {typeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Mavzu
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Murojaat mazmunini qisqacha yozing..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Batafsil Xabar
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Barcha tafsilotlarni yozib qoldiring..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-white resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedAdmin(null)}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-black rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50"
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
