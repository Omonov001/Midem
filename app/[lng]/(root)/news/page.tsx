"use client";

// 1. IMPORTNI O'ZGARTIRDIK
import { useTheme } from "@/components/ui/theme-provider";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import MenuText from "@/components/menus/menu-text";
import FillterCards from "@/components/fillters/fillter-cards";
import Link from "next/link";
import useTranslate from "@/hooks/use-translate";

function Page() {
  // 2. resolvedTheme endi bizning xavfsiz providerdan keladi
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslate();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";

  return (
    <main
      className={cn(
        "relative min-h-screen pt-[10vh] px-4 lg:px-12 transition-colors duration-500",
        isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900",
      )}
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* HEADER SECTION */}
        <section className="flex flex-col items-center text-center space-y-6 mb-16">
          <MenuText text={t("MainText2")} className="" />

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-blue-400">
              {t("news")}
            </span>
          </h1>

          <p
            className={cn(
              "max-w-2xl text-lg md:text-xl font-medium leading-relaxed",
              isDark ? "text-slate-400" : "text-slate-600",
            )}
          >
            {t("newsText")}
          </p>
        </section>

        <FillterCards
          one={t("All")}
          two={t("TheBestOnes")}
          three={t("TheNewestOnes")}
          four={t("TheOldestOnes")}
          className="mb-5"
        />

        {/* NEWS GRID SECTION */}
        <section className="w-full pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((id) => (
              <Link key={id} href={`/news/${id}`}>
                <div
                  className={cn(
                    "group relative p-6 rounded-[2.5rem] border backdrop-blur-xl transition-all duration-500 hover:-translate-y-2",
                    isDark
                      ? "bg-white/[0.03] border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-blue-500/20"
                      : "bg-white border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-blue-500/10",
                  )}
                >
                  {/* Image Box */}
                  <div
                    className={cn(
                      "w-full aspect-video rounded-3xl mb-6 overflow-hidden relative",
                      isDark ? "bg-slate-800" : "bg-slate-200",
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 group-hover:opacity-40 transition-opacity" />

                    {/* Badge */}
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-blue-600 text-[10px] font-bold text-white uppercase tracking-widest">
                      Yangilik
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-8 bg-blue-500 rounded-full" />
                      <span className="text-xs font-bold text-blue-500 uppercase tracking-tighter">
                        Oyin Olami
                      </span>
                    </div>

                    <h3
                      className={cn(
                        "text-xl font-extrabold leading-tight line-clamp-2 transition-colors",
                        isDark
                          ? "group-hover:text-blue-400"
                          : "group-hover:text-blue-600",
                      )}
                    >
                      Yangi jang maydonlari va qahramonlar tizimidagi
                      ozgarishlar elon qilindi
                    </h3>

                    <p
                      className={cn(
                        "text-sm line-clamp-2",
                        isDark ? "text-slate-400" : "text-slate-500",
                      )}
                    >
                      Ushbu yangilanishda biz foydalanuvchilarimiz uchun yanada
                      qulay va qiziqarli interfeysni taqdim etamiz...
                    </p>

                    <div
                      className={cn(
                        "flex justify-between items-center pt-4 border-t",
                        isDark ? "border-white/5" : "border-slate-100",
                      )}
                    >
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-widest",
                          isDark ? "text-slate-500" : "text-slate-400",
                        )}
                      >
                        20 May, 2026
                      </span>

                      <span
                        className={cn(
                          "text-xs font-black uppercase tracking-widest transition-all",
                          "text-blue-600 hover:text-blue-500 underline underline-offset-4",
                        )}
                      >
                        Oqish
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Background Decor (Glow) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>
    </main>
  );
}

export default Page;
