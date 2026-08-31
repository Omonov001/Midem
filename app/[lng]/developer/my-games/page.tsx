/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
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
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IGameDocument, LanguageType } from "@/models/game.model";

const LANGUAGES: { code: LanguageType; label: string }[] = [
  { code: "uz", label: "Ozbekcha" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
  { code: "tr", label: "Türkçe" },
];

export default function MyGamesPage() {
  const [gamesList, setGamesList] = useState<IGameDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeLang, setActiveLang] = useState<LanguageType>("uz");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "public" | "private"
  >("all");
  const [filterRequest, setFilterRequest] = useState<
    "all" | "requested" | "approved" | "rejected"
  >("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 🛡️ MODAL & DELETION STATE
  const [selectedDeleteGame, setSelectedDeleteGame] =
    useState<IGameDocument | null>(null);
  const [typedTitle, setTypedTitle] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchDeveloperGames() {
      try {
        setLoading(true);
        const res = await fetch("/api/developer/games");

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Oyinlarni bazadan yuklab bolmadi",
          );
        }

        const data = await res.json();
        if (isMounted) {
          setGamesList(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Xatolik roy berdi");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDeveloperGames();

    return () => {
      isMounted = false;
    };
  }, []);

  // 🛡️ OCHIRISH BOYICHA ISHLOVCHI
  const handleDeleteGame = async () => {
    if (!selectedDeleteGame) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);

      const targetTitle =
        selectedDeleteGame.langData?.[activeLang]?.title ||
        selectedDeleteGame.slug;

      const res = await fetch(`/api/games/${selectedDeleteGame.slug}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirmTitle: typedTitle.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Ochirishda xatolik yuz berdi");
      }

      // UI dan olib tashlaymiz
      setGamesList((prev) =>
        prev.filter((g) => g.slug !== selectedDeleteGame.slug),
      );

      // Modalni yopish
      closeDeleteModal();
    } catch (err: any) {
      setDeleteError(err.message || "Serverda xatolik yuz berdi");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (game: IGameDocument) => {
    setSelectedDeleteGame(game);
    setTypedTitle("");
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    setSelectedDeleteGame(null);
    setTypedTitle("");
    setDeleteError(null);
  };

  // Qidiruv va filtrlar
  const filteredGames = gamesList.filter((game) => {
    const matchesStatus =
      filterStatus === "all" || game.visibility === filterStatus;
    const currentRequest = game.request || "requested";
    const matchesRequest =
      filterRequest === "all" || currentRequest === filterRequest;
    const currentLangData = game.langData?.[activeLang];
    const matchesSearch = currentLangData?.title
      ? currentLangData.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesStatus && matchesRequest && matchesSearch;
  });

  return (
    <div className="w-full my-20 max-w-[1100px] mx-auto space-y-8 p-2 sm:p-4 md:p-0 animate-in fade-in duration-500 relative">
      {/* 🛡️ XAVFSIZ OCHIRISH MODALI */}
      {selectedDeleteGame && (
        <div className="fixed inset-0 z-[9999] h-full bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-red-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6">
            {/* Yopish tugmasi */}
            <button
              onClick={closeDeleteModal}
              disabled={isDeleting}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Modal Sarlavhasi */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 shrink-0">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Oyinni Ochirish
                </h3>
                <p className="text-xs text-red-500 font-bold mt-0.5">
                  Bu amalni ortga qaytarib bolmaydi!
                </p>
              </div>
            </div>

            {/* Ogohlantirish va korsatmalari */}
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 bg-slate-100 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
              <p>
                Oyin bazadan, unga tegishli <b>R2 xotirasidagi fayllar</b>,
                rasmlar va barcha malumotlar bilan <b>butunlay ochiriladi</b>.
              </p>
              <p className="pt-2">
                Tasdiqlash uchun ushbu oyin nomini pastga kiriting:
              </p>
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-center select-all font-mono font-bold text-red-500 dark:text-red-400 text-sm">
                {selectedDeleteGame.langData?.[activeLang]?.title ||
                  selectedDeleteGame.slug}
              </div>
            </div>

            {/* Tasdiq Inputi */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Oyin nomini aynan kiriting..."
                value={typedTitle}
                onChange={(e) => setTypedTitle(e.target.value)}
                disabled={isDeleting}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-slate-500"
              />

              {deleteError && (
                <p className="text-xs font-bold text-red-500 italic mt-1">
                  {deleteError}
                </p>
              )}
            </div>

            {/* Modal Tugmalari */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
              >
                Bekor qilish
              </button>

              <button
                type="button"
                onClick={handleDeleteGame}
                disabled={
                  typedTitle.trim() !==
                    (selectedDeleteGame.langData?.[activeLang]?.title ||
                      selectedDeleteGame.slug) || isDeleting
                }
                className="flex-1 py-3 rounded-xl font-black uppercase tracking-wider text-xs text-white bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />{" "}
                    Ochirilmoqda...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} /> Ochirish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Gamepad2 className="text-blue-600 dark:text-blue-400" size={32} />
            Mening Oyinlarim
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Siz tomondan yaratilgan va yuklangan oyin loyihalarining boshqaruv
            paneli.
          </p>
        </div>
        <Link
          href="/developer/create-games"
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
        >
          <Plus size={18} /> Yangi oyin loyihasi
        </Link>
      </div>

      {/* FILTRLAR VA QIDIRUV */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
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

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 min-w-[180px] md:w-56">
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
            value={filterRequest}
            onChange={(e) => setFilterRequest(e.target.value as any)}
            className="px-3 py-2 rounded-xl border text-xs font-bold bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500"
          >
            <option value="all">Barcha holatlar</option>
            <option value="requested">⏳ Kutilmoqda</option>
            <option value="approved">✅ Tasdiqlangan</option>
            <option value="rejected">❌ Rad etilgan</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 rounded-xl border text-xs font-bold bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500"
          >
            <option value="all">Barchasi (Vis)</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>

      {/* DYNAMIK SHARTLAR */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/10 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
          <Loader2 size={32} className="animate-spin text-blue-600 mb-2" />
          <p className="text-slate-400 text-sm font-medium">
            Oyinlaringiz yuklanmoqda...
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900/10 rounded-2xl border border-dashed border-red-500/20">
          <p className="text-red-500 font-medium text-sm">{error}</p>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900/10 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
          <p className="text-slate-400 dark:text-slate-500 font-medium text-sm">
            Mos keladigan oyin loyihasi topilmadi.
          </p>
        </div>
      ) : (
        /* GAMES GRID */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGames.map((game) => {
            const currentLangData = game.langData?.[activeLang];
            const isPublic = game.visibility === "public";
            const reqStatus = game.request || "requested";

            const gameImage =
              currentLangData?.screenshotPreviews?.[0] ||
              currentLangData?.iconPreview ||
              "";

            return (
              <div
                key={(game._id as unknown as string) || game.slug}
                className="group bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden flex flex-col shadow-md hover:shadow-xl transition-all duration-300"
              >
                {/* PREVIEW IMAGE */}
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

                  {/* REQUEST BADGE */}
                  <div className="absolute top-3 right-3">
                    {reqStatus === "requested" && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/30 backdrop-blur-md shadow-md">
                        <Clock size={12} className="animate-pulse" /> Kutilmoqda
                      </span>
                    )}

                    {reqStatus === "approved" && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 backdrop-blur-md shadow-md">
                        <CheckCircle2 size={12} /> Tasdiqlangan
                      </span>
                    )}

                    {reqStatus === "rejected" && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-rose-300 bg-rose-950/80 border border-rose-500/30 backdrop-blur-md shadow-md">
                        <XCircle size={12} /> Rad etilgan
                      </span>
                    )}
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

                {/* DETAILS */}
                <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500">
                      <span className="text-blue-500 dark:text-blue-400 uppercase tracking-widest">
                        {currentLangData?.category || "Kategoriya yoq"}
                      </span>

                      <span className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-400">
                        {game.platform === "pc" && <Monitor size={12} />}
                        {game.platform === "mobile" && <Smartphone size={12} />}
                        {game.platform === "both" && <Laptop size={12} />}
                        <span className="capitalize text-[10px]">
                          {game.platform}
                        </span>
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-500 transition-colors">
                      {currentLangData?.title || "Sarlavha kiritilmagan"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {currentLangData?.Maindescription ||
                        currentLangData?.description}
                    </p>

                    <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 truncate bg-blue-500/5 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 mt-2">
                      <LinkIcon size={12} className="shrink-0 text-blue-400" />
                      <span className="truncate">/games/{game.slug}</span>
                    </div>
                  </div>

                  {/* TAHRIRLASH VA OCHIRISH TUGMALARI */}
                  <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2">
                    <Link
                      href={`/developer/my-games/${game.slug}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-all text-center"
                    >
                      <Pencil size={14} /> Tahrirlash
                    </Link>

                    <button
                      type="button"
                      onClick={() => openDeleteModal(game)}
                      className="p-2.5 rounded-xl text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-all shrink-0"
                      title="Oyinni xavfsiz ochirish"
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
