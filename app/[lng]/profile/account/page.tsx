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

  // Account delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

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

  // --------------------------------------------------
  // SAVE PROFILE
  // --------------------------------------------------

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await updateUserData({
        name,
        username,
      });

      if (res.success) {
        setSuccessMsg("Malumotlar muvaffaqiyatli saqlandi!");

        if (res.data) {
          setUserData(res.data);

          // Yangi usernameni ham yangilaymiz
          setUsername(res.data.username || "");
        }

        setTimeout(() => {
          setSuccessMsg("");
        }, 3000);
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

  // --------------------------------------------------
  // DELETE ACCOUNT
  // --------------------------------------------------

  /*
   * MUHIM:
   * Delete uchun userData?.username emas,
   * sahifada ishlayotgan username stateidan foydalanamiz.
   */
  const expectedUsername = username;

  /*
   * Faqat username 100% bir xil bolsa
   * delete tugmasi ishlaydi.
   */
  const canDelete =
    expectedUsername.length > 0 && deleteConfirmation === expectedUsername;

  const openDeleteModal = () => {
    setDeleteConfirmation("");
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setDeleteConfirmation("");
    setShowDeleteModal(false);
  };

  const ConfirmAndDeleteAccount = async () => {
    // Username togri yozilmagan bolsa hech narsa qilmaymiz
    if (!canDelete) {
      return;
    }

    try {
      setDeleting(true);

      const res = await deleteUserAccount();

      if (res?.success) {
        window.location.href = "/";
      } else {
        alert(res?.error || "Hisobni ochirishda xatolik yuz berdi");

        setDeleteConfirmation("");
        setShowDeleteModal(false);
      }
    } catch (err) {
      console.error("Ochirishda xatolik:", err);

      setDeleteConfirmation("");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  // --------------------------------------------------
  // AVATAR
  // --------------------------------------------------

  const avatarUrl =
    (userData as any)?.picture || (userData as any)?.image || "";

  // --------------------------------------------------
  // DATE
  // --------------------------------------------------

  const formattedDate = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString("uz-UZ", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Nomalum";

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (!mounted || loading) {
    return (
      <div className="flex min-h-screen my-10 items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-blue-600" />

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Profil yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN
  // --------------------------------------------------

  return (
    <div className="min-h-screen my-10 bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* HEADER */}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Profil
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Hisobingiz va profilingizni boshqaring.
          </p>
        </div>

        {/* MESSAGES */}

        {successMsg && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-400">
            <CheckCircle2 size={19} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
            <AlertCircle size={19} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          {/* SIDEBAR */}

          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-slate-900">
            {/* USER */}

            <div className="mb-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-500">
                      <User size={24} />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900 dark:text-white">
                    {userData?.name || "User"}
                  </p>

                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    @{userData?.username || "username"}
                  </p>
                </div>
              </div>
            </div>

            {/* NAVIGATION */}

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                  activeTab === "profile"
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                )}
              >
                <User size={18} />
                Profil
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("stats")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                  activeTab === "stats"
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                )}
              >
                <Trophy size={18} />
                Statistika
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                  activeTab === "settings"
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                )}
              >
                <Settings size={18} />
                Sozlamalar
              </button>
            </div>
          </aside>

          {/* CONTENT */}

          <main>
            {/* PROFILE */}

            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-6">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Profil malumotlari
                      </h2>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Shaxsiy malumotlaringizni yangilang.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowProfileModal(true)}
                      className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-slate-800 sm:flex sm:items-center sm:gap-2"
                    >
                      <ExternalLink size={16} />
                      Profilni korish
                    </button>
                  </div>

                  <form onSubmit={handleSave} className="space-y-5">
                    {/* NAME */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Ism
                      </label>

                      <div className="relative">
                        <User
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          type="text"
                          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                          placeholder="Ismingiz"
                        />
                      </div>
                    </div>

                    {/* USERNAME */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Username
                      </label>

                      <div className="relative">
                        <AtSign
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          type="text"
                          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                          placeholder="username"
                        />
                      </div>
                    </div>

                    {/* EMAIL */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Email
                      </label>

                      <div className="relative">
                        <Mail
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          value={(userData as any)?.email || ""}
                          readOnly
                          type="email"
                          className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-3 pl-10 pr-4 text-sm text-slate-500 outline-none dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-400"
                        />
                      </div>

                      <p className="mt-2 text-xs text-slate-400">
                        Emailni bu yerdan ozgartirib bolmaydi.
                      </p>
                    </div>

                    {/* SAVE */}

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <Save size={17} />
                        )}

                        {saving ? "Saqlanmoqda..." : "Saqlash"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* ACCOUNT INFO */}

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-6">
                  <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">
                    Hisob malumotlari
                  </h2>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                      <div className="mb-2 flex items-center gap-2 text-slate-400">
                        <Calendar size={17} />
                        <span className="text-xs">Royxatdan otgan</span>
                      </div>

                      <p className="font-medium text-slate-900 dark:text-white">
                        {formattedDate}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                      <div className="mb-2 flex items-center gap-2 text-slate-400">
                        <ShieldCheck size={17} />
                        <span className="text-xs">Hisob holati</span>
                      </div>

                      <p className="font-medium text-green-600 dark:text-green-400">
                        Faol
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STATS */}

            {activeTab === "stats" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Statistika
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    MIDEMdagi faoliyatingiz.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
                    <Gamepad2 size={22} className="mb-4 text-blue-600" />

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Oyinlar
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                      {(userData as any)?.gamesCount || 0}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
                    <Trophy size={22} className="mb-4 text-yellow-500" />

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Yutuqlar
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                      {(userData as any)?.achievements?.length || 0}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
                    <Clock size={22} className="mb-4 text-purple-500" />

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Oynash vaqti
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                      {(userData as any)?.playtime || 0}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
                    <Wallet size={22} className="mb-4 text-green-500" />

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Balans
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                      ${Number((userData as any)?.balance || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS */}

            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* SECURITY */}

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                      <Lock size={20} />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900 dark:text-white">
                        Xavfsizlik
                      </h2>

                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Hisobingiz xavfsizligi.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <Mail size={19} className="text-slate-400" />

                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            Email
                          </p>

                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {(userData as any)?.email || "Email mavjud emas"}
                          </p>
                        </div>
                      </div>

                      <CheckCircle2 size={19} className="text-green-500" />
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <KeyRound size={19} className="text-slate-400" />

                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            Autentifikatsiya
                          </p>

                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Hisobingiz himoyalangan
                          </p>
                        </div>
                      </div>

                      <ShieldCheck size={19} className="text-green-500" />
                    </div>
                  </div>
                </div>

                {/* DANGER ZONE */}

                <div className="rounded-3xl border border-red-200 bg-white p-5 shadow-sm dark:border-red-900/40 dark:bg-slate-900 sm:p-6">
                  <div className="mb-5 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                      <Trash2 size={20} />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900 dark:text-white">
                        Xavfli zona
                      </h2>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Hisobni ochirish kabi qaytarib bolmaydigan amallar.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4 dark:border-red-900/30 dark:bg-red-950/10">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          Hisobni ochirish
                        </p>

                        <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
                          Hisobingiz, oyin natijalaringiz, yutuqlaringiz va
                          boshqa malumotlaringiz butunlay ochiriladi.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={openDeleteModal}
                        className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/40 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        <Trash2 size={17} />
                        Hisobni ochirish
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ========================================== */}
      {/* PROFILE MODAL */}
      {/* ========================================== */}

      {showProfileModal && (
        <CustomUserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* ========================================== */}
      {/* DELETE ACCOUNT MODAL */}
      {/* ========================================== */}

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[9999] flex h-full items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <div className="relative w-full max-w-md space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl animate-in zoom-in-95 duration-200 dark:border-white/10 dark:bg-slate-900 sm:p-6">
            {/* CLOSE */}

            <button
              type="button"
              onClick={closeDeleteModal}
              disabled={deleting}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X size={18} />
            </button>

            {/* TITLE */}

            <div className="flex items-start gap-3 pr-8">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                <AlertTriangle size={22} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Hisobni ochirish
                </h3>

                <p className="mt-1 text-sm font-medium text-red-500">
                  Bu amalni ortga qaytarib bolmaydi!
                </p>
              </div>
            </div>

            {/* WARNING */}

            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-950/10">
              <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                Haqiqatan ham hisobingizni ochirmoqchimisiz? Barcha oyin
                natijalaringiz, yutuqlaringiz, balansingiz va hisob
                malumotlaringiz butunlay ochiriladi.
              </p>
            </div>

            {/* USERNAME CONFIRMATION */}

            <div>
              <label
                htmlFor="delete-confirmation"
                className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                Tasdiqlash uchun usernameingizni yozing:
              </label>

              <p className="mb-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Quyidagi usernameni aynan shunday yozing:
              </p>

              {/* HAQIQIY USERNAME */}

              <div className="mb-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-800">
                <AtSign size={16} className="shrink-0 text-slate-400" />

                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  {username || "username"}
                </span>
              </div>

              {/* INPUT */}

              <div className="relative">
                <AtSign
                  size={18}
                  className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2",
                    canDelete ? "text-green-500" : "text-slate-400",
                  )}
                />

                <input
                  id="delete-confirmation"
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={deleting}
                  placeholder={username || "username"}
                  className={cn(
                    "w-full rounded-xl border bg-white py-3 pl-10 pr-4 font-mono text-sm outline-none transition dark:bg-slate-800 dark:text-white",
                    canDelete
                      ? "border-green-500 ring-2 ring-green-500/10"
                      : "border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 dark:border-white/10",
                  )}
                />
              </div>

              {/* STATUS */}

              {deleteConfirmation.length > 0 && (
                <div
                  className={cn(
                    "mt-2 flex items-center gap-2 text-xs font-medium",
                    canDelete
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-500",
                  )}
                >
                  {canDelete ? (
                    <>
                      <CheckCircle2 size={14} />
                      Username togri. Hisobni ochirish mumkin.
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} />
                      Username mos kelmayapti.
                    </>
                  )}
                </div>
              )}
            </div>

            {/* BUTTONS */}

            <div className="flex flex-col-reverse gap-2.5 pt-1 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Bekor qilish
              </button>

              <button
                type="button"
                onClick={ConfirmAndDeleteAccount}
                disabled={deleting || !canDelete}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition",
                  canDelete
                    ? "bg-red-600 hover:bg-red-700"
                    : "cursor-not-allowed bg-red-300 dark:bg-red-950/50",
                )}
              >
                {deleting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Ochirilmoqda...
                  </>
                ) : (
                  <>
                    <Trash2 size={17} />
                    Ha, hisobni ochirish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
