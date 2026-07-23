"use client";

import { IoClose, IoSend, IoStar } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { useState } from "react";
import useTranslate from "@/hooks/use-translate";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

// Helper komponent: Reytingni chiroyli ko'rsatish uchun
function StarRatingStatic({
  value,
  size = 12,
}: {
  value: number;
  size?: number;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <IoStar
          key={s}
          size={size}
          className={s <= value ? "text-orange-500" : "text-slate-500/30"}
        />
      ))}
    </div>
  );
}

export default function CommentModal({
  isOpen,
  onClose,
  isDark,
}: CommentModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const t = useTranslate();

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[100] bg-black/60 h-full backdrop-blur-sm transition-opacity duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-[101] h-full w-full max-w-md p-8 transition-transform duration-500 ease-out shadow-2xl",
          isDark
            ? "bg-[#0b0e14] border-l border-white/10 text-slate-300"
            : "bg-white border-l border-slate-200 text-slate-900",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">
              {t("thoughts")}
            </h2>
            <button
              onClick={onClose}
              className={cn(
                "p-2 rounded-full transition-all hover:rotate-90",
                isDark ? "hover:bg-white/10" : "hover:bg-black/5",
              )}
            >
              <IoClose size={32} />
            </button>
          </div>

          {/* RATING SELECTION SECTION (Interaktiv yulduzlar) */}
          <div
            className={cn(
              "p-6 rounded-[2rem] mb-8 border transition-all",
              isDark
                ? "bg-white/5 border-white/10"
                : "bg-slate-50 border-slate-200",
            )}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-50 text-center">
              {t("YourRate")}
            </p>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  className="transition-all duration-200 transform active:scale-75"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                >
                  <IoStar
                    size={36}
                    className={cn(
                      "transition-colors duration-200",
                      s <= (hover || rating)
                        ? "text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                        : "text-slate-500/20",
                    )}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-4 text-center text-xs font-bold text-orange-500 uppercase tracking-widest animate-pulse">
                {t("YourChoice")}: {rating} {t("score")}!
              </p>
            )}
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 mb-6">
            {[
              { u: "Admin", t: "O'yin vapshe bomba gap yo'q!", r: 5 },
              {
                u: "Gamer99",
                t: "Grafika sal kuchsizroq, lekin gameplay daxshat.",
                r: 4,
              },
              { u: "UZ_Master", t: "Kutganimdan ham yaxshi chiqdi.", r: 5 },
            ].map((comment, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-4 rounded-2xl border transition-all hover:border-blue-500/30",
                  isDark
                    ? "bg-white/[0.02] border-white/5"
                    : "bg-slate-50 border-slate-200",
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm tracking-tight">
                    {comment.u}
                  </span>
                  <StarRatingStatic value={comment.r} />
                </div>
                <p className="text-xs opacity-70 italic leading-relaxed">
                  {comment.t}
                </p>
              </div>
            ))}
          </div>

          {/* Footer Input Area */}
          <div className="mt-auto pt-4 border-t border-white/5">
            <div className="relative group">
              <input
                type="text"
                placeholder={`${t("WriteYourOpinion")}...`}
                className={cn(
                  "w-full p-5 pr-16 rounded-2xl border outline-none font-medium transition-all",
                  isDark
                    ? "bg-white/5 border-white/10 focus:border-blue-500 focus:bg-white/[0.08]"
                    : "bg-slate-100 border-slate-300 focus:border-blue-600 focus:bg-white shadow-inner",
                )}
              />
              <button
                className={cn(
                  "absolute right-3 top-3 p-3 text-white rounded-xl transition-all active:scale-90",
                  rating > 0
                    ? "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20"
                    : "bg-slate-500 cursor-not-allowed opacity-50",
                )}
                disabled={rating === 0}
              >
                <IoSend size={20} />
              </button>
            </div>
            <p className="text-[9px] mt-3 text-center opacity-40 font-bold uppercase tracking-widest">
              {t("CommentText")}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </>
  );
}
