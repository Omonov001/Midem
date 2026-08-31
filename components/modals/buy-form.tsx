"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ui/theme-provider";
import {
  IoCloseOutline,
  IoShieldCheckmarkOutline,
  IoCardOutline,
} from "react-icons/io5";

interface BuyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameTitle: string;
  gamePrice: string;
  gameId: string;
}

export default function BuyFormModal({
  isOpen,
  onClose,
  gameTitle,
  gamePrice,
  gameId,
}: BuyFormModalProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    if (!gameId) {
      alert("Oyin ID topilmadi!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error || "To'lovni boshlashda xatolik yuz berdi!");
      }

      // Lemon Squeezy Checkout
      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error("Checkout Error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "To'lovni boshlashda xatolik yuz berdi!",
      );

      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={cn(
          "w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl border relative flex flex-col gap-6 animate-in zoom-in-95 duration-200",
          isDark
            ? "bg-[#171a21] border-white/10 text-white"
            : "bg-white border-slate-200 text-slate-900",
        )}
      >
        {/* CLOSE */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 transition-all cursor-pointer disabled:opacity-40"
        >
          <IoCloseOutline size={20} />
        </button>

        {/* HEADER */}
        <div className="space-y-2 pr-8">
          <h3 className="text-xl font-black italic uppercase tracking-tight text-blue-500">
            Oyinni xarid qilish
          </h3>

          <p className="text-sm font-semibold opacity-70 italic break-words">
            {gameTitle}
          </p>
        </div>

        {/* PRICE */}
        <div
          className={cn(
            "rounded-2xl border p-5 flex items-center justify-between",
            isDark
              ? "bg-white/5 border-white/10"
              : "bg-slate-50 border-slate-200",
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <IoCardOutline size={23} />
            </div>

            <div>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-50">
                Narx
              </p>

              <p className="text-lg font-black text-emerald-500">{gamePrice}</p>
            </div>
          </div>
        </div>

        {/* PAYMENT INFO */}
        <div
          className={cn(
            "rounded-2xl border p-4 flex gap-3",
            isDark
              ? "bg-blue-500/5 border-blue-500/10"
              : "bg-blue-50 border-blue-100",
          )}
        >
          <IoShieldCheckmarkOutline
            className="text-blue-500 shrink-0 mt-0.5"
            size={20}
          />

          <div>
            <p className="text-xs font-black uppercase">Xavfsiz tolov</p>

            <p className="text-[11px] opacity-60 mt-1 leading-relaxed">
              Tolov Lemon Squeezy orqali amalga oshiriladi. Karta
              malumotlaringiz MIDEM serverida saqlanmaydi.
            </p>
          </div>
        </div>

        {/* CHECKOUT BUTTON */}
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          className={cn(
            "w-full py-4 px-6 rounded-xl font-black text-xs uppercase italic shadow-lg flex items-center justify-center gap-2 transition-all text-white",
            loading
              ? "bg-slate-600 opacity-70 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 active:scale-95 cursor-pointer",
          )}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Yonaltirilmoqda...
            </>
          ) : (
            <>
              <IoCardOutline size={18} />
              Tolovga otish ({gamePrice})
            </>
          )}
        </button>

        <p className="text-[9px] text-center uppercase tracking-wider opacity-40 font-bold">
          TEST MODE
        </p>
      </div>
    </div>
  );
}
