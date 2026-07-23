"use client";

import { useEffect, useState } from "react";
// 1. O'zimizning providerga almashtirdik
import { useTheme } from "@/components/ui/theme-provider";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Logo from "./logo";
import { BsInstagram, BsTelegram, BsYoutube } from "react-icons/bs";
import { SiRoblox } from "react-icons/si";
import useTranslate from "@/hooks/use-translate";

function Footer() {
  const t = useTranslate();
  const [mounted, setMounted] = useState(false);
  // 2. resolvedTheme bizning providerdan keladi
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  const socialLinks = [
    { icon: BsYoutube, href: "#", color: "hover:bg-red-600" },
    { icon: BsTelegram, href: "#", color: "hover:bg-blue-400" },
    { icon: SiRoblox, href: "#", color: "hover:bg-blue-700" },
    { icon: BsInstagram, href: "#", color: "hover:bg-pink-600" },
  ];

  return (
    <footer
      className={cn(
        "relative w-full border-t transition-all duration-300 mt-10",
        isDark
          ? "bg-slate-950 text-slate-400 border-white/5"
          : "bg-slate-50 text-slate-600 border-slate-200",
      )}
    >
      {/* Dekorativ Gradient */}
      {isDark && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      )}

      <div className="container mx-auto px-6 py-16 lg:px-12">
        <div className="flex items-center justify-center gap-y-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-8">
          {/* Brend va Tarif */}
          <div className="lg:col-span-4 items-center justify-center flex flex-col gap-6">
            <div className="scale-110 origin-left">
              <Logo />
            </div>
            <p className="w-full max-w-5xl text-2xl md:text-xl font-black tracking-[0.001em] text-center uppercase transition-all duration-300">
              {t("FooterText")}
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social, idx) => (
                <Link
                  key={idx}
                  href={social.href}
                  className={cn(
                    "group p-2.5 rounded-xl transition-all duration-300 shadow-sm",
                    isDark
                      ? "bg-slate-900 text-slate-400"
                      : "bg-white text-slate-600",
                    "hover:-translate-y-1 hover:text-white",
                    social.color,
                  )}
                >
                  <social.icon size={20} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Pastki qism: Copyright */}
        <div
          className={cn(
            "mt-16 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium uppercase tracking-widest",
            isDark
              ? "border-white/5 text-slate-500"
              : "border-slate-200 text-slate-400",
          )}
        >
          <p>
            © {new Date().getFullYear()} {t("FooterText2")}
          </p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-blue-500 transition-colors">
              {t("FooterText3")}
            </Link>
            <Link href="#" className="hover:text-blue-500 transition-colors">
              {t("FooterText4")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
