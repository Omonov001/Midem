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
import { useTheme } from "@/components/ui/theme-provider"; // Sizning provideringiz
import useTranslate from "@/hooks/use-translate";

// Muvaffaqiyatli yuborilganda chiquvchi modal
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
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={cn(
          "p-8 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl border animate-in fade-in zoom-in duration-300",
          isDark
            ? "bg-slate-900 border-white/10 text-white"
            : "bg-white border-slate-200 text-slate-900",
        )}
      >
        <IoCheckmarkCircleOutline className="mx-auto text-6xl text-green-500 mb-4" />
        <h2 className="text-2xl font-black mb-2">Muvaffaqiyatli!</h2>
        <p className={cn("mb-6", isDark ? "text-slate-400" : "text-slate-500")}>
          Xabaringiz Telegramga yuborildi. Tez orada javob beramiz.
        </p>
        <button
          onClick={onClose}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95"
        >
          Yopish
        </button>
      </div>
    </div>
  );
};

function ContactPage() {
  const { theme } = useTheme(); // resolvedTheme -> theme
  const [mounted, setMounted] = useState(false);
  const t = useTranslate();

  // Form holatlari
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;
  const isDark = theme === "dark";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const text = `🚀 Yangi xabar!\n\n👤 Ism: ${formData.name}\n📧 Email: ${formData.email}\n📝 Xabar: ${formData.message}`;

    try {
      const res = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: text }),
        },
      );

      if (res.ok) {
        setShowModal(true);
        setFormData({ name: "", email: "", message: "" });
      } else {
        alert("Xatolik! Token yoki Chat ID xato bo'lishi mumkin.");
      }
    } catch (error) {
      alert("Internet bilan muammo yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={cn(
        "relative min-h-screen pt-[12vh] pb-10 px-4 md:px-12 transition-colors duration-300",
        isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900",
      )}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-blue-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center relative z-10">
        <div className="text-center space-y-4 mb-12">
          <MenuText text={t("MainText4")} />
          <h1
            className={cn(
              "text-4xl md:text-6xl font-black uppercase leading-none",
              isDark ? "text-white" : "text-slate-900",
            )}
          >
            {t("ContactUs")}{" "}
            <span className="text-blue-600">{t("ContactUs2")}</span>
          </h1>
          <p
            className={cn(
              "max-w-lg mx-auto text-sm md:text-base",
              isDark ? "text-slate-400" : "text-slate-500",
            )}
          >
            {t("ContactText")}
          </p>
        </div>

        <div className="grid grid-cols-1 w-full lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            {[
              {
                icon: <IoCall />,
                title: t("Mobile"),
                val: "+998 90 123 45 67",
                bg: "bg-blue-500",
              },
              {
                icon: <IoMail />,
                title: t("Email"),
                val: "support@games.uz",
                bg: "bg-indigo-500",
              },
              {
                icon: <IoLocation />,
                title: t("Address"),
                val: "Toshkent, Ozbekiston",
                bg: "bg-purple-500",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={cn(
                  "p-5 rounded-3xl border max-md:w-full flex items-center gap-4 transition-all hover:translate-x-2",
                  isDark
                    ? "bg-white/5 border-white/10"
                    : "bg-white border-slate-200 shadow-sm",
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg",
                    item.bg,
                  )}
                >
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    {item.title}
                  </p>
                  <p
                    className={cn(
                      "font-bold",
                      isDark ? "text-white" : "text-slate-900",
                    )}
                  >
                    {item.val}
                  </p>
                </div>
              </div>
            ))}

            <div className="flex gap-4 pt-4">
              <a
                href="#"
                className="flex-1 py-4 rounded-2xl bg-[#0088cc] text-white flex items-center justify-center gap-2 font-bold active:scale-95 transition-all shadow-lg shadow-blue-500/20"
              >
                <BiLogoTelegram size={20} /> Telegram
              </a>
              <a
                href="#"
                className="flex-1 py-4 rounded-2xl bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 text-white flex items-center justify-center gap-2 font-bold active:scale-95 transition-all shadow-lg shadow-pink-500/20"
              >
                <IoLogoInstagram size={20} /> Instagram
              </a>
            </div>
          </div>

          <div
            className={cn(
              "lg:col-span-7 p-8 rounded-[2.5rem] border",
              isDark
                ? "bg-white/5 border-white/10"
                : "bg-white border-slate-200 shadow-xl shadow-slate-200/50",
            )}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input
                  required
                  type="text"
                  placeholder={t("YourName")}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={cn(
                    "w-full px-6 py-4 rounded-2xl border bg-transparent outline-none focus:border-blue-500 transition-all",
                    isDark
                      ? "border-white/10 text-white"
                      : "border-slate-200 text-slate-900",
                  )}
                />
                <input
                  required
                  type="email"
                  placeholder={t("YourEmailAddress")}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={cn(
                    "w-full px-6 py-4 rounded-2xl border bg-transparent outline-none focus:border-blue-500 transition-all",
                    isDark
                      ? "border-white/10 text-white"
                      : "border-slate-200 text-slate-900",
                  )}
                />
              </div>
              <textarea
                required
                rows={4}
                placeholder={`${t("WriteYourMessage")}...`}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className={cn(
                  "w-full px-6 py-4 rounded-2xl border bg-transparent outline-none focus:border-blue-500 transition-all resize-none",
                  isDark
                    ? "border-white/10 text-white"
                    : "border-slate-200 text-slate-900",
                )}
              />
              <button
                disabled={loading}
                type="submit"
                className="w-full cursor-pointer py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
              >
                {loading ? `${"IsBeingSent"}...` : t("SendAMessage")} <IoSend />
              </button>
            </form>
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        isDark={isDark}
      />
    </main>
  );
}

export default ContactPage;
