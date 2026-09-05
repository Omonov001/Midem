"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Gamepad2,
  Newspaper,
  MessageSquare,
  Star,
  ArrowUpRight,
  TrendingUp,
  Wallet,
  X,
  CreditCard,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MIN_PAYOUT = 20;

export default function DeveloperDashboard() {
  const { user: clerkUser, isLoaded } = useUser();

  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [pendingBalance, setPendingBalance] = useState<number | null>(null);
  const [totalEarnings, setTotalEarnings] = useState<number | null>(null);

  const [loadingBalance, setLoadingBalance] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [country, setCountry] = useState("UZ");
  const [submitting, setSubmitting] = useState(false);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadBalance = async () => {
    if (!clerkUser) return;

    try {
      setLoadingBalance(true);

      const res = await fetch(`/api/users/${clerkUser.id}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (res.ok) {
        setAvailableBalance(data.availableBalance ?? 0);
        setPendingBalance(data.pendingBalance ?? 0);
        setTotalEarnings(data.totalEarnings ?? 0);
      }
    } catch (error) {
      console.error("Balance load error:", error);
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (isLoaded && clerkUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadBalance();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, clerkUser]);

  const handleCardNumberChange = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 16);
    const formatted = numbers.replace(/(.{4})/g, "$1 ").trim();

    setCardNumber(formatted);
  };

  const handleExpiryChange = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 4);

    let formatted = numbers;

    if (numbers.length > 2) {
      formatted = `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    }

    setCardExpiry(formatted);
  };

  const handleWithdrawSubmit = async () => {
    setFeedback(null);

    const cleanNumber = cardNumber.replace(/\s/g, "");

    if (cleanNumber.length !== 16) {
      setFeedback({
        type: "error",
        text: "Karta raqami 16 xonali bolishi kerak!",
      });
      return;
    }

    if (!cardholderName.trim()) {
      setFeedback({
        type: "error",
        text: "Karta egasining ismini kiriting!",
      });
      return;
    }

    if (country !== "UZ" && !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      setFeedback({
        type: "error",
        text: "Xalqaro kartalar uchun amal qilish muddati (MM/YY) kerak!",
      });
      return;
    }

    if (!country.trim()) {
      setFeedback({
        type: "error",
        text: "Davlatni tanlang!",
      });
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/payout/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardNumber: cleanNumber,
          cardholderName: cardholderName.trim(),
          cardExpiry: cardExpiry || null,
          country: country.trim().toUpperCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Xatolik yuz berdi");
      }

      setFeedback({
        type: "success",
        text: "Payout sorovi yuborildi! Admin tekshiradi.",
      });

      setCardNumber("");
      setCardholderName("");
      setCardExpiry("");

      // Sorov yuborilgandan keyin available balans 0 boladi.
      setAvailableBalance(0);

      setTimeout(() => {
        setIsModalOpen(false);
        setFeedback(null);
      }, 2000);
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Xatolik yuz berdi",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const stats = [
    {
      label: "Jami Oyinlar",
      value: "14 ta",
      change: "+2 bu oy",
      icon: <Gamepad2 size={22} />,
      color: "from-blue-600 to-cyan-500",
      shadow: "shadow-blue-500/10",
    },
    {
      label: "Yangiliklar / Patchlar",
      value: "42 ta",
      change: "Faol hamjamiyat",
      icon: <Newspaper size={22} />,
      color: "from-purple-600 to-indigo-500",
      shadow: "shadow-purple-500/10",
    },
    {
      label: "Yangi Izohlar",
      value: "1,240 ta",
      change: "+18% osish",
      icon: <MessageSquare size={22} />,
      color: "from-emerald-600 to-teal-500",
      shadow: "shadow-emerald-500/10",
    },
    {
      label: "Ortacha Reyting",
      value: "4.8 ★",
      change: "Top Developer",
      icon: <Star size={22} />,
      color: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/10",
    },
  ];

  const canWithdraw = (availableBalance ?? 0) >= MIN_PAYOUT;

  return (
    <div className="w-full max-w-[1600px] my-20 mx-auto space-y-6 md:space-y-10 p-2 sm:p-4 md:p-0 animate-in fade-in duration-500">
      {/* HEADER */}
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden border",
          "bg-gradient-to-r from-slate-50 via-indigo-50/50 to-slate-50 border-slate-200/80",
          "dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 dark:border-white/5",
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_55%)] dark:hidden" />

        <div className="relative z-10 space-y-1">
          <h1
            className={cn(
              "text-2xl sm:text-3xl md:text-4xl font-black tracking-tight bg-clip-text bg-gradient-to-r",
              "from-slate-900 via-slate-800 to-slate-600",
              "dark:from-white dark:via-slate-200 dark:to-slate-400",
            )}
          >
            Dasturchi Markazi
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            MIDEM platformasidagi oyinlaringiz statistikasi va daromadlaringizni
            boshqaring.
          </p>
        </div>

        <div
          className={cn(
            "relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider backdrop-blur-md self-start sm:self-center border",
            "bg-indigo-50 border-indigo-100 text-indigo-600",
            "dark:bg-white/5 dark:border-white/10 dark:text-indigo-400",
          )}
        >
          <TrendingUp size={12} />
          Live Analytics
        </div>
      </div>

      {/* BALANCE */}
      <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_55%)]" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-md">
                <Wallet size={26} />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest opacity-70">
                  Mavjud balans
                </p>

                <h2 className="text-3xl sm:text-4xl font-black">
                  {loadingBalance ? (
                    <span className="opacity-50 animate-pulse">
                      Yuklanmoqda...
                    </span>
                  ) : (
                    `$${(availableBalance ?? 0).toFixed(2)}`
                  )}
                </h2>

                {!canWithdraw && !loadingBalance && (
                  <p className="text-[11px] opacity-70 mt-1">
                    Minimal yechish: ${MIN_PAYOUT}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!canWithdraw || loadingBalance}
              className={cn(
                "px-6 py-3.5 rounded-xl font-black uppercase italic text-sm transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto",
                canWithdraw
                  ? "bg-white text-blue-700 hover:bg-blue-50"
                  : "bg-white/20 text-white/50 cursor-not-allowed",
              )}
            >
              <ArrowUpRight size={18} />
              Yechish
            </button>
          </div>

          {/* BALANCE INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <div className="p-4 rounded-xl bg-white/10 border border-white/10">
              <div className="flex items-center gap-2 opacity-70">
                <Clock size={15} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Kutilmoqda
                </span>
              </div>

              <p className="text-xl font-black mt-1">
                {loadingBalance
                  ? "..."
                  : `$${(pendingBalance ?? 0).toFixed(2)}`}
              </p>

              <p className="text-[10px] opacity-60 mt-1">
                Settlement tugagach mavjud boladi
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/10 border border-white/10">
              <div className="flex items-center gap-2 opacity-70">
                <TrendingUp size={15} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Jami daromad
                </span>
              </div>

              <p className="text-xl font-black mt-1">
                {loadingBalance ? "..." : `$${(totalEarnings ?? 0).toFixed(2)}`}
              </p>

              <p className="text-[10px] opacity-60 mt-1">Barcha sotuvlardan</p>
            </div>
          </div>
        </div>
      </div>

      {/* STATISTIKA */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={cn(
              "group relative p-5 sm:p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
              stat.shadow,
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                {stat.label}
              </span>

              <div
                className={cn(
                  "p-2.5 sm:p-3 rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110",
                  stat.color,
                )}
              >
                {stat.icon}
              </div>
            </div>

            <div className="mt-3 sm:mt-4">
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {stat.value}
              </h3>

              <p className="text-[11px] sm:text-xs font-medium text-emerald-500 mt-0.5">
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ASOSIY PANELLAR */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 p-5 sm:p-6 bg-white dark:bg-slate-900/30 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Sizning oyinlaringiz
              </h2>

              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Oxirgi yangilangan yoki qoshilgan oyinlar
              </p>
            </div>

            <button className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-all">
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="space-y-3">
            {[
              {
                title: "Shadowbound: Chronicle",
                genre: "RPG / Action",
                status: "Active",
                downloads: "24.5k",
              },
              {
                title: "Cyber Neon: Drift",
                genre: "Racing / Cyberpunk",
                status: "Under Review",
                downloads: "1.2k",
              },
              {
                title: "Pixel Dungeon Quest",
                genre: "Indie / Roguelike",
                status: "Draft",
                downloads: "0",
              },
            ].map((game, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shrink-0">
                    {game.title[0]}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {game.title}
                    </h4>

                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                      {game.genre}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 hidden xs:inline">
                    {game.downloads}
                  </span>

                  <span
                    className={cn(
                      "text-[9px] sm:text-[11px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                      game.status === "Active" &&
                        "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
                      game.status === "Under Review" &&
                        "bg-amber-500/10 text-amber-500 border border-amber-500/20",
                      game.status === "Draft" &&
                        "bg-slate-500/10 text-slate-500 border border-slate-500/20",
                    )}
                  >
                    {game.status === "Under Review" ? "Review" : game.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REVIEWS */}
        <div className="p-5 sm:p-6 bg-white dark:bg-slate-900/30 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Jonli sharhlar
              </h2>

              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Oyinchilarning fikrlari
              </p>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {[
              {
                name: "Asadbek_Gamer",
                game: "Shadowbound",
                comment:
                  "Grafika daxshat chiqibdi, lekin 3-levelda kichik bug bor ekan...",
                time: "2 daq oldin",
              },
              {
                name: "ShadowNinja",
                game: "Cyber Neon",
                comment: "Kutgandim! UI silliqligi va soundtreklar juda yoqdi.",
                time: "15 daq oldin",
              },
            ].map((comment, i) => (
              <div
                key={i}
                className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white truncate">
                    {comment.name}
                  </span>

                  <span className="text-slate-400 text-[9px] shrink-0">
                    {comment.time}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2">
                  {comment.comment}
                </p>

                <div className="inline-block px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[9px] font-semibold">
                  {comment.game}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PAYOUT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl border relative flex flex-col gap-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 disabled:opacity-40"
            >
              <X size={20} />
            </button>

            <div className="space-y-1 pr-8">
              <h3 className="text-xl font-black italic uppercase tracking-tight text-blue-500">
                Balansni yechish
              </h3>

              <p className="text-sm font-semibold opacity-70">
                Mavjud: ${(availableBalance ?? 0).toFixed(2)}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                  Davlat
                </label>

                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full mt-1 px-4 py-3.5 rounded-xl bg-slate-100 dark:bg-white/5 outline-none font-bold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UZ">Ozbekiston (Uzcard/Humo)</option>

                  <option value="OTHER">Boshqa davlat (Visa/Mastercard)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                  Karta raqami
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  placeholder="0000 0000 0000 0000"
                  className="w-full mt-1 px-4 py-3.5 rounded-xl bg-slate-100 dark:bg-white/5 outline-none font-bold tracking-widest focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {country !== "UZ" && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    Amal qilish muddati
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardExpiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    placeholder="12/28"
                    className="w-full mt-1 px-4 py-3.5 rounded-xl bg-slate-100 dark:bg-white/5 outline-none font-bold tracking-widest focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                  Karta egasi
                </label>

                <input
                  type="text"
                  value={cardholderName}
                  onChange={(e) =>
                    setCardholderName(e.target.value.toUpperCase())
                  }
                  placeholder="ISM FAMILIYA"
                  className="w-full mt-1 px-4 py-3.5 rounded-xl bg-slate-100 dark:bg-white/5 outline-none font-bold uppercase focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {feedback && (
              <div
                className={cn(
                  "px-4 py-3 rounded-xl text-xs font-bold",
                  feedback.type === "success"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-red-500/10 text-red-500",
                )}
              >
                {feedback.text}
              </div>
            )}

            <button
              type="button"
              onClick={handleWithdrawSubmit}
              disabled={submitting}
              className={cn(
                "w-full py-4 px-6 rounded-xl font-black text-xs uppercase italic shadow-lg flex items-center justify-center gap-2 transition-all text-white",
                submitting
                  ? "bg-slate-500 opacity-70 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 active:scale-95",
              )}
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Yuborilmoqda...
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  Sorov yuborish
                </>
              )}
            </button>

            <p className="text-[9px] text-center uppercase tracking-wider opacity-40 font-bold">
              Karta malumotlari bazaga saqlanmaydi
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
