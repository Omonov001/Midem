/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  User,
  Settings,
  LogOut,
  ShieldCheck,
  Crown,
  UserCircle,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";
import useTranslate from "@/hooks/use-translate";
import Link from "next/link";
import { MdDeveloperBoard } from "react-icons/md";
import { useParams } from "next/navigation";

// ✅ SignedIn va SignedOut larsiz, faqat hooklar va modal tugmalar
import {
  useAuth,
  useClerk,
  useUser,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";

function UserBox() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const t = useTranslate();
  const { lng } = useParams();

  // Clerk hook'lari
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return <div className="size-10" />;

  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
      {/* 1. FOYDALANUVCHI TIZIMGA KIRMAGAN BO'LSA */}
      {!isSignedIn ? (
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Kirish - Kichik va o'rtacha ekranda faqat icon, katta ekranda (lg) matn bilan */}
          <SignInButton mode="modal">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "flex items-center gap-2 rounded-xl font-bold transition-all active:scale-95 h-9 px-2.5 lg:px-3.5",
                isDark
                  ? "bg-slate-900/50 border-white/10 hover:bg-blue-500/10 hover:border-blue-500/50 text-white"
                  : "bg-white border-slate-200 hover:border-blue-600 hover:text-blue-600 shadow-sm text-slate-700",
              )}
            >
              <LogIn className="size-4 shrink-0" />
              <span className="hidden lg:inline">{t("login") || "Kirish"}</span>
            </Button>
          </SignInButton>

          {/* Ro'yxatdan o'tish */}
          <SignUpButton mode="modal">
            <Button
              size="sm"
              className="hidden sm:flex items-center gap-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all h-9 px-2.5 lg:px-3.5"
            >
              <UserPlus className="size-4 shrink-0" />
              <span className="hidden xl:inline">
                {t("register") || "Ro'yxatdan o'tish"}
              </span>
            </Button>
          </SignUpButton>
        </div>
      ) : (
        /* 2. FOYDALANUVCHI TIZIMGA KIRGAN BO'LSA */
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "relative size-9 sm:size-10 p-0 cursor-pointer rounded-xl border-2 transition-all duration-300 active:scale-90 outline-none overflow-hidden shrink-0",
                isDark
                  ? "bg-slate-900/50 border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 text-white"
                  : "bg-white border-slate-200 hover:border-blue-600 hover:text-blue-600 shadow-sm text-slate-700",
              )}
            >
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName || "User Avatar"}
                  className="size-full object-cover"
                />
              ) : (
                <User className="size-5" />
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            sideOffset={10}
            align="end"
            className={cn(
              "z-[100] w-60 sm:w-64 p-2 rounded-2xl border backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200",
              isDark
                ? "bg-slate-950/90 border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] text-white"
                : "bg-white/95 border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.1)] text-slate-900",
            )}
          >
            <div className="px-3 py-2">
              <p className="text-sm font-bold truncate">
                {user?.fullName || user?.username || "Foydalanuvchi"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>

            <DropdownMenuLabel
              className={cn(
                "px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] opacity-50 italic",
                !isDark && "text-slate-500",
              )}
            >
              {t("MyAccount")}
            </DropdownMenuLabel>

            <DropdownMenuSeparator
              className={isDark ? "bg-white/5" : "bg-slate-100"}
            />

            <DropdownMenuGroup className="space-y-1">
              <Link href={`/${lng}/profile`}>
                <DropdownMenuItem
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors focus:bg-blue-500/10 focus:text-blue-600 outline-none",
                    !isDark && "hover:bg-slate-50",
                  )}
                >
                  <UserCircle className="size-4" />
                  <span className="flex-1 font-bold italic">
                    {t("Profile")}
                  </span>
                </DropdownMenuItem>
              </Link>

              <Link href={`/${lng}/owner`}>
                <DropdownMenuItem
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all outline-none",
                    isDark
                      ? "focus:bg-indigo-500/10"
                      : "focus:bg-indigo-50 hover:bg-indigo-50/50",
                  )}
                >
                  <Crown className="size-4 text-indigo-500" />
                  <span className="flex-1 font-black italic bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                    {t("Owner")}
                  </span>
                  <div className="size-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1] group-hover:animate-ping" />
                </DropdownMenuItem>
              </Link>

              <Link href={`/${lng}/admin`}>
                <DropdownMenuItem
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors focus:bg-emerald-500/10 focus:text-emerald-600 outline-none",
                    !isDark && "hover:bg-slate-50",
                  )}
                >
                  <ShieldCheck className="size-4 text-emerald-500" />
                  <span className="flex-1 text-emerald-500 font-bold italic">
                    {t("AdminPanel")}
                  </span>
                </DropdownMenuItem>
              </Link>

              <Link href={`/${lng}/developer`}>
                <DropdownMenuItem
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors focus:bg-blue-500/10 focus:text-blue-600 outline-none",
                    !isDark && "hover:bg-slate-50",
                  )}
                >
                  <MdDeveloperBoard className="size-4 text-amber-300" />
                  <span className="flex-1 text-amber-300 font-bold italic">
                    {t("Developer")}
                  </span>
                </DropdownMenuItem>
              </Link>

              <Link href={`/${lng}/profile/settings`}>
                <DropdownMenuItem
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors focus:bg-blue-500/10 focus:text-blue-600 outline-none",
                    !isDark && "hover:bg-slate-50",
                  )}
                >
                  <Settings className="size-4" />
                  <span className="flex-1 font-bold italic">
                    {t("settings")}
                  </span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>

            <DropdownMenuSeparator
              className={isDark ? "bg-white/5" : "bg-slate-100"}
            />

            <DropdownMenuItem
              onClick={() => signOut({ redirectUrl: `/${lng}` })}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-600 font-black italic outline-none"
            >
              <LogOut className="size-4" />
              <span className="flex-1">{t("logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

export default UserBox;
