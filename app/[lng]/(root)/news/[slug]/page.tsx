"use client";

import { useTheme } from "@/components/ui/theme-provider";
import { useEffect, useState, use } from "react";
import { cn } from "@/lib/utils";
import {
  IoArrowBack,
  IoShareSocialOutline,
  IoBookmarkOutline,
  IoChatbubbleOutline,
  IoChevronBack,
  IoChevronForward,
  IoEyeOutline,
  IoHeartOutline,
  IoHeart, // To'lgan qizil yurakcha
} from "react-icons/io5";
import Link from "next/link";
import CommentModal from "@/components/modals/comment-modal";
import useTranslate from "@/hooks/use-translate";
import Image from "next/image";
import { useUser } from "@clerk/nextjs"; // Clerk frontend hook'i

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface NewsDetailProps {
  params: Promise<{ slug: string; lng: string }>;
}

export default function NewsDetailPage({ params }: NewsDetailProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const lng = resolvedParams.lng || "uz";

  const { resolvedTheme } = useTheme();
  const { user: clerkUser } = useUser(); // Clerk user ma'lumoti
  const [mounted, setMounted] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [newsData, setNewsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Like state'lari
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  const t = useTranslate();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // API dan ma'lumotni tortib kelish
  useEffect(() => {
    if (!mounted || !slug) return;

    async function fetchNewsDetail() {
      try {
        setLoading(true);
        const res = await fetch(`/api/news/public/${slug}`);
        const result = await res.json();
        if (result.success) {
          setNewsData(result.data);
          setLikesCount(result.data.likes || 0);
        } else {
          setNewsData(null);
        }
      } catch (error) {
        console.error("Xatolik:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNewsDetail();
  }, [mounted, slug]);

  // Foydalanuvchi ma'lumotlari kelganda u bu yangilikka like bosganligini tekshiramiz
  useEffect(() => {
    if (newsData && clerkUser) {
      // Backenddan kelgan likedUsers massivida user ID si borligini tekshirish uchun
      // yoki bazadagi user o'ziga mosligini tekshiramiz.
      // Oddiy usul: agar backend user ID larni saqlasa, ularni tekshirish mumkin.
      // Yoki oddiygina har safar bosganda state yangilanadi.
      const likedArr = newsData.likedUsers || [];
      // Eslatma: Agar likedUsers ichida MongoDB ID saqlanayotgan bo'lsa,
      // uni to'g'ridan-to'g'ri tekshirish uchun user bazadagi ID si kerak bo'ladi.
    }
  }, [newsData, clerkUser]);

  // Like bosish funksiyasi
  const handleLike = async () => {
    if (!clerkUser) {
      alert("Iltimos, oldin tizimga kiring!");
      return;
    }

    try {
      const res = await fetch(`/api/news/public/${slug}/like`, {
        method: "POST",
      });
      const result = await res.json();

      if (result.success) {
        setLikesCount(result.likes);
        setHasLiked(result.hasLiked);
      } else {
        alert(result.message || "Xatolik yuz berdi!");
      }
    } catch (error) {
      console.error("Like bosishda xatolik:", error);
    }
  };

  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";

  if (loading) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center font-bold text-lg",
          isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900",
        )}
      >
        Yuklanmoqda...
      </div>
    );
  }

  if (!newsData) {
    return (
      <div
        className={cn(
          "min-h-screen flex flex-col items-center justify-center gap-4",
          isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900",
        )}
      >
        <h1 className="text-2xl font-bold">
          Yangilik topilmadi yoki o&apos;chirilgan.
        </h1>
        <Link
          href={`/${lng}/news`}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold"
        >
          Ortga qaytish
        </Link>
      </div>
    );
  }

  const translation =
    newsData.translations[lng] ||
    newsData.translations["uz"] ||
    Object.values(newsData.translations)[0] ||
    {};
  const title = translation.title || "Sarlavha yo'q";
  const content = translation.content || "";
  const banners = translation.banners || [];

  return (
    <main
      className={cn(
        "relative min-h-screen pt-[12vh] pb-20 px-4 lg:px-12 transition-colors duration-500",
        isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900",
      )}
    >
      <div className="max-w-4xl mx-auto">
        {/* TOP NAV */}
        <div className="flex items-center justify-between mb-10">
          <Link
            href={`/${lng}/news`}
            className="group flex items-center gap-2 text-blue-500 font-bold"
          >
            <div className="p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <IoArrowBack className="size-5" />
            </div>
            <span>{t("back")}</span>
          </Link>

          <div className="flex gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Havola nusxalandi!");
              }}
              className={cn(
                "p-3 rounded-2xl border backdrop-blur-md transition-all cursor-pointer",
                isDark
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-slate-200 shadow-sm",
              )}
            >
              <IoShareSocialOutline className="size-5" />
            </button>
            <button
              className={cn(
                "p-3 rounded-2xl border backdrop-blur-md transition-all cursor-pointer",
                isDark
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-slate-200 shadow-sm",
              )}
            >
              <IoBookmarkOutline className="size-5" />
            </button>
          </div>
        </div>

        {/* --- SWIPER SECTION --- */}
        <div
          className={cn(
            "group relative w-full aspect-video rounded-[3rem] overflow-hidden border shadow-2xl transition-all duration-500",
            isDark
              ? "border-white/10 shadow-blue-500/5"
              : "border-slate-200 shadow-slate-200",
          )}
        >
          {banners.length > 0 ? (
            <Swiper
              modules={[Pagination, Autoplay, Navigation]}
              pagination={{ clickable: true }}
              navigation={{
                nextEl: ".swiper-button-next-custom",
                prevEl: ".swiper-button-prev-custom",
              }}
              autoplay={{ delay: 4000 }}
              className="w-full h-full"
            >
              {banners.map((imgUrl: string, idx: number) => (
                <SwiperSlide key={idx}>
                  <div className="relative w-full h-full">
                    <Image
                      src={imgUrl}
                      alt={`Banner ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-600/10 font-bold text-slate-400">
              Rasmlar mavjud emas
            </div>
          )}

          {banners.length > 1 && (
            <>
              <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all hidden md:flex cursor-pointer">
                <IoChevronBack className="size-6" />
              </button>
              <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all hidden md:flex cursor-pointer">
                <IoChevronForward className="size-6" />
              </button>
            </>
          )}
        </div>

        {/* --- STATISTIKA VA LIKE BUTTON --- */}
        <div className="flex items-center justify-between mt-6 mb-8 px-2">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-500 font-bold">
              <IoEyeOutline className="size-5 text-blue-500" />
              <span className="text-sm">
                {newsData.views || 1} {t("views")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-bold">
              <IoHeart className="size-5 text-red-500" />
              <span className="text-sm">
                {likesCount} {t("likes")}
              </span>
            </div>
          </div>

          {/* ASOSIY LIKE TUGMASI (Qizilga to'lib turishi uchun) */}
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center cursor-pointer gap-2 px-4 py-2 rounded-xl border font-bold transition-all active:scale-90",
              hasLiked
                ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30"
                : isDark
                  ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                  : "bg-red-50 border-red-100 text-red-600 hover:bg-red-600 hover:text-white",
            )}
          >
            {hasLiked ? (
              <IoHeart className="size-5" />
            ) : (
              <IoHeartOutline className="size-5" />
            )}
            <span>{hasLiked ? "Liked" : "Like"}</span>
          </button>
        </div>

        {/* CONTENT INFO */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.05] uppercase">
            {title}
          </h1>

          <div
            className={cn(
              "flex flex-wrap items-center justify-between p-5 rounded-[2rem] border backdrop-blur-xl transition-all gap-4",
              isDark
                ? "bg-white/[0.03] border-white/10"
                : "bg-white border-slate-200 shadow-sm",
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 p-0.5 relative overflow-hidden">
                {newsData.authorId?.picture ? (
                  <Image
                    src={newsData.authorId.picture}
                    alt="Developer Avatar"
                    fill
                    className="object-cover rounded-[0.9rem]"
                  />
                ) : (
                  <div
                    className={cn(
                      "w-full h-full rounded-[0.9rem]",
                      isDark ? "bg-slate-900" : "bg-slate-100",
                    )}
                  />
                )}
              </div>
              <div>
                <p className="font-bold text-sm tracking-tight">
                  {newsData.authorId?.name ||
                    newsData.authorId?.username ||
                    "Noma'lum Developer"}
                </p>
                <p className="text-[11px] text-blue-500 font-bold uppercase tracking-widest">
                  Developer
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCommentsOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <IoChatbubbleOutline className="size-5" />
              <span>Izohlar</span>
            </button>
          </div>

          <article
            className={cn(
              "pt-6 pb-10 text-lg md:text-xl leading-relaxed font-medium space-y-8",
              isDark ? "text-slate-300" : "text-slate-600",
            )}
          >
            <div className="whitespace-pre-line">{content}</div>
          </article>
        </div>
      </div>

      <CommentModal
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        isDark={isDark}
      />

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: ${isDark ? "#fff" : "#2563eb"} !important;
        }
        .swiper-pagination-bullet-active {
          width: 20px;
          border-radius: 10px;
          transition: all 0.3s;
        }
      `}</style>
    </main>
  );
}
