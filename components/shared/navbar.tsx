"use client";

import { useState, useEffect } from "react";
// 1. IMPORTNI O'ZGARTIRDIK: next-themes emas, o'zimizning provider
import { useTheme } from "@/components/ui/theme-provider";
import { useParams, usePathname } from "next/navigation";
import { navLinks } from "@/constants";
import { cn } from "@/lib/utils";
import useTranslate from "@/hooks/use-translate";
import Link from "next/link";
import Logo from "./logo";
import ModeToggle from "./mode-toggle";
import UserBox from "./user-box";
import { Menu, X, ChevronRight } from "lucide-react";
import LanguageChanger from "./language-changer";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 2. O'zimizning resolvedTheme'ni olamiz
  const { resolvedTheme } = useTheme();

  const t = useTranslate();
  const { lng } = useParams();
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // SSR xatoliklarini oldini olish
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <>
      {/* HEADER */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[70] flex h-[10vh] items-center justify-between px-4 backdrop-blur-xl border-b transition-all duration-300 lg:px-8",
          isDark
            ? "bg-slate-950/60 border-white/5"
            : "bg-white/60 border-slate-200",
        )}
      >
        <Logo />

        {/* --- DESKTOP NAV --- */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const href =
              link.route === "" ? `/${lng}` : `/${lng}/${link.route}`;
            const isActive = pathname === href;
            return (
              <Link
                href={href}
                key={link.route}
                className={cn(
                  "relative font-medium transition-colors sm:text-sm text-lg duration-300 flex items-center gap-2",
                  isActive
                    ? "text-blue-600 text-xl after:absolute after:-bottom-[3.5vh] after:left-0 after:h-[2px] after:w-full after:bg-blue-500"
                    : isDark
                      ? "text-slate-400 hover:text-blue-600"
                      : "text-slate-600 hover:text-blue-600",
                )}
              >
                {link.icon && <link.icon className="size-5 sm:size-4" />}
                {t(link.name)}
              </Link>
            );
          })}
        </nav>

        {/* O'ng tomon */}
        <div className="flex items-center gap-2">
          <LanguageChanger />
          <ModeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "md:hidden p-2 rounded-xl transition-all active:scale-95",
              isDark
                ? "bg-slate-800 text-white"
                : "bg-slate-100 text-slate-900",
            )}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <UserBox />
        </div>
      </header>

      {/* --- MOBILE NAV --- */}
      <div
        className={cn(
          "fixed inset-x-0 top-0 z-[60] w-full transition-all duration-500 ease-in-out md:hidden border-b shadow-2xl",
          isDark
            ? "bg-slate-950 border-slate-800 text-white"
            : "bg-white border-slate-200 text-slate-900",
          isOpen
            ? "translate-y-[10vh] opacity-100"
            : "-translate-y-full opacity-0",
        )}
      >
        <nav className="flex flex-col p-6 gap-3">
          {navLinks.map((link) => {
            const href =
              link.route === "" ? `/${lng}` : `/${lng}/${link.route}`;
            const isActive = pathname === href;

            return (
              <Link
                href={href}
                key={link.route}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl text-lg font-bold transition-all",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : isDark
                      ? "text-slate-400 hover:bg-slate-900"
                      : "text-slate-600 hover:bg-blue-50 hover:text-blue-600",
                )}
              >
                <span className="flex items-center gap-2">
                  {link.icon && <link.icon className="size-5" />}
                  {t(link.name)}
                </span>
                {isActive ? (
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                ) : (
                  <ChevronRight
                    size={18}
                    className={isDark ? "text-slate-700" : "text-slate-300"}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Background Overlay */}
      {isOpen && (
        <div
          className={cn(
            "fixed inset-0 z-[50] md:hidden backdrop-blur-sm transition-all",
            isDark ? "bg-black/60" : "bg-slate-900/20",
          )}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

export default Navbar;
