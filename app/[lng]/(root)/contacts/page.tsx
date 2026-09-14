"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  IoMail,
  IoCall,
  IoLocation,
  IoSend,
  IoLogoInstagram,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";
import MenuText from "@/components/menus/menu-text";
import { BiLogoTelegram } from "react-icons/bi";
import { useTheme } from "@/components/ui/theme-provider";
import useTranslate from "@/hooks/use-translate";

// ============================================================
// SUCCESS MODAL
// ============================================================

const SuccessModal = ({
  isOpen,
  onClose,
  isDark,
}: {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}) => {
  if (!isOpen) return null;
  const text = "Xabaringiz Telegramga yuborildi. O'zimiz sizga javob beramiz.";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className={cn(
          "w-full max-w-sm rounded-[2.5rem] border p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-300",
          isDark
            ? "border-white/10 bg-slate-900 text-white"
            : "border-slate-200 bg-white text-slate-900",
        )}
      >
        <IoCheckmarkCircleOutline className="mx-auto mb-4 text-6xl text-green-500" />

        <h2 className="mb-2 text-2xl font-black">Muvaffaqiyatli!</h2>

        <p className={cn("mb-6", isDark ? "text-slate-400" : "text-slate-500")}>
          {text}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-2xl bg-blue-600 py-4 font-bold text-white transition-all hover:bg-blue-700 active:scale-95"
        >
          Yopish
        </button>
      </div>
    </div>
  );
};

// ============================================================
// CONTACT PAGE
// ============================================================

function ContactPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const t = useTranslate();

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    telegram: "",
    message: "",
  });

  // ============================================================
  // MOUNT
  // ============================================================

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          telegram: formData.telegram.trim(),
          message: formData.message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data?.message || "Xabar yuborishda xatolik yuz berdi.");

        return;
      }

      // Muvaffaqiyat
      setShowModal(true);

      // Formani tozalash
      setFormData({
        name: "",
        telegram: "",
        message: "",
      });
    } catch (error) {
      console.error("CONTACT ERROR:", error);

      alert("Internet bilan muammo yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CONTACT INFORMATION
  // ============================================================

  const contactItems = [
    {
      icon: <IoCall />,
      title: t("Mobile"),
      val: "+998 91 747 50 10",
      bg: "bg-blue-500",
    },
    {
      icon: <IoMail />,
      title: t("Email"),
      val: "maxkamovibrohimjon070@gmail.com",
      bg: "bg-indigo-500",
    },
    {
      icon: <IoLocation />,
      title: t("Address"),
      val: "Kokand, O'zbekiston",
      bg: "bg-purple-500",
    },
  ];

  // ============================================================
  // UI
  // ============================================================

  return (
    <main
      className={cn(
        "relative min-h-screen overflow-hidden px-4 pb-10 pt-[12vh] transition-colors duration-300 md:px-12",
        isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900",
      )}
    >
      {/* ====================================================== */}
      {/* BACKGROUND GLOW */}
      {/* ====================================================== */}

      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-full -translate-x-1/2 bg-blue-600/10 blur-[120px]" />

      {/* ====================================================== */}
      {/* CONTENT */}
      {/* ====================================================== */}

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-center">
        {/* ==================================================== */}
        {/* HEADER */}
        {/* ==================================================== */}

        <div className="mb-12 space-y-4 text-center">
          <MenuText text={t("MainText4")} />

          <h1
            className={cn(
              "text-4xl font-black uppercase leading-none md:text-6xl",
              isDark ? "text-white" : "text-slate-900",
            )}
          >
            {t("ContactUs")}{" "}
            <span className="text-blue-600">{t("ContactUs2")}</span>
          </h1>

          <p
            className={cn(
              "mx-auto max-w-lg text-sm md:text-base",
              isDark ? "text-slate-400" : "text-slate-500",
            )}
          >
            {t("ContactText")}
          </p>
        </div>

        {/* ==================================================== */}
        {/* GRID */}
        {/* ==================================================== */}

        <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* ================================================== */}
          {/* LEFT SIDE */}
          {/* ================================================== */}

          <div className="space-y-4 lg:col-span-5">
            {contactItems.map((item, i) => (
              <div
                key={i}
                className={cn(
                  "flex w-full items-center gap-4 rounded-3xl border p-5 transition-all hover:translate-x-2",
                  isDark
                    ? "border-white/10 bg-white/5"
                    : "border-slate-200 bg-white shadow-sm",
                )}
              >
                {/* ICON */}

                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl text-white shadow-lg",
                    item.bg,
                  )}
                >
                  {item.icon}
                </div>

                {/* TEXT */}

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    {item.title}
                  </p>

                  <p
                    className={cn(
                      "break-all font-bold",
                      isDark ? "text-white" : "text-slate-900",
                    )}
                  >
                    {item.val}
                  </p>
                </div>
              </div>
            ))}

            {/* ================================================= */}
            {/* SOCIAL BUTTONS */}
            {/* ================================================= */}

            <div className="flex gap-4 pt-4">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://t.me/MidemRobuxServis"
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0088cc] py-4 font-bold text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95"
              >
                <BiLogoTelegram size={20} />
                Telegram
              </a>

              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.instagram.com/midem__/"
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 py-4 font-bold text-white shadow-lg shadow-pink-500/20 transition-all active:scale-95"
              >
                <IoLogoInstagram size={20} />
                Instagram
              </a>
            </div>
          </div>

          {/* ================================================== */}
          {/* FORM */}
          {/* ================================================== */}

          <div
            className={cn(
              "rounded-[2.5rem] border p-6 md:p-8 lg:col-span-7",
              isDark
                ? "border-white/10 bg-white/5"
                : "border-slate-200 bg-white shadow-xl shadow-slate-200/50",
            )}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* ============================================== */}
              {/* NAME + TELEGRAM */}
              {/* ============================================== */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* NAME */}

                <input
                  required
                  type="text"
                  autoComplete="name"
                  placeholder={t("YourName")}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className={cn(
                    "w-full rounded-2xl border bg-transparent px-6 py-4 outline-none transition-all focus:border-blue-500",
                    isDark
                      ? "border-white/10 text-white placeholder:text-slate-500"
                      : "border-slate-200 text-slate-900 placeholder:text-slate-400",
                  )}
                />

                {/* TELEGRAM USERNAME */}

                <input
                  required
                  type="text"
                  autoComplete="off"
                  placeholder={t("YourEmailAddress")}
                  value={formData.telegram}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      telegram: e.target.value,
                    })
                  }
                  className={cn(
                    "w-full rounded-2xl border bg-transparent px-6 py-4 outline-none transition-all focus:border-blue-500",
                    isDark
                      ? "border-white/10 text-white placeholder:text-slate-500"
                      : "border-slate-200 text-slate-900 placeholder:text-slate-400",
                  )}
                />
              </div>

              {/* ============================================== */}
              {/* MESSAGE */}
              {/* ============================================== */}

              <textarea
                required
                rows={5}
                placeholder={`${t("WriteYourMessage")}...`}
                value={formData.message}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    message: e.target.value,
                  })
                }
                className={cn(
                  "w-full resize-none rounded-2xl border bg-transparent px-6 py-4 outline-none transition-all focus:border-blue-500",
                  isDark
                    ? "border-white/10 text-white placeholder:text-slate-500"
                    : "border-slate-200 text-slate-900 placeholder:text-slate-400",
                )}
              />

              {/* ============================================== */}
              {/* SEND BUTTON */}
              {/* ============================================== */}

              <button
                disabled={loading}
                type="submit"
                className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 text-lg font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Yuborilmoqda...
                  </>
                ) : (
                  <>
                    {t("SendAMessage")}
                    <IoSend />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* SUCCESS MODAL */}
      {/* ====================================================== */}

      <SuccessModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        isDark={isDark}
      />
    </main>
  );
}

export default ContactPage;
