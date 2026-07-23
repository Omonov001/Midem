"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/ui/theme-provider";
import { cn } from "@/lib/utils";
import Logo from "@/components/shared/logo";
import LanguageChanger from "@/components/shared/language-changer";
import ModeToggle from "@/components/shared/mode-toggle";
import { Menu, X } from "lucide-react";

// Proplar uchun interfeys
interface NavbarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

function Navbar({ isOpen, setIsOpen }: NavbarProps) {
  // Proplarni qabul qilamiz
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[70] flex h-[10vh] items-center justify-between px-4 backdrop-blur-xl border-b transition-all duration-300 lg:px-8",
          isDark
            ? "bg-slate-950/60 border-white/5"
            : "bg-white/60 border-slate-200",
        )}
      >
        <Logo />

        <div className="flex items-center gap-2">
          <LanguageChanger />
          <ModeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)} // Layout'dan kelgan funksiya ishlaydi
            className={cn(
              "md:hidden p-2 rounded-xl transition-all active:scale-95",
              isDark
                ? "bg-slate-800 text-white"
                : "bg-slate-100 text-slate-900",
            )}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {isOpen && (
        <div
          className={cn(
            "fixed inset-0 z-[50] md:hidden backdrop-blur-sm transition-all",
            isDark ? "bg-black/60" : "bg-slate-900/20",
          )}
          onClick={() => setIsOpen(false)} // Overlay bosilganda ham yopiladi
        />
      )}
    </>
  );
}

export default Navbar;
