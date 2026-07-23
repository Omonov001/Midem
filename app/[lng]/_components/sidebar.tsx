"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/ui/theme-provider";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CgProfile } from "react-icons/cg";
import useTranslate from "@/hooks/use-translate";

// 1. Interfacega tashqaridan keladigan proplarni qo'shamiz
interface SidebarProps {
  navItems: {
    label: string;
    href: string;
    icon: React.ReactNode;
  }[];
  title?: string;
  isOpen: boolean; // Qo'shildi
  setIsOpen: (open: boolean) => void; // Qo'shildi
}

function Sidebar({
  navItems,
  title = "Profile",
  isOpen,
  setIsOpen,
}: SidebarProps) {
  // const [isOpen, setIsOpen] = useState(false); <-- Buni o'chirib tashladik
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const t = useTranslate();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Sahifa o'zgarganda mobil menyu avtomatik yopilishi uchun
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <>
      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed left-0 transition-all duration-500 ease-in-out md:translate-x-0",
          "top-0 z-[100] h-screen w-[280px] md:top-[10vh] md:h-[90vh] md:z-[60]",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isDark
            ? "bg-slate-950 border-r border-white/5"
            : "bg-white border-r border-slate-200",
        )}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <CgProfile size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight uppercase italic">
              {t(title)}
            </span>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`) ||
                (pathname.length > 3 && pathname.substring(3) === item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all duration-300",
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5",
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-blue-400 blur-[20px] opacity-60 z-[-1] animate-pulse" />
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-white rounded-r-full shadow-[0_0_15px_#fff]" />
                  )}
                  <div
                    className={cn(isActive ? "text-white" : "text-blue-500")}
                  >
                    {item.icon}
                  </div>
                  <span className="text-[14px] z-10">{t(item.label)}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 mt-auto border-t border-slate-200 dark:border-white/5">
            <button className="flex items-center gap-4 w-full p-3.5 rounded-xl font-bold text-red-500 hover:bg-red-500/5 transition-all">
              <LogOut size={20} />
              <span className="text-sm uppercase tracking-wider">
                {t("logout")}
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[95] bg-black/40 md:hidden"
          onClick={() => setIsOpen(false)} // Bosilganda yopadi
        />
      )}
    </>
  );
}

export default Sidebar;
