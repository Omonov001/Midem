"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Plus,
  Trash2,
  ShieldCheck,
  Cpu,
  Wifi,
  Lock,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useTranslate from "@/hooks/use-translate";

interface CardData {
  _id: string;
  cardholderName: string;
  cardLast4: string;
  country: string;
  currency: string;
  verified: boolean;
  createdAt?: string;
}

interface FormData {
  cardNumber: string;
  cardholderName: string;
  country: string;
  currency: string;
}

export default function Page() {
  const t = useTranslate();

  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showNumber, setShowNumber] = useState(false);

  const [form, setForm] = useState<FormData>({
    cardNumber: "",
    cardholderName: "",
    country: "UZ",
    currency: "UZS",
  });

  const loadCards = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/cards", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Kartalarni yuklab bolmadi");
      }

      setCards(data.data || []);
    } catch (error) {
      console.error("Cards load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCards();
  }, []);

  const updateForm = (key: keyof FormData, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 16);
    const formatted = numbers.replace(/(.{4})/g, "$1 ").trim();
    updateForm("cardNumber", formatted);
  };

  const resetForm = () => {
    setForm({
      cardNumber: "",
      cardholderName: "",
      country: "UZ",
      currency: "UZS",
    });
    setShowNumber(false);
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanNumber = form.cardNumber.replace(/\s/g, "");

    if (cleanNumber.length !== 16) {
      alert("Karta raqami 16 xonali bolishi kerak!");
      return;
    }

    if (!form.cardholderName.trim()) {
      alert("Karta egasining ismini kiriting!");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardNumber: cleanNumber,
          cardholderName: form.cardholderName,
          country: form.country,
          currency: form.currency,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Karta qoshib bolmadi");
      }

      setCards((prev) => [data.data, ...prev]);

      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCard) return;

    if (!confirm("Ushbu kartani ochirishni xohlaysizmi?")) return;

    try {
      setDeleting(true);

      const res = await fetch(`/api/cards/${selectedCard._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Kartani ochirib bolmadi");
      }

      setCards((prev) => prev.filter((card) => card._id !== selectedCard._id));

      setSelectedCard(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Xatolik yuz berdi");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full mt-20 min-h-screen p-6 md:p-10 max-w-5xl">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
              <CreditCard size={28} />
            </div>

            <h1 className="text-5xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
              {t("creditCards")}
            </h1>
          </div>

          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest ml-1">
            {t("myCreditCards")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setIsFormOpen((v) => !v)}
            className={cn(
              "flex items-center justify-center gap-2 px-8 py-4 rounded-2xl",
              "font-black uppercase italic text-sm transition-all active:scale-95 shadow-lg",
              isFormOpen
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-blue-600 text-white hover:bg-blue-700",
            )}
          >
            {isFormOpen ? <X size={20} /> : <Plus size={20} />}

            {isFormOpen ? "Yopish" : t("addNewCard")}
          </button>
        </div>
      </div>

      {/* INFO */}
      <div className="mb-8 p-5 rounded-3xl bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-start gap-3">
          <ShieldCheck className="text-blue-500 mt-0.5" size={22} />

          <div>
            <p className="font-black uppercase italic text-blue-600 dark:text-blue-400">
              Developer Payout
            </p>

            <p className="text-xs font-bold text-slate-500 mt-1">
              Oyin sotuvlaridan pul olish uchun kartangizni qoshing. Pul shu
              kartaga qolda otkaziladi.
            </p>
          </div>
        </div>
      </div>

      {/* ADD CARD */}
      {isFormOpen && (
        <div className="mb-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-blue-600 text-white">
              <Lock size={20} />
            </div>

            <div>
              <h2 className="text-xl font-black uppercase italic text-slate-900 dark:text-white">
                {t("newCardData")}
              </h2>

              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Payout card
              </p>
            </div>
          </div>

          <form onSubmit={handleAddCard} className="space-y-6">
            {/* CARD NUMBER */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">
                Card Number
              </label>

              <div className="relative mt-1">
                <input
                  required
                  type={showNumber ? "text" : "password"}
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={form.cardNumber}
                  onChange={(e) => handleCardNumber(e.target.value)}
                  placeholder="0000 0000 0000 0000"
                  className="w-full px-6 pr-14 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 outline-none font-bold tracking-widest focus:ring-2 focus:ring-blue-600"
                />

                <button
                  type="button"
                  onClick={() => setShowNumber((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                >
                  {showNumber ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* HOLDER */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">
                {t("cardHolder")}
              </label>

              <input
                required
                type="text"
                autoComplete="cc-name"
                value={form.cardholderName}
                onChange={(e) =>
                  updateForm("cardholderName", e.target.value.toUpperCase())
                }
                placeholder={t("fnln")}
                className="w-full mt-1 px-6 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 outline-none font-bold uppercase focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* COUNTRY / CURRENCY */}
            <div className="grid grid-cols-2 gap-4">
              <input
                required
                value={form.country}
                onChange={(e) =>
                  updateForm("country", e.target.value.toUpperCase())
                }
                placeholder="UZ"
                maxLength={2}
                className="w-full px-6 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 outline-none font-bold focus:ring-2 focus:ring-blue-600"
              />

              <input
                required
                value={form.currency}
                onChange={(e) =>
                  updateForm("currency", e.target.value.toUpperCase())
                }
                placeholder="UZS"
                maxLength={3}
                className="w-full px-6 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 outline-none font-bold focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black uppercase italic tracking-widest text-sm hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {saving ? "Saqlanmoqda..." : t("save")}
            </button>
          </form>
        </div>
      )}

      {/* CARDS */}
      {loading ? (
        <div className="py-20 text-center">
          <span className="font-black text-blue-600 uppercase animate-pulse">
            Yuklanmoqda...
          </span>
        </div>
      ) : cards.length === 0 ? (
        <div className="h-56 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-3 text-slate-400">
          <CreditCard size={35} />

          <span className="font-bold uppercase italic text-xs tracking-widest">
            Hozircha karta yoq
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map((card) => (
            <button
              key={card._id}
              onClick={() => setSelectedCard(card)}
              className="text-left relative h-56 w-full rounded-[2.5rem] p-8 text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-2xl bg-gradient-to-br from-slate-950 to-slate-800"
            >
              <div className="flex justify-between items-start mb-10">
                <div className="w-12 h-10 bg-yellow-500/80 rounded-lg flex items-center justify-center">
                  <Cpu size={32} className="text-black/40" />
                </div>

                <Wifi size={24} className="opacity-40 rotate-90" />
              </div>

              <p className="text-2xl font-bold tracking-[0.2em]">
                **** **** **** {card.cardLast4}
              </p>

              <div className="flex justify-between items-end mt-6">
                <p className="text-sm font-black italic uppercase">
                  {card.cardholderName}
                </p>

                <span className="text-xs font-black opacity-70">
                  {card.currency}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-600 text-white">
                  <CreditCard size={22} />
                </div>

                <div>
                  <h2 className="font-black uppercase italic text-slate-900 dark:text-white">
                    Karta
                  </h2>

                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Karta malumotlari
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCard(null)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative h-56 rounded-[2rem] p-7 text-white overflow-hidden bg-gradient-to-br from-slate-950 to-slate-800 shadow-xl mb-6">
              <div className="flex justify-between items-start mb-9">
                <div className="w-12 h-10 bg-yellow-500/80 rounded-lg flex items-center justify-center">
                  <Cpu size={30} className="text-black/40" />
                </div>

                <Wifi size={22} className="opacity-40 rotate-90" />
              </div>

              <p className="text-xl font-bold tracking-[0.15em]">
                **** **** **** {selectedCard.cardLast4}
              </p>

              <div className="flex justify-between items-end mt-5">
                <div>
                  <p className="text-[8px] opacity-50 uppercase">Card Holder</p>

                  <p className="text-sm font-black uppercase italic">
                    {selectedCard.cardholderName}
                  </p>
                </div>

                <div>
                  <p className="text-[8px] opacity-50 uppercase">Currency</p>

                  <p className="text-sm font-black">{selectedCard.currency}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Info label="Country" value={selectedCard.country} />

              <Info label="Currency" value={selectedCard.currency} />

              <Info
                label="Status"
                value={selectedCard.verified ? "Verified" : "Unverified"}
              />
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs font-bold text-emerald-500">
              <ShieldCheck size={17} />
              Karta xavfsiz saqlangan
            </div>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="mt-6 w-full py-4 rounded-2xl bg-red-500 text-white font-black uppercase italic flex items-center justify-center gap-2 hover:bg-red-600 disabled:opacity-50 transition-all"
            >
              <Trash2 size={18} />

              {deleting ? "Ochirilmoqda..." : "Kartani ochirish"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
