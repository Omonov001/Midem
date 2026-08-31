"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Globe,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Link as LinkIcon,
} from "lucide-react";

export type Language = "uz" | "ru" | "en" | "tr";

export type NotificationRecipientType = "public" | "user";

export type NotificationType =
  | "system"
  | "message"
  | "achievement"
  | "payment"
  | "admin"
  | "account";

export interface MultiLangContent {
  title: string;
  message: string;
}

export interface NotificationPayload {
  recipientType: NotificationRecipientType;
  userId?: string;
  recipientName?: string;
  type: NotificationType;
  link?: string | null;
  translations: Record<Language, MultiLangContent>;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;

  onSubmit?: (payload: NotificationPayload) => void;

  isPublic?: boolean;

  targetUser?: {
    id: number | string;
    name: string;
  } | null;

  initialValues?: Partial<Record<Language, MultiLangContent>>;

  initialType?: NotificationType;

  initialLink?: string;

  isEditing?: boolean;
}

const languages: {
  code: Language;
  label: string;
  flag: string;
}[] = [
  {
    code: "uz",
    label: "O'zbek",
    flag: "🇺🇿",
  },
  {
    code: "ru",
    label: "Русский",
    flag: "🇷🇺",
  },
  {
    code: "en",
    label: "English",
    flag: "🇬🇧",
  },
  {
    code: "tr",
    label: "Türkçe",
    flag: "🇹🇷",
  },
];

const notificationTypes: {
  value: NotificationType;
  label: string;
}[] = [
  {
    value: "system",
    label: "System",
  },
  {
    value: "message",
    label: "Message",
  },
  {
    value: "achievement",
    label: "Achievement",
  },
  {
    value: "payment",
    label: "Payment",
  },
  {
    value: "admin",
    label: "Admin",
  },
  {
    value: "account",
    label: "Account",
  },
];

const emptyContent: MultiLangContent = {
  title: "",
  message: "",
};

const createEmptyForm = (): Record<Language, MultiLangContent> => ({
  uz: { ...emptyContent },
  ru: { ...emptyContent },
  en: { ...emptyContent },
  tr: { ...emptyContent },
});

export default function NotificationModal({
  isOpen,
  onClose,
  onSubmit,
  isPublic = true,
  targetUser = null,
  initialValues,
  initialType = "system",
  initialLink = "",
  isEditing = false,
}: NotificationModalProps) {
  const [activeTab, setActiveTab] = useState<Language>("uz");

  const [formData, setFormData] =
    useState<Record<Language, MultiLangContent>>(createEmptyForm());

  const [notificationType, setNotificationType] =
    useState<NotificationType>(initialType);

  const [link, setLink] = useState(initialLink);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /*
   * Modal ochilganda formni reset qilish
   */
  useEffect(() => {
    if (!isOpen) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({
      uz: initialValues?.uz ? { ...initialValues.uz } : { ...emptyContent },

      ru: initialValues?.ru ? { ...initialValues.ru } : { ...emptyContent },

      en: initialValues?.en ? { ...initialValues.en } : { ...emptyContent },

      tr: initialValues?.tr ? { ...initialValues.tr } : { ...emptyContent },
    });

    setActiveTab("uz");
    setNotificationType(initialType);
    setLink(initialLink);

    setError("");
    setSuccess("");
    setIsSubmitting(false);
  }, [isOpen, initialValues, initialType, initialLink]);

  /*
   * Input o'zgarishi
   */
  const handleInputChange = (field: "title" | "message", value: string) => {
    setFormData((prev) => ({
      ...prev,

      [activeTab]: {
        ...prev[activeTab],
        [field]: value,
      },
    }));

    setError("");
    setSuccess("");
  };

  /*
   * Form validation
   */
  const validateForm = () => {
    if (!isPublic && !targetUser?.id) {
      setError(
        "Foydalanuvchi tanlanmagan. Shaxsiy notification yuborish uchun user kerak.",
      );

      return false;
    }

    for (const language of languages) {
      const content = formData[language.code];

      if (!content.title.trim()) {
        setActiveTab(language.code);

        setError(`${language.label} tilida sarlavha kiritilmagan.`);

        return false;
      }

      if (!content.message.trim()) {
        setActiveTab(language.code);

        setError(`${language.label} tilida xabar matni kiritilmagan.`);

        return false;
      }

      if (content.title.length > 200) {
        setActiveTab(language.code);

        setError(`${language.label} sarlavhasi 200 belgidan oshmasligi kerak.`);

        return false;
      }

      if (content.message.length > 2000) {
        setActiveTab(language.code);

        setError(`${language.label} xabari 2000 belgidan oshmasligi kerak.`);

        return false;
      }
    }

    return true;
  };

  /*
   * API orqali notification yuborish
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setError("");
    setSuccess("");

    if (!validateForm()) return;

    const payload: NotificationPayload = {
      recipientType: isPublic ? "public" : "user",

      ...(isPublic
        ? {}
        : {
            userId: String(targetUser!.id),
            recipientName: targetUser?.name,
          }),

      type: notificationType,

      link: link.trim() || null,

      translations: {
        uz: {
          title: formData.uz.title.trim(),
          message: formData.uz.message.trim(),
        },

        ru: {
          title: formData.ru.title.trim(),
          message: formData.ru.message.trim(),
        },

        en: {
          title: formData.en.title.trim(),
          message: formData.en.message.trim(),
        },

        tr: {
          title: formData.tr.title.trim(),
          message: formData.tr.message.trim(),
        },
      },
    };

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/notification", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Notification yuborishda xatolik yuz berdi.",
        );
      }

      setSuccess(
        isPublic
          ? "Notification barcha foydalanuvchilarga yuborildi!"
          : `${targetUser?.name || "Foydalanuvchi"}ga notification yuborildi!`,
      );

      /*
       * Parentga ham yuboramiz
       */
      onSubmit?.(payload);

      /*
       * Bir oz kutib modalni yopamiz
       */
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      console.error("Notification submit error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Notification yuborishda xatolik yuz berdi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * Modal yopilganda submit bo'lmagan holatda state
   * keyingi ochilishda toza bo'lishi uchun
   */
  const handleClose = () => {
    if (isSubmitting) return;

    setError("");
    setSuccess("");

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />

          {/* MODAL */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: 8,
            }}
            className="relative w-full max-w-lg max-h-[92vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                  {isPublic ? (
                    <>
                      <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                      {isEditing
                        ? "Hammaga Notificationni tahrirlash"
                        : "Hammaga Notification"}
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 text-indigo-500 shrink-0" />
                      {isEditing
                        ? "Notificationni tahrirlash"
                        : `Xabar: ${targetUser?.name || "Foydalanuvchiga"}`}
                    </>
                  )}
                </h3>

                <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {isPublic
                    ? "Barcha foydalanuvchilarga 4 tilda yuboriladi"
                    : `Faqat ${
                        targetUser?.name || "ushbu foydalanuvchi"
                      } uchun`}
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="overflow-y-auto min-h-0">
              {/* RECIPIENT */}
              <div className="px-5 pt-3">
                <div
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${
                    isPublic
                      ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isPublic
                        ? "bg-indigo-100 dark:bg-indigo-500/20"
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  >
                    {isPublic ? (
                      <Globe className="w-3.5 h-3.5 text-indigo-500" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Qabul qiluvchi
                    </p>

                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                      {isPublic
                        ? "Barcha MIDEM foydalanuvchilari"
                        : targetUser?.name || "Foydalanuvchi tanlanmagan"}
                    </p>
                  </div>

                  <div className="ml-auto shrink-0">
                    <span
                      className={`text-[9px] font-bold px-2 py-1 rounded-md ${
                        isPublic
                          ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                          : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {isPublic ? "PUBLIC" : "PRIVATE"}
                    </span>
                  </div>
                </div>
              </div>

              {/* LANGUAGE TABS */}
              <div className="flex bg-slate-50/50 dark:bg-slate-950/40 px-3 py-1.5 gap-1 border-b border-slate-100 dark:border-slate-800 mt-3">
                {languages.map((lang) => {
                  const hasContent = Boolean(
                    formData[lang.code].title.trim() ||
                    formData[lang.code].message.trim(),
                  );

                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setActiveTab(lang.code)}
                      disabled={isSubmitting}
                      className={`relative flex-1 py-1.5 px-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                        activeTab === lang.code
                          ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60"
                          : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <span>{lang.flag}</span>

                      <span className="hidden xs:inline sm:inline">
                        {lang.label}
                      </span>

                      {hasContent && (
                        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="px-5 py-4 space-y-3 text-sm"
              >
                {/* TYPE */}
                <div>
                  <label className="block font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-wider mb-1">
                    Notification turi
                  </label>

                  <div className="relative">
                    <select
                      value={notificationType}
                      onChange={(e) =>
                        setNotificationType(e.target.value as NotificationType)
                      }
                      disabled={isSubmitting}
                      className="appearance-none w-full px-3 py-2 text-xs pr-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    >
                      {notificationTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {/* TITLE */}
                <div>
                  <label className="block font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-wider mb-1">
                    Sarlavha ({activeTab.toUpperCase()})
                  </label>

                  <input
                    type="text"
                    required
                    maxLength={200}
                    disabled={isSubmitting}
                    value={formData[activeTab].title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder={`Sarlavhani kiriting...`}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white disabled:opacity-60"
                  />

                  <div className="text-right text-[9px] text-slate-400 mt-0.5">
                    {formData[activeTab].title.length}/200
                  </div>
                </div>

                {/* MESSAGE */}
                <div>
                  <label className="block font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-wider mb-1">
                    Xabar ({activeTab.toUpperCase()})
                  </label>

                  <textarea
                    required
                    rows={3}
                    maxLength={2000}
                    disabled={isSubmitting}
                    value={formData[activeTab].message}
                    onChange={(e) =>
                      handleInputChange("message", e.target.value)
                    }
                    placeholder="Xabar matnini kiriting..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white resize-none disabled:opacity-60"
                  />

                  <div className="text-right text-[9px] text-slate-400 mt-0.5">
                    {formData[activeTab].message.length}/2000
                  </div>
                </div>

                {/* LINK */}
                <div>
                  <label className="flex items-center gap-1 font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-wider mb-1">
                    <LinkIcon className="w-2.5 h-2.5" />
                    Link
                    <span className="normal-case font-medium tracking-normal">
                      (ixtiyoriy)
                    </span>
                  </label>

                  <input
                    type="text"
                    disabled={isSubmitting}
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="/profile yoki /games"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white disabled:opacity-60"
                  />
                </div>

                {/* ERROR / SUCCESS */}
                <AnimatePresence>
                  {(error || success) && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        height: 0,
                      }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                      }}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border ${
                        error
                          ? "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400"
                          : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {error ? (
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      )}

                      <p className="text-[10px] font-semibold">
                        {error || success}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ACTIONS */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="px-3.5 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Bekor qilish
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || Boolean(success)}
                    className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-600/10 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Yuborilmoqda...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Yuborildi
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        {isEditing ? "Saqlash" : "Yuborish"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
