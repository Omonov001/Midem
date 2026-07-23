"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Globe, User } from "lucide-react";

export type Language = "uz" | "ru" | "en" | "tr";

export interface MultiLangContent {
  title: string;
  message: string;
}

export interface NotificationPayload {
  isPublic: boolean;
  userId?: number | string;
  recipientName?: string;
  translations: Record<Language, MultiLangContent>;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: NotificationPayload) => void;
  isPublic?: boolean;
  targetUser?: { id: number | string; name: string } | null;
  initialValues?: Partial<Record<Language, MultiLangContent>>;
}

const languages: { code: Language; label: string; flag: string }[] = [
  { code: "uz", label: "O'zbek", flag: "🇺🇿" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
];

const emptyContent = { title: "", message: "" };

export default function NotificationModal({
  isOpen,
  onClose,
  onSubmit,
  isPublic = true,
  targetUser = null,
  initialValues,
}: NotificationModalProps) {
  const [activeTab, setActiveTab] = useState<Language>("uz");
  const [formData, setFormData] = useState<Record<Language, MultiLangContent>>({
    uz: { ...emptyContent },
    ru: { ...emptyContent },
    en: { ...emptyContent },
    tr: { ...emptyContent },
  });

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        uz: initialValues?.uz || { ...emptyContent },
        ru: initialValues?.ru || { ...emptyContent },
        en: initialValues?.en || { ...emptyContent },
        tr: initialValues?.tr || { ...emptyContent },
      });
      setActiveTab("uz");
    }
  }, [isOpen, initialValues]);

  const handleInputChange = (field: "title" | "message", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      isPublic,
      userId: targetUser?.id,
      recipientName: targetUser?.name,
      translations: formData,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  {isPublic ? (
                    <>
                      <Globe className="w-4 h-4 text-indigo-500" />
                      Hammaga Notification
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 text-indigo-500" />
                      Xabar: {targetUser?.name || "Foydalanuvchiga"}
                    </>
                  )}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isPublic
                    ? "Barcha foydalanuvchilarga 4 tilda bildirishnoma jo'natiladi"
                    : `Faqat ${targetUser?.name || "ushbu foydalanuvchi"} uchun`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex bg-slate-50/50 dark:bg-slate-950/40 p-2 gap-1.5 border-b border-slate-100 dark:border-slate-800">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setActiveTab(lang.code)}
                  className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === lang.code
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block font-bold text-slate-400 dark:text-slate-500 uppercase text-[11px] tracking-wider mb-1.5">
                  Sarlavha ({activeTab.toUpperCase()})
                </label>
                <input
                  type="text"
                  required
                  value={formData[activeTab].title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder={`Sarlavhani kiriting (${activeTab.toUpperCase()})...`}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white transition-colors"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 dark:text-slate-500 uppercase text-[11px] tracking-wider mb-1.5">
                  Xabar matni ({activeTab.toUpperCase()})
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData[activeTab].message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder={`Xabar matnini kiriting (${activeTab.toUpperCase()})...`}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/10 transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Yuborish</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
