/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  X,
  User,
  Shield,
  Key,
  Mail,
  Camera,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomUserProfileModal({
  isOpen,
  onClose,
}: UserProfileModalProps) {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  // Form statelari
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Parol statelari
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passUpdating, setPassUpdating] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);

  // ESC tugmasini bosganda yopilish logikasi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Profil malumotlarini yangilash
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setUpdating(true);
      setErrorMsg("");
      await user.update({
        firstName,
        lastName,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Profilni yangilashda xatolik:", err);
      setErrorMsg(err?.errors?.[0]?.message || "Xatolik yuz berdi");
    } finally {
      setUpdating(false);
    }
  };

  // Avatar yuklash
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUpdating(true);
      setErrorMsg("");
      await user.setProfileImage({ file });
    } catch (err: any) {
      console.error("Rasm yuklashda xatolik:", err);
      setErrorMsg("Rasm yuklashda xatolik yuz berdi");
    } finally {
      setUpdating(false);
    }
  };

  // Parolni ozgartirish (updatePassword)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setPassUpdating(true);
      setErrorMsg("");

      await user.updatePassword({
        currentPassword,
        newPassword,
      });

      setPassSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (err: any) {
      console.error("Parol yangilashda xatolik:", err);
      setErrorMsg(
        err?.errors?.[0]?.message || "Parolni ozgartirishda xatolik yuz berdi",
      );
    } finally {
      setPassUpdating(false);
    }
  };

  return (
    /* Tashqarisini (backdrop) bosganda onClose chaqiriladi */
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Modal Card - e.stopPropagation() ichki clicklarni yuqoriga uzatmaydi */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" /> Profil va Xavfsizlik
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col sm:flex-row min-h-[400px]">
          {/* Sidebar */}
          <div className="w-full sm:w-56 p-4 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-1">
            <button
              onClick={() => {
                setActiveTab("profile");
                setErrorMsg("");
              }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
              }`}
            >
              <User size={16} /> Profil Sozlamalari
            </button>
            <button
              onClick={() => {
                setActiveTab("security");
                setErrorMsg("");
              }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "security"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
              }`}
            >
              <Key size={16} /> Xavfsizlik & Parol
            </button>
          </div>

          {/* Main Body */}
          <div className="flex-1 p-6">
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} />
                {errorMsg}
              </div>
            )}

            {!isLoaded ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : activeTab === "profile" ? (
              /* --- PROFIL TABI --- */
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden group border-2 border-blue-600/20">
                    <Image
                      src={user?.imageUrl || "/default-avatar.png"}
                      alt="User Avatar"
                      fill
                      className="object-cover"
                    />
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                      <Camera className="w-6 h-6 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Rasm almashtirish
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Rasm ustiga bosing (PNG, JPG)
                    </p>
                  </div>
                </div>

                {/* Inputlar */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Ism
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Ismingiz"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Familiya
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Familiyangiz"
                    />
                  </div>
                </div>

                {/* Saqlash tugmasi */}
                <div className="flex items-center justify-between pt-2">
                  {success && (
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                      <Check size={16} /> Saqlandi!
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={updating}
                    className="ml-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                    Saqlash
                  </button>
                </div>
              </form>
            ) : (
              /* --- XAVFSIZLIK TABI --- */
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    Email manzilingiz
                  </h3>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm">
                    <Mail size={16} className="text-blue-500" />
                    <span>{user?.primaryEmailAddress?.emailAddress}</span>
                  </div>
                </div>

                <form
                  onSubmit={handleUpdatePassword}
                  className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4"
                >
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Parolni Ozgartirish
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Hozirgi Parol
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Yangi Parol
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {passSuccess && (
                      <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                        <Check size={16} /> Parol ozgartirildi!
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={passUpdating}
                      className="ml-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {passUpdating && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      Parolni Yangilash
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
