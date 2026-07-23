"use client";

import { useState } from "react";
import {
  Newspaper,
  Globe,
  Eye,
  EyeOff,
  Calendar,
  Layers,
  Plus,
  Trash2,
  Edit3,
  Search,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_NEWS, NewsItem } from "@/constants"; // constants/index.ts faylidagi malumotlar yoli

const LANGUAGES = [
  { code: "uz", label: "Ozbekcha" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
  { code: "tu", label: "Türkçe" },
];

export default function MyNewsPage() {
  const [newsList, setNewsList] = useState<NewsItem[]>(MOCK_NEWS);
  const [activeLang, setActiveLang] = useState("uz");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "public" | "private"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Ochirish simulyatsiyasi
  const handleDelete = (id: string) => {
    if (confirm("Ushbu yangilikni ochirishni xohlaysizmi?")) {
      setNewsList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Qidiruv va Status boyicha filtrlash
  const filteredNews = newsList.filter((item) => {
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "public" && item.isPublic) ||
      (filterStatus === "private" && !item.isPublic);

    const currentLangData =
      item.translations[activeLang as keyof typeof item.translations];
    const matchesSearch = currentLangData?.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="w-full my-20 max-w-[1100px] mx-auto space-y-8 p-2 sm:p-4 md:p-0 animate-in fade-in duration-500">
      {/* HEADER PART */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Newspaper className="text-blue-600" size={28} /> Yangiliklarim
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Yaratilgan barcha yangiliklarni kuzatish va tillar boyicha
            boshqarish paneli.
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all">
          <Plus size={16} /> Yangi qoshish
        </button>
      </div>

      {/* FILTRLAR VA QIDIRUV SATHI */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        {/* Tilni almashtirish paneli */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-xl overflow-x-auto max-w-full">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setActiveLang(lang.code)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shrink-0",
                activeLang === lang.code
                  ? "bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
              )}
            >
              <Globe size={12} />
              {lang.code}
            </button>
          ))}
        </div>

        {/* Qidiruv va Status selecti */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Sarlavha boyicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border text-xs font-medium outline-none bg-slate-50/50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-blue-500"
            />
          </div>

          <select
            value={filterStatus}
            // any o'rniga aniq qiymat:
            onChange={(e) =>
              setFilterStatus(e.target.value as "all" | "public" | "private")
            }
            className="px-3 py-2 rounded-xl border text-xs font-bold bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500"
          >
            <option value="all">Barchasi</option>
            <option value="public">Ommaviy</option>
            <option value="private">Yashirin</option>
          </select>
        </div>
      </div>

      {/* YANGILIKLAR ROYXATI GRID */}
      {filteredNews.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900/10 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
          <p className="text-slate-400 dark:text-slate-500 font-medium text-sm">
            Mos keladigan yangilik topilmadi.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredNews.map((item) => {
            const langData =
              item.translations[activeLang as keyof typeof item.translations];
            const hasTranslation = langData && langData.title.length > 0;

            return (
              <div
                key={item.id}
                className="flex flex-col bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group"
              >
                {/* Muqova rasmi */}
                <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
                  {hasTranslation && langData.banners.length > 0 ? (
                    <img
                      src={langData.banners[0]}
                      alt="Banner"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1">
                      <Newspaper size={32} strokeWidth={1} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">
                        Rasm yoq
                      </span>
                    </div>
                  )}

                  {/* Public/Private Status belgisi */}
                  <div
                    className={cn(
                      "absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm backdrop-blur-md text-white",
                      item.isPublic ? "bg-emerald-500/90" : "bg-amber-500/90",
                    )}
                  >
                    {item.isPublic ? <Eye size={12} /> : <EyeOff size={12} />}
                    {item.isPublic ? "Public" : "Private"}
                  </div>
                </div>

                {/* Kontent qismi */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Oyin va Sana */}
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-400">
                        <Layers size={12} /> {item.gameTitle}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {item.createdAt}
                      </span>
                    </div>

                    {/* Sarlavha va Matn */}
                    {hasTranslation ? (
                      <>
                        <h3 className="font-black text-base text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-500 transition-colors">
                          {langData.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                          {langData.content}
                        </p>
                      </>
                    ) : (
                      <div className="py-4 text-center border border-dashed border-amber-500/20 rounded-xl bg-amber-500/5">
                        <p className="text-xs text-amber-500 font-bold">
                          Bu tilda ({activeLang.toUpperCase()}) malumot
                          kiritilmagan.
                        </p>
                      </div>
                    )}

                    {/* SLUG DINAMIK MANZILI */}
                    <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 truncate bg-blue-500/5 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                      <LinkIcon size={12} className="shrink-0 text-blue-400" />
                      <span className="truncate">/news/{item.slug}</span>
                    </div>
                  </div>

                  {/* BOSHQARISH TUGMALARI */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                    <button
                      type="button"
                      className="p-2 rounded-xl text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                      title="Tahrirlash"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                      title="Ochirish"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
