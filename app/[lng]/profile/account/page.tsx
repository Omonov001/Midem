/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  AtSign,
  ShieldCheck,
  KeyRound,
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Gamepad2,
  Trophy,
  Clock,
  Wallet,
  Settings,
  Lock,
  ExternalLink,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  deleteUserAccount,
  getUserData,
  updateUserData,
} from "@/actions/user.action";
import { IUser } from "@/models/user.model";
import { cn } from "@/lib/utils";
import CustomUserProfileModal from "@/components/modals/userProfile";

export default function Page() {
  const [mounted, setMounted] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<"profile" | "stats" | "settings">(
    "profile",
  );
  const [userData, setUserData] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getUserData();
        if (data) {
          setUserData(data);
          setName(data.name || "");
          setUsername(data.username || "");
        }
      } catch (err) {
        console.error("User malumotlarini olishda xatolik:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await updateUserData({ name, username });

      if (res.success) {
        setSuccessMsg("Malumotlar muvaffaqiyatli saqlandi!");
        if (res.data) setUserData(res.data);
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg(res.error || "Saqlashda xatolik yuz berdi");
      }
    } catch (err) {
      console.error("Saqlashda xatolik:", err);
      setErrorMsg("Kutilmagan xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  const ConfirmAndDeleteAccount = async () => {
    try {
      setDeleting(true);
      const res = await deleteUserAccount();
      if (res?.success) {
        window.location.href = "/";
      } else {
        alert(res?.error || "Hisobni ochirishda xatolik yuz berdi");
        setShowDeleteModal(false);
      }
    } catch (err) {
      console.error("Ochirishda xatolik:", err);
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-slate-400 animate-pulse">
          <Loader2 size={40} className="animate-spin text-blue-600" />
          <p className="font-semibold text-xs tracking-widest uppercase">
            Sozlamalar yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  const avatarUrl =
    userData?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userData?.name || "User",
    )}&background=2563eb&color=fff`;

  const formattedDate = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString("uz-UZ", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Nomalum";

  return (
    // Sidebarni (280px) va ekranni to'lib ketishini oldini olish uchun container optimallashdi
    <div className="w-full p-4 my-12 max-md:my-16 space-y-6 animate-in fade-in duration-300 overflow-x-hidden">
      <CustomUserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* --- HISOBNI OCHIRISH MODAL DIALOG --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] h-full flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 text-red-500">
              <div className="p-3 rounded-2xl bg-red-500/10 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Hisobni ochirish
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Bu amalni ortga qaytarib bolmaydi!
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Haqiqatan ham hisobingizni ochirmoqchimisiz? Barcha oyin
              natijalaringiz, yutuqlaringiz va balansingiz batamom va qaytarib
              bolmaydigan qilib ochiriladi.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={ConfirmAndDeleteAccount}
                disabled={deleting}
                className="px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                {deleting ? "Ochirilmoqda..." : "Ha, ochirilsin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER TITLE --- */}
      <div className="space-y-1 border-b border-slate-200 dark:border-white/10 pb-4">
        <h1 className="text-2xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Hisob va Profil Sozlamalari
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Shaxsiy malumotlaringiz, statistika va xavfsizlik sozlamalarini
          boshqaring.
        </p>
      </div>

      {/* --- TABS NAVIGATION (Scrollbar-less mobile tab nav) --- */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200/60 dark:border-white/10 pb-2 no-scrollbar">
        {/* 1. Profil */}
        <button
          onClick={() => setActiveTab("profile")}
          className={cn(
            "px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 cursor-pointer",
            activeTab === "profile"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
          )}
        >
          <User size={16} />
          <span className="sm:hidden lg:inline max-md:hidden md:hidden">
            Profil Malumotlari
          </span>
          <span className="md:inline lg:hidden sm:inline">Profil</span>
        </button>

        {/* 2. Statistika */}
        <button
          onClick={() => setActiveTab("stats")}
          className={cn(
            "px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 cursor-pointer",
            activeTab === "stats"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
          )}
        >
          <Trophy size={16} />
          <span className="sm:hidden lg:inline max-md:hidden md:hidden">
            Kengaytirilgan Statistika
          </span>
          <span className="md:inline lg:hidden sm:inline">Statistika</span>
        </button>

        {/* 3. Sozlamalar */}
        <button
          onClick={() => setActiveTab("settings")}
          className={cn(
            "px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 cursor-pointer",
            activeTab === "settings"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
          )}
        >
          <Settings size={16} />
          <span className="sm:hidden lg:inline max-md:hidden md:hidden">
            Hisob Boshqaruvi
          </span>
          <span className="md:inline lg:hidden sm:inline">Sozlamalar</span>
        </button>
      </div>

      {/* --- TAB CONTENT --- */}
      {/* --- TAB 1: PROFIL & XAVFSIZLIK --- */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar & Quick Stats Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xl flex flex-col items-center text-center space-y-4">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden ring-4 ring-blue-600/20 shadow-xl bg-slate-800 shrink-0">
                <Image
                  src={avatarUrl}
                  alt={userData?.name || "User Avatar"}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div className="w-full">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {userData?.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  @{userData?.username || "username"}
                </p>
              </div>

              {/* Status information */}
              <div className="w-full pt-4 border-t border-slate-200/60 dark:border-white/5 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Rol:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 uppercase tracking-wider text-[10px] font-black">
                    {userData?.role || "user"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Rank:</span>
                  <span className="text-amber-500 uppercase font-black">
                    {userData?.rank || "Bronze"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Royxatdan otilgan:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px] truncate max-w-[120px] text-right">
                    {formattedDate}
                  </span>
                </div>
              </div>

              {/* Custom Modal Trigger */}
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="w-full mt-2 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-200 dark:border-white/10"
              >
                <ShieldCheck size={16} className="text-blue-500 shrink-0" />
                <span className="truncate">Xavfsizlik & Parol Sozlamalari</span>
                <ExternalLink size={12} className="opacity-50 shrink-0" />
              </button>
            </div>
          </div>

          {/* Form Edit */}
          <div className="lg:col-span-2 space-y-6">
            <form
              onSubmit={handleSave}
              className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xl space-y-5"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Shaxsiy Malumotlarni Tahrirlash
              </h3>

              {successMsg && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Ismingiz
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
                      placeholder="Ismingizni kiriting"
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Username
                  </label>
                  <div className="relative flex items-center">
                    <AtSign className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
                      placeholder="username"
                    />
                  </div>
                </div>

                {/* Email (Readonly) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      disabled
                      value={userData?.email || ""}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-200/50 dark:bg-slate-800/20 border border-slate-200/50 dark:border-white/5 rounded-2xl text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Parolni va Xavfsizlikni boshqarish bolimi (Kichik ekran uchun flex-col) */}
              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Lock size={14} className="text-blue-500 shrink-0" /> Parol
                    va 2FA Autentifikatsiya
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Parolingizni va avatar rasmingizni modal orqali
                    ozgartirishingiz mumkin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer shrink-0 text-center"
                >
                  Ozgartirish
                </button>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TAB 2: KENGAYTIRILGAN STATISTIKA --- */}
      {activeTab === "stats" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xl space-y-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl w-fit">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Umumiy Balans
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
                ${(userData?.balance || 0).toFixed(2)}
              </h3>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xl space-y-3">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl w-fit">
              <Gamepad2 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Oynalgan Oyinlar
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {userData?.gamesCount || 0} ta
              </h3>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xl space-y-3">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl w-fit">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Yutuqlar (Achievements)
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {userData?.achievements || 0} ta
              </h3>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xl space-y-3">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl w-fit">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Oyindagi Umrbod Vaqt
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {userData?.playtime || 0} soat
              </h3>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xl space-y-3">
            <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-2xl w-fit">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Azolik Sanasi
              </p>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                {formattedDate}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: HISOB BOSHQARUVI --- */}
      {activeTab === "settings" && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xl space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-600" />
            Hisob Boshqaruvi
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
            <div className="space-y-1">
              <p className="text-xs font-bold text-red-500">Hisobni Ochirish</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Hisobingizni ochirsangiz, barcha oyin natijalaringiz va
                balansingiz qaytarib bolmaydigan qilib yoqotiladi.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
            >
              <Trash2 size={14} />
              Hisobni Ochirish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
