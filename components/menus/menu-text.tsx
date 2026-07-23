"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface Props {
  text: string;
  className?: string; // className ixtiyoriy bo'lishi mumkin
}

function MenuText({ text, className }: Props) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Komponent brauzerga yuklanganini aniqlaymiz
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Agar hali mounted bo'lmagan bo'lsa (SSR jarayonida),
  // xatolik bermasligi uchun oddiyroq yoki ko'rinmas variantni qaytaramiz
  if (!mounted) {
    return (
      <div
        className={cn(
          className,
          "px-6 py-2 my-20 rounded-full text-[11px] font-bold tracking-[0.25em] uppercase border opacity-0",
        )}
      >
        {text}
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={cn(
        "px-6 py-2 my-20 rounded-full text-[11px] font-bold tracking-[0.25em] uppercase border backdrop-blur-md shadow-sm transition-all duration-300",
        isDark
          ? "bg-white/5 border-white/10 text-blue-400 shadow-blue-500/5"
          : "bg-slate-900/5 border-slate-950/10 text-blue-600 shadow-slate-200",
        className,
      )}
    >
      {text}
    </div>
  );
}

export default MenuText;
