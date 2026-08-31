/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Clock,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "uz", label: "Ozbekcha" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
  { code: "tu", label: "Türkçe" },
];

export default function MyNewsPage() {
  const router = useRouter();
  const [newsList, setNewsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLang, setActiveLang] = useState("uz");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "public" | "private" | "requested" | "rejected"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal oynalar uchun state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string | null;
  }>({
    isOpen: false,
    id: null,
  });
  const [infoModal, setInfoModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  // Bazadan faqat oziga tegishli malumotlarni yuklab olish (/api/news orqali)
  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem("_id") || "";

      const res = await fetch(`/api/news?authorId=${userId}`);
      const result = await res.json();
      if (result.success) {
        setNewsList(result.data);
      }
    } catch (error) {
      console.error("Xatolik:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNews();
  }, []);

  // Ochirishni tasdiqlash modalini ochish
  const confirmDelete = (id: string) => {
    setDeleteModal({ isOpen: true, id });
  };

  // Haqiqatdan ochirish funksiyasi (/api/news orqali)
  const handleDeleteExecute = async () => {
    if (!deleteModal.id) return;

    try {
      const res = await fetch(`/api/news?id=${deleteModal.id}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (result.success) {
        setNewsList((prev) =>
          prev.filter((item) => item._id !== deleteModal.id),
        );
        setDeleteModal({ isOpen: false, id: null });
        setInfoModal({
          isOpen: true,
          title: "Muvaffaqiyatli!",
          message: "Yangilik muvaffaqiyatli ochirildi.",
        });
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Ochirishda xatolik:", error);
    }
  };

  // Qidiruv va 3 ta status boyicha filtrlash
  const filteredNews = newsList.filter((item) => {
    const status = item.request || "requested"; // Standart holat
    const isPub = item.visibility === "public";

    let matchesStatus = true;
    if (filterStatus === "requested") {
      matchesStatus = status === "requested";
    } else if (filterStatus === "rejected") {
      matchesStatus = status === "rejected";
    } else if (filterStatus === "public") {
      matchesStatus = status === "approved" && isPub;
    } else if (filterStatus === "private") {
      matchesStatus = status === "approved" && !isPub;
    }

    const currentLangData = item.translations?.[activeLang];
    const matchesSearch = currentLangData?.title
      ?.toLowerCase()
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

        <button
          onClick={() => router.push("/developer/create-news")}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus size={16} /> Yangi qoshish
        </button>
      </div>

      {/* FILTRLAR VA QIDIRUV SATHI */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-xl overflow-x-auto max-w-full">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setActiveLang(lang.code)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer",
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
            onChange={(e) =>
              setFilterStatus(
                e.target.value as
                  | "all"
                  | "public"
                  | "private"
                  | "requested"
                  | "rejected",
              )
            }
            className="px-3 py-2 rounded-xl border text-xs font-bold bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Barchasi</option>
            <option value="requested">Kutilmoqda</option>
            <option value="rejected">Rad etilgan</option>
            <option value="public">Ommaviy (Tasdiqlangan)</option>
            <option value="private">Yashirin (Tasdiqlangan)</option>
          </select>
        </div>
      </div>

      {/* YANGILIKLAR ROYXATI GRID */}
      {isLoading ? (
        <div className="text-center py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-blue-500" size={32} />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            Yuklanmoqda...
          </p>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900/10 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
          <p className="text-slate-400 dark:text-slate-500 font-medium text-sm">
            Mos keladigan yangilik topilmadi.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredNews.map((item) => {
            const langData = item.translations?.[activeLang];
            const hasTranslation =
              langData && langData.title && langData.title.length > 0;

            const status = item.request || "requested";
            const isPublic = item.visibility === "public";
            const formattedDate = new Date(item.createdAt).toLocaleDateString();

            return (
              <div
                key={item._id}
                className="flex flex-col bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group"
              >
                {/* Muqova rasmi */}
                <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
                  {hasTranslation &&
                  langData.banners &&
                  langData.banners.length > 0 ? (
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

                  {/* Status Badge (requested, rejected, approved) */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {status === "requested" && (
                      <div className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm backdrop-blur-md text-white bg-amber-500/90">
                        <Clock size={12} /> Kutilmoqda
                      </div>
                    )}

                    {status === "rejected" && (
                      <div className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm backdrop-blur-md text-white bg-red-500/90">
                        <XCircle size={12} /> Rad etilgan
                      </div>
                    )}

                    {status === "approved" && (
                      <div
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm backdrop-blur-md text-white",
                          isPublic ? "bg-emerald-500/90" : "bg-blue-500/90",
                        )}
                      >
                        {isPublic ? <Eye size={12} /> : <EyeOff size={12} />}
                        Tasdiqlangan: {isPublic ? "Public" : "Private"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Kontent qismi */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-400">
                        <Layers size={12} /> {item.selectedGame || "Umumiy"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {formattedDate}
                      </span>
                    </div>

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

                    <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 truncate bg-blue-500/5 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                      <LinkIcon size={12} className="shrink-0 text-blue-400" />
                      <span className="truncate">/news/{item.slug}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/developer/my-news/${item.slug}`)
                      }
                      className="p-2 rounded-xl text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/15 transition-all cursor-pointer"
                      title="Tahrirlash"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDelete(item._id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/15 transition-all cursor-pointer"
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

      {/* OCHIRISHNI TASDIQLASH DIALOG MODALI */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 dark:bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Yangilikni ochirish
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Haqiqatan ham ushbu yangilikni ochirmoqchimisiz? Bu amalni ortga
                qaytarib bolmaydi.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, id: null })}
                className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 transition-all cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleDeleteExecute}
                className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-500/20 transition-all cursor-pointer"
              >
                Ochirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* XABARNOMA MODALI */}
      {infoModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {infoModal.title}
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {infoModal.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setInfoModal({ isOpen: false, title: "", message: "" })
              }
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Tushunarli
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
