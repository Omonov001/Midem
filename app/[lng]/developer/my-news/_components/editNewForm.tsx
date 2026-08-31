/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Newspaper,
  Image as ImageIcon,
  Save,
  Layers,
  Globe,
  Upload,
  X,
  Maximize2,
  Eye,
  EyeOff,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { handleGameUpload } from "@/lib/upload";

const LANGUAGES = [
  { code: "uz", label: "Ozbekcha" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
  { code: "tu", label: "Türkçe" },
];

interface BannerImage {
  file: File | null;
  preview: string;
  url?: string;
}

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[’‘`ʻʼ]/g, "")
    .replace(/o[’‘`ʻʼ]/g, "o")
    .replace(/g[’‘`ʻʼ]/g, "g")
    .replace(/[^a-z0-9а-яёўқғҳ\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export default function EditNewsForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [activeLang, setActiveLang] = useState("uz");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [currentSlug, setCurrentSlug] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

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

  // 1. Sahifa ochilganda slug boyicha malumotlarni bazadan yuklab kelish
  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/news/${slug}`);
        const result = await res.json();

        if (result.success && result.data) {
          const item = result.data;
          setCurrentSlug(item.slug || "");
          setVisibility(item.visibility || "public");
          setSelectedGame(item.selectedGame || "");

          // Serverdan kelgan banner URL larni BannerImage formatiga otkazish
          const formattedTranslations: any = {
            uz: { title: "", content: "", banners: [] },
            ru: { title: "", content: "", banners: [] },
            en: { title: "", content: "", banners: [] },
            tu: { title: "", content: "", banners: [] },
          };

          if (item.translations) {
            for (const lang of Object.keys(item.translations)) {
              const langData = item.translations[lang];
              const banners =
                langData.banners?.map((url: string) => ({
                  file: null,
                  preview: url,
                  url: url,
                })) || [];

              formattedTranslations[lang] = {
                title: langData.title || "",
                content: langData.content || "",
                banners,
              };
            }
          }

          setTranslations(formattedTranslations);
        }
      } catch (error) {
        console.error("Malumotni yuklashda xatolik:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchNewsDetail();
    }
  }, [slug]);

  const handleTextChange = (
    lang: string,
    field: "title" | "content",
    value: string,
  ) => {
    setTranslations((prev) => ({
      ...prev,
      [lang]: { ...prev[lang as keyof typeof prev], [field]: value },
    }));

    if (lang === "uz" && field === "title") {
      setCurrentSlug(generateSlug(value));
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
      if (
        currentBanners[indexToRemove].file &&
        currentBanners[indexToRemove].preview
      ) {
        URL.revokeObjectURL(currentBanners[indexToRemove].preview);
      }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const finalTranslationsData: Record<string, any> = {};
      const PUBLIC_R2_DOMAIN = process.env.NEXT_PUBLIC_R2_DOMAIN || "";
      const baseUrl = PUBLIC_R2_DOMAIN.replace(/\/$/, "");

      for (const lang of Object.keys(translations)) {
        const langData = translations[lang as keyof typeof translations];
        const bannerUrls: string[] = [];

        for (const banner of langData.banners) {
          if (banner.file) {
            setUploadStatus(
              `[${lang.toUpperCase()}] Rasm R2 xotirasiga yuklanmoqda...`,
            );

            const uploadResult = await handleGameUpload(banner.file);
            if (!uploadResult.success || !uploadResult.fileKey) {
              throw new Error(
                `[${lang.toUpperCase()}] Rasmni R2 ga yuklashda xatolik yuz berdi!`,
              );
            }

            bannerUrls.push(`${baseUrl}/${uploadResult.fileKey}`);
          } else if (banner.url) {
            bannerUrls.push(banner.url);
          }
        }

        finalTranslationsData[lang] = {
          title: langData.title,
          content: langData.content,
          banners: bannerUrls,
        };
      }

      setUploadStatus("Ozgarishlar saqlanmoqda...");

      const payload = {
        slug: currentSlug,
        selectedGame: selectedGame || undefined,
        visibility,
        request: "requested",
        translations: finalTranslationsData,
      };

      const response = await fetch(`/api/news/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        setModalState({
          isOpen: true,
          type: "success",
          title: "Muvaffaqiyatli yangilandi!",
          message: "Yangilik malumotlari muvaffaqiyatli saqlandi.",
        });
      } else {
        setModalState({
          isOpen: true,
          type: "error",
          title: "Xatolik yuz berdi",
          message: result.message || "Nomalum xatolik yuz berdi.",
        });
      }
    } catch (error: any) {
      console.error("Xatolik:", error);
      setModalState({
        isOpen: true,
        type: "error",
        title: "Server xatoligi",
        message: error.message || "Serverga ulanishda xatolik yuz berdi.",
      });
    } finally {
      setIsSubmitting(false);
      setUploadStatus("");
    }
  };

  const handleModalClose = () => {
    const isSuccess = modalState.type === "success";
    setModalState((prev) => ({ ...prev, isOpen: false }));
    if (isSuccess) {
      router.push("/developer/my-news");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-32 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue-500" size={36} />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
          Malumotlar yuklanmoqda...
        </p>
      </div>
    );
  }

  const currentLangData = translations[activeLang as keyof typeof translations];

  return (
    <div className="w-full ml-5 max-w-5xl my-16 mx-auto p-4 md:p-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <div>
          <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            Yangilikni Yangilash
          </h1>
          <p className="text-sm mt-1 text-slate-400 font-medium">
            Mavjud yangilik malumotlarini tahrirlang va saqlang.
          </p>
        </div>
      </div>

      {/* TILLAR VA STATUS SATRI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
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
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-blue-500 text-white dark:bg-blue-600 rounded-md font-black">
                    {current.banners.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl w-full sm:w-fit border border-slate-200/50 dark:border-white/5">
          <button
            type="button"
            onClick={() => setVisibility("public")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 w-full sm:w-auto justify-center",
              visibility === "public"
                ? "bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
            )}
          >
            <Eye size={14} />
            Ommaviy
          </button>
          <button
            type="button"
            onClick={() => setVisibility("private")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 w-full sm:w-auto justify-center",
              visibility === "private"
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
        <div className="lg:col-span-2 space-y-6 p-6 sm:p-8 bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-100/50 dark:shadow-none">
          <div className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1.5 rounded-xl w-fit">
            Kiritilayotgan til:{" "}
            {LANGUAGES.find((l) => l.code === activeLang)?.label}
          </div>

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

          <div className="space-y-2.5">
            <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <LinkIcon size={16} className="text-slate-400" /> URL Manzili
              (Slug)
            </label>
            <input
              type="text"
              required
              value={currentSlug}
              onChange={(e) => setCurrentSlug(generateSlug(e.target.value))}
              placeholder="ozbekcha-sarlavhadan-avtomatik-yasaladi"
              className={cn(
                "w-full px-4 py-3.5 rounded-xl border text-sm font-mono transition-all duration-200 outline-none bg-slate-50/50 dark:bg-white/5",
                "border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:shadow-sm",
                "dark:border-white/10 dark:text-slate-300 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900/50",
              )}
            />
          </div>

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
              placeholder="Bu yerga batafsil malumotlarni yozishingiz mumkin..."
              className={cn(
                "w-full px-4 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200 outline-none resize-none bg-slate-50/50 dark:bg-white/5",
                "border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:shadow-sm",
                "dark:border-white/10 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900/50",
              )}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-5">
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Layers size={14} className="text-slate-400" /> Tegishli Oʻyin
                (Ixtiyoriy)
              </label>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border text-sm font-medium bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all duration-200"
              >
                <option value="" className="dark:bg-slate-900">
                  Oyin tanlanmagan (Umumiy yangilik)
                </option>
                {myGames.map((game) => (
                  <option
                    key={game.id}
                    value={game.title}
                    className="dark:bg-slate-900"
                  >
                    {game.title}
                  </option>
                ))}
              </select>
            </div>

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
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:opacity-100 transition-opacity pointer-events-none duration-200">
                        <Maximize2
                          size={16}
                          className="text-white drop-shadow-md"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => removeFile(e, index)}
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/70 text-white hover:bg-red-600 transition-all z-10"
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm tracking-wide text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/15 transition-all duration-200 disabled:opacity-50"
          >
            <Save size={16} />
            {isSubmitting ? uploadStatus || "Yangilanmoqda..." : "Yangilash"}
          </button>
        </div>
      </form>

      {/* MODAL */}
      {modalState.isOpen && (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "p-3 rounded-2xl shrink-0",
                  modalState.type === "success"
                    ? "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20"
                    : "bg-red-500/10 text-red-500 dark:bg-red-500/20",
                )}
              >
                {modalState.type === "success" ? (
                  <CheckCircle2 size={28} />
                ) : (
                  <AlertCircle size={28} />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {modalState.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {modalState.message}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleModalClose}
              className={cn(
                "w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md transition-all duration-200",
                modalState.type === "success"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                  : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20",
              )}
            >
              Tushunarli / Davom etish
            </button>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {activePreviewImage && (
        <div
          onClick={() => setActivePreviewImage(null)}
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center select-none">
            <button
              type="button"
              onClick={() => setActivePreviewImage(null)}
              className="absolute -top-12 right-0 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              <X size={20} />
            </button>

            <img
              src={activePreviewImage}
              alt="Kattalashtirilgan rasm"
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
