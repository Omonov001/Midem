"use client";

import React, { useState } from "react";

interface Review {
  id: number;
  gameName: string;
  comment: string;
  rating: number;
  author: string; // Kim yozganligi
  createdAt: string; // Qachon yozilganligi
}

export default function Page() {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      gameName: "Midem: The Beginning",
      comment: "Grafika va mexanika judayam zor chiqibdi!",
      rating: 5,
      author: "Asadbek_Gamer",
      createdAt: "2 daq oldin",
    },
    {
      id: 2,
      gameName: "Midem: Arena",
      comment:
        "Biroz qiyinroq ekan, lekin qiziqarli. Keyingi yangilanishlarni kutyapmiz.",
      rating: 4,
      author: "Bekzod_Dev",
      createdAt: "1 soat oldin",
    },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editGameName, setEditGameName] = useState("");
  const [editComment, setEditComment] = useState("");
  const [editRating, setEditRating] = useState(5);

  const handleDelete = (id: number) => {
    setReviews(reviews.filter((review) => review.id !== id));
  };

  const startEdit = (review: Review) => {
    setEditingId(review.id);
    setEditGameName(review.gameName);
    setEditComment(review.comment);
    setEditRating(review.rating);
  };

  const handleSave = (id: number) => {
    setReviews(
      reviews.map((review) =>
        review.id === id
          ? {
              ...review,
              gameName: editGameName,
              comment: editComment,
              rating: editRating,
            }
          : review,
      ),
    );
    setEditingId(null);
  };

  return (
    // transition-all va opacity/translate klasslari orqali sahifa kirgandagi silliqlik
    <div className="w-full min-h-screen p-2 font-sans my-20 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Sarlavha Paneli */}
      <div className="relative overflow-hidden w-full p-8 mb-8 rounded-2xl bg-gradient-to-br from-[#121829] to-[#0d1222] border border-slate-800/40 shadow-2xl transition-all duration-300">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
            Mening oyinim izohlari
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
            MIDEM platformasidagi oyinlaringiz statistikasi va geymerlar
            faolligini real vaqt rejimida boshqaring.
          </p>
        </div>
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Izohlar Royxati */}
      <div className="space-y-4 max-w-5xl">
        {reviews.map((review, index) => {
          const isEditing = editingId === review.id;
          return (
            <div
              key={review.id}
              // style orqali har bir kartaga ketma-ket (staggered) chiqish kechikishi berildi
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
              className="p-6 bg-[#0d1527] rounded-xl border border-slate-800/50 hover:border-slate-700/60 transition-all duration-300 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards"
            >
              {/* 1. KORISH REJIMI PANEL */}
              <div
                className={`flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-500 ${isEditing ? "opacity-30 filter blur-[1px] transform scale-[0.99]" : "opacity-100"}`}
              >
                <div className="space-y-2 flex-1">
                  {/* Muallif va Vaqt */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="text-slate-300 font-semibold">
                      {review.author}
                    </span>
                    <span>•</span>
                    <span>{review.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-base font-bold text-white tracking-wide">
                      {review.gameName}
                    </h3>
                    <div className="flex items-center gap-0.5 text-amber-400 text-[10px] tracking-wider bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10 select-none">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
                    {review.comment}
                  </p>
                </div>

                {/* Ochirish va Tahrirlash Tugmalari */}
                <div className="flex gap-2 self-end md:self-center">
                  <button
                    onClick={() => startEdit(review)}
                    className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 shadow-md shadow-blue-600/10"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="bg-red-600 hover:bg-red-500 active:scale-95 text-white px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 shadow-md shadow-red-600/10"
                  >
                    Ochirish
                  </button>
                </div>
              </div>

              {/* 2. TAHRIRLASH REJIMI */}
              <div
                className={`grid transition-all duration-500 ease-in-out ${isEditing ? "grid-rows-[1fr] opacity-100 mt-5 pt-5 border-t border-slate-800/60" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Oyin Nomi
                      </label>
                      <input
                        type="text"
                        value={editGameName}
                        onChange={(e) => setEditGameName(e.target.value)}
                        className="w-full p-3 rounded-xl text-sm bg-[#070a13] border border-slate-800/80 focus:border-indigo-500 text-white focus:outline-none transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Yulduzcha (1-5)
                      </label>
                      <select
                        value={editRating}
                        onChange={(e) => setEditRating(Number(e.target.value))}
                        className="w-full p-3 rounded-xl bg-[#070a13] border border-slate-800/80 text-sm font-medium text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n} className="bg-[#0d1527]">
                            {n} ★
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Izoh matnini ozgartirish
                    </label>
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      rows={3}
                      className="w-full p-3 rounded-xl text-sm bg-[#070a13] border border-slate-800/80 focus:border-indigo-500 text-white focus:outline-none resize-none transition-all duration-200"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleSave(review.id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 shadow-lg shadow-indigo-600/10"
                    >
                      Saqlash
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95"
                    >
                      Bekor qilish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
