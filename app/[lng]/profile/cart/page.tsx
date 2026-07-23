"use client";

import { useState } from "react";
import {
  CreditCard,
  Plus,
  Trash2,
  ShieldCheck,
  Cpu,
  Wifi,
  Lock,
  ChevronDown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useTranslate from "@/hooks/use-translate";

const initialCards = [
  {
    id: 1,
    type: "Mastercard",
    number: "**** **** **** 4580",
    expiry: "12/26",
    holder: "BEHZOD MUSULMONOV",
    color: "from-slate-900 to-slate-800",
  },
];

function Page() {
  const [cards, setCards] = useState(initialCards);
  const [isFormOpen, setIsFormOpen] = useState(false); // Forma holati
  const t = useTranslate();

  return (
    <div className="w-full mt-20 min-h-screen p-6 md:p-10 max-w-5xl">
      {/* --- HEADER --- */}
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

        {/* OCHUVCHI TUGMA */}
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className={cn(
            "flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black uppercase italic text-sm transition-all duration-300 active:scale-95 shadow-lg",
            isFormOpen
              ? "bg-red-500 text-white shadow-red-500/20"
              : "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700",
          )}
        >
          {isFormOpen ? <X size={20} /> : <Plus size={20} />}
          {isFormOpen ? `${t("shutdown")}` : `${t("addNewCard")}`}
        </button>
      </div>

      {/* --- 1. YANGI KARTA QOSHISH FORMASI (ANIMATSIYA BILAN) --- */}
      <div
        className={cn(
          "grid transition-all duration-500 ease-in-out overflow-hidden mb-10",
          isFormOpen
            ? "grid-rows-[1fr] opacity-100 mb-12"
            : "grid-rows-[0fr] opacity-0 mb-0",
        )}
      >
        <div className="min-h-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-2xl shadow-blue-500/5">
          <h2 className="text-xl font-black uppercase italic text-slate-900 dark:text-white mb-8 flex items-center gap-2">
            <Lock size={20} className="text-blue-600" /> {t("newCardData")}
          </h2>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">
                  {t("cardNumber")}
                </label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  className="w-full mt-1 px-6 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 outline-none font-bold focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 outline-none font-bold focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <input
                  type="password"
                  placeholder="CVV"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 outline-none font-bold focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">
                  {t("cardHolder")}
                </label>
                <input
                  type="text"
                  placeholder={t("fnln")}
                  className="w-full mt-1 px-6 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 outline-none font-bold uppercase focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>
              <button
                type="button"
                className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black uppercase italic tracking-widest text-sm hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all"
              >
                {t("save")}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* --- 2. KARTALAR ROYXATI --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cards.map((card) => (
          <div
            key={card.id}
            className={cn(
              "relative h-56 w-full rounded-[2.5rem] p-8 text-white overflow-hidden transition-all duration-500 hover:scale-[1.02] shadow-2xl bg-gradient-to-br",
              card.color,
            )}
          >
            <div className="flex justify-between items-start mb-10">
              <div className="w-12 h-10 bg-yellow-500/80 rounded-lg flex items-center justify-center">
                <Cpu size={32} className="text-black/40" />
              </div>
              <Wifi size={24} className="opacity-40 rotate-90" />
            </div>

            <div className="space-y-4">
              <p className="text-2xl font-bold tracking-[0.2em]">
                {card.number}
              </p>
              <div className="flex justify-between items-end">
                <p className="text-sm font-black italic">{card.holder}</p>
                <p className="text-sm font-black italic">{card.expiry}</p>
              </div>
            </div>

            <button className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 hover:bg-red-500 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        {/* Agar karta bolmasa korinadigan bosh joy (Placeholder) */}
        {!isFormOpen && cards.length < 2 && (
          <div
            onClick={() => setIsFormOpen(true)}
            className="h-56 w-full rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-blue-500 hover:border-blue-500/50 transition-all cursor-pointer group"
          >
            <div className="p-4 rounded-full bg-slate-100 dark:bg-white/5 group-hover:bg-blue-500/10">
              <Plus size={30} />
            </div>
            <span className="font-bold uppercase italic text-xs tracking-widest">
              Yangi karta qoshish
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
