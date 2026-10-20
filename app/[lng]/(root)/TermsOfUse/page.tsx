/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useTheme } from "@/components/ui/theme-provider";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  IoDocumentText,
  IoGameController,
  IoCard,
  IoBan,
  IoScale,
} from "react-icons/io5";
import useTranslate from "@/hooks/use-translate"; // Bosh sahifangizdagi hook'ingiz

export default function TermsOfUse() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslate(); // Tarjimalarni chaqirish uchun hook

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  const surface = isDark
    ? "border-white/[0.07] bg-white/[0.025]"
    : "border-slate-200/80 bg-white";

  const cardSurface = isDark
    ? "border-white/[0.05] bg-white/[0.015]"
    : "border-slate-200/60 bg-slate-50/50";

  const muted = isDark ? "text-slate-400" : "text-slate-500";
  const heading = isDark ? "text-white" : "text-slate-950";

  return (
    <main
      className={cn(
        "relative my-5 min-h-screen overflow-hidden px-4 pb-24 pt-[9vh] md:px-6 lg:px-10",
        isDark ? "bg-slate-950/60" : "bg-[#f7f9fc]",
      )}
    >
      {/* BACKGROUND BLURS */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={cn(
            "absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full blur-[150px]",
            isDark ? "bg-blue-600/[0.08]" : "bg-blue-500/[0.07]",
          )}
        />
        <div
          className={cn(
            "absolute -right-40 top-[30%] h-[600px] w-[600px] rounded-full blur-[170px]",
            isDark ? "bg-indigo-600/[0.07]" : "bg-indigo-500/[0.06]",
          )}
        />
        <div
          className={cn(
            "absolute bottom-[-200px] left-[30%] h-[500px] w-[500px] rounded-full blur-[160px]",
            isDark ? "bg-purple-600/[0.04]" : "bg-purple-500/[0.04]",
          )}
        />
        <div
          className={cn(
            "absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,#64748b_1px,transparent_1px),linear-gradient(to_bottom,#64748b_1px,transparent_1px)] [background-size:55px_55px]",
          )}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px]">
        {/* HERO HEADER */}
        <section
          className={cn(
            "relative overflow-hidden rounded-[2rem] border p-8 md:p-12 text-center mb-10 shadow-2xl",
            surface,
            isDark ? "shadow-black/40" : "shadow-slate-300/30",
          )}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/[0.08] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-500">
            <IoDocumentText className="text-sm" /> Agreement
          </div>
          <h1
            className={cn(
              "text-4xl font-black tracking-[-0.04em] sm:text-5xl md:text-6xl mb-4",
              heading,
            )}
          >
            {t("TermsOfUse.title")}{" "}
            <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              {t("TermsOfUse.subtitle")}
            </span>
          </h1>
          <p className={cn("max-w-2xl mx-auto text-base", muted)}>
            {t("TermsOfUse.lastUpdated")}
          </p>
        </section>

        {/* TERMS CONTENT CARDS */}
        <div className="grid grid-cols-1 gap-6">
          <div
            className={cn(
              "rounded-2xl border p-6 md:p-8 shadow-lg",
              cardSurface,
            )}
          >
            <div className="flex items-center gap-3 mb-4 text-blue-500">
              <IoGameController className="text-2xl" />
              <h2 className={cn("text-xl font-bold", heading)}>
                {t("TermsOfUse.section1Title")}
              </h2>
            </div>
            <p className={cn("leading-relaxed", muted)}>
              {t("TermsOfUse.section1Desc")}
            </p>
          </div>

          <div
            className={cn(
              "rounded-2xl border p-6 md:p-8 shadow-lg",
              cardSurface,
            )}
          >
            <div className="flex items-center gap-3 mb-4 text-indigo-500">
              <IoCard className="text-2xl" />
              <h2 className={cn("text-xl font-bold", heading)}>
                {t("TermsOfUse.section2Title")}
              </h2>
            </div>
            <p className={cn("leading-relaxed", muted)}>
              {t("TermsOfUse.section2Desc")}
            </p>
          </div>

          <div
            className={cn(
              "rounded-2xl border p-6 md:p-8 shadow-lg",
              cardSurface,
            )}
          >
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <IoBan className="text-2xl" />
              <h2 className={cn("text-xl font-bold", heading)}>
                {t("TermsOfUse.section3Title")}
              </h2>
            </div>
            <p className={cn("leading-relaxed", muted)}>
              {t("TermsOfUse.section3Desc")}
            </p>
          </div>

          <div
            className={cn(
              "rounded-2xl border p-6 md:p-8 shadow-lg",
              cardSurface,
            )}
          >
            <div className="flex items-center gap-3 mb-4 text-purple-500">
              <IoScale className="text-2xl" />
              <h2 className={cn("text-xl font-bold", heading)}>
                {t("TermsOfUse.section4Title")}
              </h2>
            </div>
            <p className={cn("leading-relaxed", muted)}>
              {t("TermsOfUse.section4Desc")}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
