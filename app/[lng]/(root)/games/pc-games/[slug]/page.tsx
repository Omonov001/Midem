/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

// import { useTheme } from "next-themes"; // BU O'CHIRILDI
import { useTheme } from "@/components/ui/theme-provider"; // O'ZIMIZNIKI QO'SHILDI
import { useEffect, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  IoArrowBack,
  IoCheckmarkCircle,
  IoDownloadOutline,
  IoPeople,
  IoPeopleOutline,
  IoPersonCircleOutline,
  IoStar,
  IoThumbsUpOutline,
  IoTimeOutline,
} from "react-icons/io5";
import Link from "next/link";
import CommentModal from "@/components/modals/comment-modal";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import TextSign from "@/components/sign/text-sign";
import { MdOutlineReviews } from "react-icons/md";
import useTranslate from "@/hooks/use-translate";

const MOCK_COMMENTS = [
  {
    id: 1,
    user: "Asadbek Dev",
    date: "15 May, 2026",
    rating: 5,
    text: "Oyin grafikasiga gap yoq! Ayniqsa caselardan tushadigan itemlar juda noyob ekan.",
    likes: 12,
  },
  {
    id: 2,
    user: "Gamer_Uz",
    date: "10 May, 2026",
    rating: 4,
    text: "Optimallashirish biroz sustroq, lekin gameplay juda qiziqarli. Dostlar bilan oynashni maslahat beraman.",
    likes: 8,
  },
];

interface StatCardProps {
  icon: ReactNode;
  val: string;
  label: string;
  isDark: boolean;
  color: string;
}

interface RequirementRowProps {
  label: string;
  val: string;
  isDark: boolean;
}

export default function PCGameDetail() {
  const { resolvedTheme } = useTheme(); // Endi bu o'zimizning ThemeProvider'dan keladi
  const [mounted, setMounted] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const t = useTranslate();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <main
      className={cn(
        "relative min-h-screen pt-[12vh] pb-20 px-4 md:px-12 transition-colors duration-500",
        isDark ? "bg-slate-950 text-slate-300" : "bg-white text-slate-900",
      )}
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {/* BREADCRUMBS */}
        <Link
          href="/games/pc-games"
          className={cn(
            "flex items-center gap-2 text-xs uppercase tracking-widest transition-all w-fit",
            isDark
              ? "opacity-50 hover:opacity-100 text-white"
              : "text-slate-500 hover:text-blue-600",
          )}
        >
          <IoArrowBack /> {t("back")}
        </Link>

        {/* TOP GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000 }}
              className={cn(
                "rounded-xl overflow-hidden border shadow-2xl aspect-video w-full",
                isDark
                  ? "border-white/10 bg-slate-900"
                  : "border-slate-200 bg-slate-100",
              )}
            >
              {[1, 2, 3, 4].map((i) => (
                <SwiperSlide key={i}>
                  <div
                    className={cn(
                      "w-full h-full flex items-center justify-center bg-gradient-to-br",
                      isDark
                        ? "from-blue-900/20 to-black"
                        : "from-slate-200 to-slate-300",
                    )}
                  >
                    <span
                      className={cn(
                        "font-black italic text-4xl opacity-10 uppercase",
                        isDark ? "text-white" : "text-slate-900",
                      )}
                    >
                      SCREENSHOT {i}
                    </span>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <h1
              className={cn(
                "text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none pt-2",
                isDark ? "text-white" : "text-slate-900",
              )}
            >
              WARZONE <span className="text-blue-500">ELITE</span>
            </h1>
          </div>

          {/* RIGHT SIDEBAR */}
          <div
            className={cn(
              "lg:col-span-4 p-6 rounded-xl flex flex-col justify-between space-y-6 border transition-all",
              isDark
                ? "bg-[#171a21] border-white/5"
                : "bg-slate-50 border-slate-200 shadow-xl",
            )}
          >
            <div className="space-y-4 text-center lg:text-left">
              <div
                className={cn(
                  "aspect-video rounded-lg flex items-center justify-center border italic text-xs",
                  isDark
                    ? "bg-slate-800 border-white/5 opacity-40 text-white"
                    : "bg-white border-slate-200 text-slate-400",
                )}
              >
                Main Cover
              </div>

              {/* RATING BLOCK */}
              <div
                className={cn(
                  "flex flex-col items-center lg:items-start p-4 rounded-2xl border",
                  isDark
                    ? "bg-black/20 border-white/5"
                    : "bg-blue-50/50 border-blue-100",
                )}
              >
                <p
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest mb-2",
                    isDark ? "opacity-40" : "text-blue-500",
                  )}
                >
                  {t("Rating")}
                </p>
                <div className="flex items-center gap-3">
                  <StarRating
                    value={4.2}
                    size={22}
                    activeColor="text-blue-500"
                  />
                  <span
                    className={cn(
                      "text-xl font-black italic",
                      isDark ? "text-blue-400" : "text-blue-600",
                    )}
                  >
                    4.2
                  </span>
                </div>
              </div>

              <p
                className={cn(
                  "text-sm leading-relaxed text-balance",
                  isDark ? "opacity-80" : "text-slate-600",
                )}
              >
                Oyin dunyosidagi eng hayajonli janglarga qoshiling. Strategiya
                va mahoratni birlashtirib, galaba sari qadam tashlang.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <StatCard
                icon={<IoDownloadOutline />}
                val="2.4M"
                label={t("loaded")}
                isDark={isDark}
                color="text-blue-500"
              />
              <StatCard
                icon={<MdOutlineReviews />}
                val="120K"
                label={t("Reviews")}
                isDark={isDark}
                color="text-green-500"
              />
            </div>

            <button className="w-full cursor-pointer py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-md font-bold text-sm uppercase shadow-lg hover:brightness-110 active:scale-95 transition-all">
              {t("Dowload")}
            </button>
          </div>
        </section>

        {/* METADATA BAR */}
        <div
          className={cn(
            "flex flex-wrap items-center gap-6 py-4 border-y",
            isDark ? "border-white/10" : "border-slate-200",
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                isDark ? "opacity-60" : "text-slate-400",
              )}
            >
              {t("uploaded")}:
            </span>
            <span className="text-sm font-bold text-blue-500 underline underline-offset-4">
              Vertex Admin
            </span>
          </div>
          <TextSign />
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                isDark ? "opacity-60" : "text-slate-400",
              )}
            >
              {t("category")}:
            </span>
            <span
              className={cn(
                "text-sm font-bold",
                isDark ? "text-slate-300" : "text-slate-700",
              )}
            >
              Action / Multiplayer
            </span>
          </div>
          <TextSign />
          <div className="flex items-center gap-2 text-xs font-bold uppercase">
            <span
              className={cn(
                "text-[10px]",
                isDark ? "opacity-60" : "text-slate-400",
              )}
            >
              {t("Release")}:
            </span>
            <span className={isDark ? "text-slate-300" : "text-slate-700"}>
              20 May, 2026
            </span>
          </div>
          <TextSign />
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-tighter">
            <span
              className={cn(
                "text-[10px]",
                isDark ? "opacity-60" : "text-slate-400",
              )}
            >
              {t("Developer")}:
            </span>
            <span className="text-blue-500">Vertex Studio</span>
          </div>
        </div>

        {/* ABOUT & REQUIREMENTS */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-widest text-blue-500 border-b border-blue-500/30 pb-2 w-fit">
              {t("AboutGame")}
            </h3>
            <div
              className={cn(
                "text-lg md:text-2xl font-medium leading-relaxed italic text-balance",
                isDark ? "text-slate-200" : "text-slate-800",
              )}
            >
              Warzone Elite — bu shunchaki ochiq dunyo oyini emas. Bu yerda siz
              qurol-yaroglarning boy arsenalidan foydalanishingiz, sheriklar
              bilan jamoaviy taktikalar tuzishingiz va hayajonli caselar orqali
              noyob buyumlarni qolga kiritishingiz mumkin.
            </div>
            <p
              className={cn(
                "text-sm",
                isDark ? "opacity-60" : "text-slate-500",
              )}
            >
              Har bir jang — bu yangi imkoniyat. Oz mahoratingizni korsating va
              Night City kochalarida oz hukmronligingizni ornating.
            </p>

            <div className="space-y-6">
              <h3 className="text-2xl font-black uppercase italic">
                {t("FullData")}
              </h3>
              <div
                className={cn(
                  "grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-3xl border",
                  isDark
                    ? "bg-white/5 border-white/5"
                    : "bg-white border-slate-200 shadow-sm",
                )}
              >
                <TechRow label={t("version")} value="3.2.0.18742" />
                <TechRow label={t("DowloadSize")} value="1.42 GB" />
                <TechRow label={t("GameData")} value="~3.5 GB" />
                <TechRow
                  label={t("Developer")}
                  value="Level Infinite (Tencent Music)"
                />
                <TechRow label={t("ReleaseDate")} value="19 Mart, 2018" />
                <TechRow
                  label={t("language")}
                  value="48 ta (O'zbek tili mavjud)"
                />
              </div>
            </div>

            <div
              className={cn(
                "p-8 rounded-[2rem] border-2 border-dashed",
                isDark
                  ? "border-green-500/20 bg-green-500/5"
                  : "border-green-200 bg-green-50",
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500 rounded-lg text-white">
                  <IoTimeOutline size={20} />
                </div>
                <h3 className="text-xl font-black uppercase italic">
                  {t("NewUpdated")} (v3.2)
                </h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm italic">
                  <IoCheckmarkCircle className="text-green-500 mt-1 shrink-0" />
                  <span>
                    Yangi Mecha Fusion rejimi qoshildi - robotlar jangi endi
                    PUBGda!
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm italic">
                  <IoCheckmarkCircle className="text-green-500 mt-1 shrink-0" />
                  <span>
                    Livik xaritasi toliq optimallashtirildi, FPS barqarorligi
                    +20%.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-widest text-blue-500 border-b border-blue-500/30 pb-2 w-fit">
              {t("SystemRequirements")}
            </h3>
            <div
              className={cn(
                "p-6 rounded-xl border space-y-4",
                isDark
                  ? "bg-black/20 border-white/5"
                  : "bg-slate-50 border-slate-200 shadow-sm",
              )}
            >
              <RequirementRow
                label="OS"
                val="Windows 10/11 64-bit"
                isDark={isDark}
              />
              <RequirementRow
                label="CPU"
                val="i7-12700K / Ryzen 7"
                isDark={isDark}
              />
              <RequirementRow label="GPU" val="RTX 3070 8GB" isDark={isDark} />
              <RequirementRow label="RAM" val="16 GB" isDark={isDark} />
            </div>
            <button
              onClick={() => setIsCommentOpen(true)}
              className="w-full py-4 border-2 border-blue-500/50 text-blue-500 rounded-xl font-black uppercase italic hover:bg-blue-500 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              {t("comment")}
            </button>
          </div>
        </section>

        {/* COMMENTS SECTION */}
        <section className="pt-10 space-y-8">
          <div
            className={cn(
              "flex items-center gap-4 border-b pb-4",
              isDark ? "border-white/5" : "border-slate-200",
            )}
          >
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-blue-500">
              {t("User")} {t("Reviews")}
            </h3>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                isDark ? "bg-white/10 text-white" : "bg-blue-100 text-blue-600",
              )}
            >
              {MOCK_COMMENTS.length} {t("Reviews")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_COMMENTS.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  "p-6 rounded-[2rem] border transition-all hover:scale-[1.02]",
                  isDark
                    ? "bg-white/5 border-white/10"
                    : "bg-slate-50 border-slate-200 shadow-md",
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <IoPersonCircleOutline
                      size={40}
                      className="text-blue-500"
                    />
                    <div>
                      <h4
                        className={cn(
                          "font-bold text-sm leading-none",
                          isDark ? "text-white" : "text-slate-800",
                        )}
                      >
                        {comment.user}
                      </h4>
                      <span
                        className={cn(
                          "text-[10px] uppercase font-black",
                          isDark ? "opacity-50" : "text-slate-400",
                        )}
                      >
                        {comment.date}
                      </span>
                    </div>
                  </div>
                  <StarRating
                    value={comment.rating}
                    size={14}
                    activeColor="text-orange-500"
                  />
                </div>
                <p
                  className={cn(
                    "text-sm leading-relaxed mb-4 italic",
                    isDark ? "text-slate-300" : "text-slate-600",
                  )}
                >
                  {comment.text}
                </p>
                <div
                  className={cn(
                    "flex items-center gap-2 cursor-pointer transition-all",
                    isDark
                      ? "opacity-50 hover:opacity-100 text-white"
                      : "text-slate-400 hover:text-blue-500",
                  )}
                >
                  <IoThumbsUpOutline size={16} />
                  <span className="text-xs font-bold">
                    {comment.likes} {t("useful")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <CommentModal
          isOpen={isCommentOpen}
          onClose={() => setIsCommentOpen(false)}
          isDark={isDark}
        />
      </div>
    </main>
  );
}

// Boshqa yordamchi komponentlar (StarRating, StatCard, RequirementRow) o'z holicha qoladi...

function StarRating({
  value,
  size = 18,
  activeColor = "text-orange-500",
}: {
  value: number;
  size?: number;
  activeColor?: string;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFull = star <= Math.floor(value);
        const isHalf = !isFull && star === Math.ceil(value) && value % 1 !== 0;
        return (
          <div key={star} className="relative">
            <IoStar size={size} className="text-slate-300" />
            <div
              className={cn("absolute inset-0 overflow-hidden", activeColor)}
              style={{ width: isFull ? "100%" : isHalf ? "50%" : "0%" }}
            >
              <IoStar size={size} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ icon, val, label, isDark, color }: StatCardProps) {
  return (
    <div
      className={cn(
        "p-3 rounded-lg border text-center transition-transform hover:scale-105",
        isDark
          ? "bg-black/40 border-white/5 text-white"
          : "bg-white border-slate-200 shadow-sm text-slate-900",
      )}
    >
      <div className={cn("mx-auto mb-1 flex justify-center", color)}>
        {icon}
      </div>
      <p className="text-sm font-black leading-none">{val}</p>
      <p
        className={cn(
          "text-[8px] uppercase font-bold mt-1",
          isDark ? "opacity-50" : "text-slate-400",
        )}
      >
        {label}
      </p>
    </div>
  );
}

function RequirementRow({ label, val, isDark }: RequirementRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col border-b pb-2",
        isDark ? "border-white/5" : "border-slate-200",
      )}
    >
      <span
        className={cn(
          "text-[10px] uppercase font-bold",
          isDark ? "opacity-40" : "text-slate-400",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-bold",
          isDark ? "text-slate-200" : "text-slate-700",
        )}
      >
        {val}
      </span>
    </div>
  );
}
function TechRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 px-2">
      <span className="text-xs font-black uppercase opacity-40 italic">
        {label}
      </span>
      <span className="text-sm font-bold italic">{value}</span>
    </div>
  );
}
