"use client";

import { useState, useRef } from "react";
import {
  Newspaper,
  Image as ImageIcon,
  Send,
  Layers,
  Globe,
  Upload,
  X,
  Maximize2,
  Eye,
  EyeOff,
  Link as LinkIcon, // Slug uchun yangi ikonka
} from "lucide-react";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "uz", label: "O'zbekcha" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
  { code: "tu", label: "Türkçe" },
];

interface BannerImage {
  file: File;
  preview: string;
}

// Matndan chiroyli slug yasovchi yordamchi funksiya
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/['’‘` roll]/g, "") // Tutuq belgilari va qo'shtirnoqlarni tozalash
    .replace(/[oO]’|[oO]‘/g, "o")
    .replace(/[gG]’|[gG]‘/g, "g")
    .replace(/[^a-z0-9а-яёўқғҳ\s-]/g, "") // Maxsus belgilarni tozalash (kirillni ham qo'llaydi)
    .trim()
    .replace(/\s+/g, "-") // Bo'shliqlarni chiziqchaga almashtirish
    .replace(/-+/g, "-"); // Ketma-ket chiziqchalarni bittaga tushirish
};

export default function CreateNewsPage() {
  const [activeLang, setActiveLang] = useState("uz");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(
    null,
  );

  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [slug, setSlug] = useState<string>(""); // --- SLUG STATE ---

  const [translations, setTranslations] = useState({
    uz: { title: "", content: "", banners: [] as BannerImage[] },
    ru: { title: "", content: "", banners: [] as BannerImage[] },
    en: { title: "", content: "", banners: [] as BannerImage[] },
    tu: { title: "", content: "", banners: [] as BannerImage[] },
  });

  const [selectedGame, setSelectedGame] = useState("");

  const myGames = [
    { id: "1", title: "Shadowbound: Chronicle" },
    { id: "2", title: "Cyber Neon: Drift" },
  ];

  const handleTextChange = (
    lang: string,
    field: "title" | "content",
    value: string,
  ) => {
    setTranslations((prev) => ({
      ...prev,
      [lang]: { ...prev[lang as keyof typeof prev], [field]: value },
    }));

    // Agar o'zbekcha sarlavha o'zgarsa, avtomatik slug yaratadi
    if (lang === "uz" && field === "title") {
      setSlug(generateSlug(value));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newBanners: BannerImage[] = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setTranslations((prev) => ({
        ...prev,
        [activeLang]: {
          ...prev[activeLang as keyof typeof prev],
          banners: [
            ...prev[activeLang as keyof typeof prev].banners,
            ...newBanners,
          ],
        },
      }));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (e: React.MouseEvent, indexToRemove: number) => {
    e.stopPropagation();
    setTranslations((prev) => {
      const currentBanners = prev[activeLang as keyof typeof prev].banners;
      URL.revokeObjectURL(currentBanners[indexToRemove].preview);

      const filteredBanners = currentBanners.filter(
        (_, index) => index !== indexToRemove,
      );

      return {
        ...prev,
        [activeLang]: {
          ...prev[activeLang as keyof typeof prev],
          banners: filteredBanners,
        },
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Yuborishga tayyor malumotlar:", {
      slug, // --- BAZAGA YUBORISH UCHUN SLUG ---
      translations,
      selectedGame,
      isPublic,
    });
  };

  const currentLangData = translations[activeLang as keyof typeof translations];

  return (
    <div className="w-full ml-5 max-w-5xl my-16 mx-auto p-4 md:p-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* HEADER */}
      <div className="flex flex-col gap-1 animate-in duration-500 fill-mode-forwards delay-75">
        <div>
          <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            Yangi Yangilik Qoʻshish
          </h1>
          <p className="text-sm mt-1 text-slate-400 font-medium">
            Har bir til uchun alohida matn va rasmlar galereyasini kiriting.
          </p>
        </div>
      </div>

      {/* TILLAR VA STATUS SATRI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full animate-in duration-500 fill-mode-forwards delay-100">
        {/* TILLAR ROYXATI */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl w-fit border border-slate-200/50 dark:border-white/5 overflow-x-auto max-w-full">
          {LANGUAGES.map((lang) => {
            const current =
              translations[lang.code as keyof typeof translations];
            const isFilled = current.title.length > 0;
            const hasImages = current.banners.length > 0;

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setActiveLang(lang.code)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0",
                  activeLang === lang.code
                    ? "bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm scale-102"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-white/5",
                )}
              >
                <Globe
                  size={14}
                  className={cn(
                    "transition-colors",
                    isFilled && "text-emerald-500",
                  )}
                />
                {lang.label}
                {hasImages && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-blue-500 text-white dark:bg-blue-600 rounded-md font-black animate-scale-in">
                    {current.banners.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* PUBLIC / PRIVATE STATUS */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl w-full sm:w-fit border border-slate-200/50 dark:border-white/5">
          <button
            type="button"
            onClick={() => setIsPublic(true)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 w-full sm:w-auto justify-center",
              isPublic
                ? "bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
            )}
          >
            <Eye size={14} />
            Ommaviy
          </button>
          <button
            type="button"
            onClick={() => setIsPublic(false)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 w-full sm:w-auto justify-center",
              !isPublic
                ? "bg-white dark:bg-slate-950 text-amber-600 dark:text-amber-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
            )}
          >
            <EyeOff size={14} />
            Yashirin
          </button>
        </div>
      </div>

      {/* FORMA */}
      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-3 items-start"
      >
        {/* KONTENT QISMI */}
        <div className="lg:col-span-2 space-y-6 p-6 sm:p-8 bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-100/50 dark:shadow-none  animate-in duration-500 fill-mode-forwards delay-150">
          <div className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1.5 rounded-xl w-fit">
            Kiritilayotgan til:{" "}
            {LANGUAGES.find((l) => l.code === activeLang)?.label}
          </div>

          {/* Sarlavha */}
          <div className="space-y-2.5">
            <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Newspaper size={16} className="text-slate-400" /> Sarlavha
            </label>
            <input
              type="text"
              required={activeLang === "uz"}
              value={currentLangData.title}
              onChange={(e) =>
                handleTextChange(activeLang, "title", e.target.value)
              }
              placeholder="Sarlavha matnini kiriting..."
              className={cn(
                "w-full px-4 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200 outline-none bg-slate-50/50 dark:bg-white/5",
                "border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:shadow-sm focus:shadow-blue-500/5",
                "dark:border-white/10 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900/50",
              )}
            />
          </div>

          {/* URL Manzili (Slug) */}
          <div className="space-y-2.5">
            <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <LinkIcon size={16} className="text-slate-400" /> URL Manzili
              (Slug)
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              placeholder="o'zbekcha-sarlavhadan-avtomatik-yasaladi"
              className={cn(
                "w-full px-4 py-3.5 rounded-xl border text-sm font-mono transition-all duration-200 outline-none bg-slate-50/50 dark:bg-white/5",
                "border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:shadow-sm",
                "dark:border-white/10 dark:text-slate-300 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900/50",
              )}
            />
          </div>

          {/* Matn */}
          <div className="space-y-2.5">
            <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
              Maqola batafsil matni
            </label>
            <textarea
              required={activeLang === "uz"}
              rows={9}
              value={currentLangData.content}
              onChange={(e) =>
                handleTextChange(activeLang, "content", e.target.value)
              }
              placeholder="Bu yerga batafsil ma'lumotlarni yozishingiz mumkin..."
              className={cn(
                "w-full px-4 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200 outline-none resize-none bg-slate-50/50 dark:bg-white/5",
                "border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:shadow-sm",
                "dark:border-white/10 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900/50",
              )}
            />
          </div>
        </div>

        {/* SOZLAMALAR VA RASM YUKLASH */}
        <div className="space-y-6  animate-in duration-500 fill-mode-forwards delay-200">
          <div className="p-6 bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-5">
            {/* O'yin tanlash */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Layers size={14} className="text-slate-400" /> Tegishli Oʻyin
              </label>
              <select
                required
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border text-sm font-medium bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all duration-200"
              >
                <option value="" disabled className="dark:bg-slate-900">
                  Oyinni tanlang
                </option>
                {myGames.map((game) => (
                  <option
                    key={game.id}
                    value={game.id}
                    className="dark:bg-slate-900"
                  >
                    {game.title}
                  </option>
                ))}
              </select>
            </div>

            {/* KO'P RASM YUKLASH */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <ImageIcon size={14} className="text-slate-400" /> Muqova
                rasmlari ({activeLang.toUpperCase()})
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />

              {currentLangData.banners.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {currentLangData.banners.map((banner, index) => (
                    <div
                      key={index}
                      onClick={() => setActivePreviewImage(banner.preview)}
                      className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 group aspect-video bg-slate-100 dark:bg-slate-950 cursor-zoom-in"
                    >
                      <img
                        src={banner.preview}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center  group-hover:opacity-100 transition-opacity pointer-events-none duration-200">
                        <Maximize2
                          size={16}
                          className="text-white drop-shadow-md scale-95 group-hover:scale-100 transition-transform duration-200"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={(e) => removeFile(e, index)}
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/70 text-white hover:bg-red-600 transition-all opacity-100 lg: lg:group-hover:opacity-100 z-10 duration-150"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-full h-24 flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]",
                  "border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 text-slate-400 hover:text-blue-500",
                  "dark:border-white/10 dark:hover:border-blue-500 dark:hover:bg-blue-500/5 dark:text-slate-500",
                )}
              >
                <Upload size={18} />
                <span className="text-xs font-bold tracking-wide">
                  Rasm qoʻshish
                </span>
              </button>
            </div>
          </div>

          {/* TUGMA */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm tracking-wide text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
          >
            <Send size={16} /> Yangilikni Chop Etish
          </button>
        </div>
      </form>

      {/* LIGHTBOX MODAL */}
      {activePreviewImage && (
        <div
          onClick={() => setActivePreviewImage(null)}
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center select-none">
            <button
              type="button"
              onClick={() => setActivePreviewImage(null)}
              className="absolute -top-12 right-0 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all duration-150"
            >
              <X size={20} />
            </button>

            <img
              src={activePreviewImage}
              alt="Kattalashtirilgan rasm"
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
            />
          </div>
        </div>
      )}
    </div>
  );
}
