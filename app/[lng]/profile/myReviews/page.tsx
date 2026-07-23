"use client";

import {
  Star,
  MessageSquare,
  Edit3,
  Trash2,
  Gamepad2,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import useTranslate from "@/hooks/use-translate";

// Demo ma'lumotlar
const myReviews = [
  {
    slug: "/games/pc-games/1",
    id: 1,
    gameTitle: "Elden Ring",
    gameImage: "",
    rating: 5,
    comment:
      "Bu o'yin shunchaki durdona! Grafikasi va dunyosi meni hayratda qoldirdi. Qiyinchilik darajasi esa haqiqiy chaqiriq.",
    date: "12 May, 2024",
  },
  {
    slug: "/news/1",
    id: 2,
    gameTitle: "Cyberpunk 2077",
    gameImage: "",
    rating: 4,
    comment:
      "Yaxshi o'yin, lekin hali ham ba'zi xatoliklar bor. Hikoyasi esa daxshatli darajada zo'r ishlangan.",
    date: "05 Aprel, 2024",
  },
];

function Page() {
  const t = useTranslate();
  return (
    <div className="w-full min-h-screen mt-20 p-6 md:p-10 max-w-6xl">
      {/* --- HEADER --- */}
      <div className="relative mb-12">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <MessageSquare size={28} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
            {t("myReviews")}
          </h1>
        </div>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-transparent rounded-full" />
        <p className="mt-4 text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">
          {t("All")}: {myReviews.length}
        </p>
      </div>

      {/* --- REVIEWS LIST --- */}
      <div className="grid grid-cols-1 gap-6">
        {myReviews.map((review) => (
          <div
            key={review.id}
            className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-6 md:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5"
          >
            <div className="flex flex-col md:flex-row gap-8">
              {/* Review Content */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Gamepad2 size={14} className="text-blue-600" />
                      <Link href={review.slug}>
                        <h3 className="text-xl font-black uppercase italic tracking-tight dark:text-white">
                          {review.gameTitle}
                        </h3>
                      </Link>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={cn(
                            "transition-all duration-300",
                            i < review.rating
                              ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]"
                              : "text-slate-200 dark:text-slate-800",
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <Calendar size={14} />
                    {review.date}
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-6 italic">
                  {review.comment}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase hover:bg-blue-600 hover:text-white transition-all active:scale-95">
                    <Edit3 size={14} />
                    {t("edit")}
                  </button>
                  <button className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Subtle "Fanarcha" effect on hover */}
            <div className="absolute -z-10 inset-0 bg-blue-500/0 group-hover:bg-blue-500/[0.02] rounded-[2.5rem] transition-colors duration-500" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Page;
