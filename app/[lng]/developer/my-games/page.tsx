"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Plus,
  Gamepad2,
  Pencil,
  Globe,
  Search,
  Link as LinkIcon,
  Monitor,
  Smartphone,
  Laptop,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_GAMES, GameData, LanguageType } from "@/constants"; // constants faylingizdan tiplar va malumotlar

const LANGUAGES: { code: LanguageType; label: string }[] = [
  { code: "uz", label: "Ozbekcha" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
  { code: "tr", label: "Türkçe" },
];

export default function MyGamesPage() {
  const [gamesList] = useState<GameData[]>(MOCK_GAMES);
  const [activeLang, setActiveLang] = useState<LanguageType>("uz");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "public" | "private"
  >("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Qidiruv va Visibility (Status) boyicha saralash
  const filteredGames = gamesList.filter((game) => {
    const matchesStatus =
      filterStatus === "all" || game.visibility === filterStatus;

    const currentLangData = game.langData[activeLang];
    const matchesSearch = currentLangData?.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="w-full my-20 max-w-[1100px] mx-auto space-y-8 p-2 sm:p-4 md:p-0 animate-in fade-in duration-500">
      {/* HEADER NOMLANISHI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Gamepad2 className="text-blue-600 dark:text-blue-400" size={32} />
            Mening Oyinlarim
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Siz tomondan yaratilgan va yuklangan oyin loyihalarining umumiy
            boshqaruv paneli.
          </p>
        </div>
        <Link
          href="/developer/create-games"
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
        >
          <Plus size={18} /> Yangi oyin loyihasi
        </Link>
      </div>

      {/* FILTRLAR VA QIDIRUV SATHI */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        {/* Tillar paneli (uz, ru, en, tr) */}
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
              placeholder="Oyin nomini qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border text-xs font-medium outline-none bg-slate-50/50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-blue-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as "all" | "public" | "private")
            }
            className="px-3 py-2 rounded-xl border text-xs font-bold bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500"
          >
            <option value="all">Barchasi</option>
            <option value="public">Ommaviy (Public)</option>
            <option value="private">Yashirin (Private)</option>
          </select>
        </div>
      </div>

      {/* GAMES GRID */}
      {filteredGames.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900/10 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
          <p className="text-slate-400 dark:text-slate-500 font-medium text-sm">
            Mos keladigan oyin loyihasi topilmadi.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGames.map((game) => {
            const currentLangData = game.langData[activeLang];
            const isPublic = game.visibility === "public";

            // Tuzilmangizdagi screenshotPreviews yoki iconPreviewni birinchi rasm sifatida olish
            const gameImage =
              currentLangData?.screenshotPreviews?.[0] ||
              currentLangData?.iconPreview ||
              "";

            return (
              <div
                key={game.id}
                className="group bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden flex flex-col shadow-md hover:shadow-xl transition-all duration-300"
              >
                {/* RASM VA PLATFORMA/STATUS BELGILARI */}
                <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
                  {gameImage ? (
                    <img
                      src={gameImage}
                      alt={currentLangData?.title || "Game Preview"}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1 bg-slate-100 dark:bg-slate-950">
                      <Gamepad2 size={36} strokeWidth={1} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">
                        Rasm mavjud emas
                      </span>
                    </div>
                  )}

                  {/* VISIBILITY BADGE */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md text-white",
                        isPublic ? "bg-emerald-500/90" : "bg-amber-500/90",
                      )}
                    >
                      {isPublic ? <Eye size={12} /> : <EyeOff size={12} />}
                      {isPublic ? "Public" : "Private"}
                    </span>
                  </div>

                  {/* PRICE BADGE */}
                  <div className="absolute bottom-3 right-3">
                    <span
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-white shadow-md backdrop-blur-md",
                        game.priceType === "free"
                          ? "bg-blue-600/90"
                          : "bg-purple-600/90",
                      )}
                    >
                      <Coins size={11} />
                      {game.priceType === "free" ? "Tekin" : game.price}
                    </span>
                  </div>
                </div>

                {/* DETALLAR QISMI */}
                <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                  <div className="space-y-2">
                    {/* Platforma va Kategoriya sathi */}
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500">
                      <span className="text-blue-500 dark:text-blue-400 uppercase tracking-widest">
                        {currentLangData?.category || "Kategoriya yoq"}
                      </span>

                      {/* Platforma ikonkalari */}
                      <span className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-400">
                        {game.platform === "pc" && <Monitor size={12} />}
                        {game.platform === "mobile" && <Smartphone size={12} />}
                        {game.platform === "both" && <Laptop size={12} />}
                        <span className="capitalize text-[10px]">
                          {game.platform}
                        </span>
                      </span>
                    </div>

                    {/* Sarlavha va Kichik Tarif */}
                    <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-500 transition-colors">
                      {currentLangData?.title || "Sarlavha kiritilmagan"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {currentLangData?.Maindescription ||
                        currentLangData?.description}
                    </p>

                    {/* SLUG KORINISHI */}
                    <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 truncate bg-blue-500/5 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 mt-2">
                      <LinkIcon size={12} className="shrink-0 text-blue-400" />
                      <span className="truncate">/games/{game.slug}</span>
                    </div>
                  </div>

                  {/* TAHRIRLASH CHIQISH TUGMASI */}
                  <div className="pt-3 border-t border-slate-100 dark:border-white/5">
                    <Link
                      href={`/developer/my-games/${game.slug}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-all text-center"
                    >
                      <Pencil size={14} /> Tahrirlash (Edit)
                    </Link>
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
