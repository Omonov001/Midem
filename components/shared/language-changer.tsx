"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/ui/theme-provider";
import { cn } from "@/lib/utils";
import { IoChevronDown } from "react-icons/io5";
import Image from "next/image"; // Rasmlar uchun

export default function LanguageChanger() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-[80px] h-[40px] rounded-xl bg-slate-500/10 animate-pulse" />
    );
  }

  const isDark = theme === "dark";

  // Rasmlar manzili public papkasidan olinadi
  const languages = [
    { code: "uz", name: "O'zbekcha", flag: "/uz.png" },
    { code: "en", name: "English", flag: "/en.png" },
    { code: "ru", name: "Русский", flag: "/ru.png" },
    { code: "tr", name: "Türkçe", flag: "/tr.png" },
  ];

  // Hozirgi tanlangan tilning rasmini topamiz
  const currentLanguage = languages.find((l) => l.code === locale);

  const onSelectChange = (nextLocale: string) => {
    router.replace(pathname, { locale: nextLocale });
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      {/* Tanlangan til tugmasi */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all active:scale-90 outline-none shadow-sm",
          isDark
            ? "bg-slate-900/50 border-white/10 hover:border-blue-500/50 text-white"
            : "bg-white border-slate-200 hover:border-blue-600 text-slate-800",
        )}
      >
        {/* Hozirgi til bayrog'i */}
        <span className="font-black uppercase text-xs md:text-sm italic tracking-wider">
          {locale}
        </span>
        <IoChevronDown
          className={cn(
            "transition-transform duration-300 size-4 opacity-50",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown menyu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setIsOpen(false)}
          />

          <div
            className={cn(
              "absolute right-0 mt-3 w-48 rounded-[1.5rem] border-2 backdrop-blur-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right",
              isDark
                ? "bg-slate-950/90 border-white/10 text-white shadow-black/50"
                : "bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/50",
            )}
          >
            <div className="p-1.5 space-y-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onSelectChange(lang.code)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-[1rem] text-sm font-bold italic transition-all outline-none group",
                    locale === lang.code
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : isDark
                        ? "hover:bg-white/10 text-slate-300"
                        : "hover:bg-slate-50 text-slate-700 hover:text-blue-600",
                  )}
                >
                  {/* Dropdown ichidagi rasm */}
                  <div className="relative size-6 shrink-0 rounded-sm overflow-hidden border border-white/20">
                    <Image
                      src={lang.flag}
                      alt={lang.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="flex-1 text-left uppercase tracking-tight">
                    {lang.name}
                  </span>
                  {locale === lang.code && (
                    <div className="size-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
