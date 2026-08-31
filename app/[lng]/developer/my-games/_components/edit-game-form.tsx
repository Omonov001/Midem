/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { handleGameUpdate } from "@/lib/update";
import {
  LanguageType,
  PlatformType,
  ILangSpecificData,
  ITechnicalDetails,
  IOSRequirement,
  IOSDetail,
} from "@/models/game.model";
import {
  IoEyeOutline,
  IoEyeOffOutline,
  IoImageOutline,
  IoAddCircleOutline,
  IoTrashOutline,
  IoLogoWindows,
  IoLogoApple,
  IoLogoAndroid,
  IoTerminal,
  IoFolderOpenOutline,
  IoCloudUploadOutline,
  IoSaveOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoCloseOutline,
} from "react-icons/io5";

export default function EditGameForm({ gameSlug }: { gameSlug: string }) {
  const router = useRouter();

  // Statelar
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🚀 Tanlangan fayllarni R2 ga yubormay vaqtincha saqlab turish uchun state
  const [pendingOSFiles, setPendingOSFiles] = useState<Record<string, File>>(
    {},
  );

  // Custom Modal State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showModal = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "info",
    onConfirm?: () => void,
  ) => {
    setModal({ isOpen: true, title, message, type, onConfirm });
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Game statelari
  const [gameId, setGameId] = useState<string>("");
  const [activeLang, setActiveLang] = useState<LanguageType>("uz");
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [slug, setSlug] = useState<string>("");
  const [platform, setPlatform] = useState<PlatformType>("pc");
  const [selectedOS, setSelectedOS] = useState<Record<string, boolean>>({});
  const [osDetails, setOsDetails] = useState<Record<string, IOSDetail>>({});
  const [priceType, setPriceType] = useState<"free" | "paid">("free");
  const [price, setPrice] = useState<string>("0$");

  const [techData, setTechData] = useState<ITechnicalDetails>({
    version: "",
    downloadSize: "",
    inGameSize: "",
    developer: "",
    releaseDate: "",
  });

  const [langData, setLangData] = useState<
    Record<LanguageType, ILangSpecificData>
  >({
    uz: { whatsNew: [""] },
    ru: { whatsNew: [""] },
    en: { whatsNew: [""] },
    tr: { whatsNew: [""] },
  });

  // --- BAZADAN MALUMOT OLISH ---
  useEffect(() => {
    async function fetchGameData() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/games/${gameSlug}`);
        if (!res.ok)
          throw new Error("Oyin malumotlarini bazadan yuklashda xatolik!");

        const data = await res.json();

        setGameId(data._id || "");
        setSlug(data.slug || gameSlug);
        setVisibility(data.visibility || "private");
        setPlatform(data.platform || "pc");
        setSelectedOS(data.selectedOS || {});
        setOsDetails(data.osDetails || {});
        setPriceType(data.priceType || "free");
        setPrice(data.price || "0$");
        setTechData(
          data.techData || {
            version: "",
            downloadSize: "",
            inGameSize: "",
            developer: "",
            releaseDate: "",
          },
        );

        setLangData({
          uz: { whatsNew: [""], ...data.langData?.uz },
          ru: { whatsNew: [""], ...data.langData?.ru },
          en: { whatsNew: [""], ...data.langData?.en },
          tr: { whatsNew: [""], ...data.langData?.tr },
        });
      } catch (err: any) {
        setError(err.message || "Xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    }

    if (gameSlug) fetchGameData();
  }, [gameSlug]);

  // 🚀 FAYL TANLANGANDA: R2 GA YUBORILMAYDI, FAQAT STATEGA SAQLANADI
  const handleFolderFileChange = (
    os: string,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingOSFiles((prev) => ({
      ...prev,
      [os]: file,
    }));
  };

  const handleTextChange = (
    lang: LanguageType,
    field: keyof ILangSpecificData,
    value: string,
  ) => {
    setLangData((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }));

    if (lang === "uz" && field === "title") {
      const generated = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generated);
    }
  };

  const handleTechChange = (field: keyof ITechnicalDetails, value: string) => {
    setTechData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddWhatsNew = (lang: LanguageType) => {
    setLangData((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        whatsNew: [...(prev[lang]?.whatsNew || []), ""],
      },
    }));
  };

  const handleWhatsNewChange = (
    lang: LanguageType,
    index: number,
    value: string,
  ) => {
    const currentList = [...(langData[lang]?.whatsNew || [""])];
    currentList[index] = value;

    setLangData((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        whatsNew: currentList,
      },
    }));
  };

  const handleRemoveWhatsNew = (lang: LanguageType, index: number) => {
    const currentList = (langData[lang]?.whatsNew || []).filter(
      (_, i) => i !== index,
    );

    setLangData((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        whatsNew: currentList.length ? currentList : [""],
      },
    }));
  };

  const toggleOS = (os: string) => {
    setSelectedOS((prev) => ({ ...prev, [os]: !prev[os] }));
  };

  const handleOSRequirementFieldChange = (
    os: string,
    field: keyof IOSRequirement,
    value: string,
  ) => {
    setOsDetails((prev) => {
      const currentOS = prev[os] || {
        requirements: { os: "", cpu: "", gpu: "", ram: "" },
        fileName: "",
      };
      return {
        ...prev,
        [os]: {
          ...currentOS,
          requirements: { ...currentOS.requirements, [field]: value },
        },
      };
    });
  };

  const handleIconChange = (
    e: ChangeEvent<HTMLInputElement>,
    lang: LanguageType,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setLangData((prev) => ({
        ...prev,
        [lang]: { ...prev[lang], iconPreview: url },
      }));
    }
  };

  const handleScreenshotsChange = (
    e: ChangeEvent<HTMLInputElement>,
    lang: LanguageType,
  ) => {
    if (e.target.files) {
      const urls = Array.from(e.target.files).map((file) =>
        URL.createObjectURL(file),
      );
      setLangData((prev) => ({
        ...prev,
        [lang]: {
          ...prev[lang],
          screenshotPreviews: [
            ...(prev[lang]?.screenshotPreviews || []),
            ...urls,
          ],
        },
      }));
    }
  };

  const removeScreenshot = (lang: LanguageType, idx: number) => {
    setLangData((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        screenshotPreviews: (prev[lang]?.screenshotPreviews || []).filter(
          (_, i) => i !== idx,
        ),
      },
    }));
  };

  // 🚀 SAQLASH TUGMASI BOSILGANDA (Hamma ish shu yerda bajariladi)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updatedOsDetails = { ...osDetails };

      // 1. Yangi tanlangan fayllar bolsa, Ularni R2 ga yuklaymiz
      for (const os of Object.keys(pendingOSFiles)) {
        const file = pendingOSFiles[os];
        if (file) {
          const oldKey = updatedOsDetails[os]?.fileName || "";
          const result = await handleGameUpdate(file, oldKey);

          if (result.success && result.newFileKey) {
            updatedOsDetails[os] = {
              ...updatedOsDetails[os],
              fileName: result.newFileKey,
            };
          } else {
            throw new Error(
              `${os.toUpperCase()} faylini R2 ga yuklashda xatolik yuz berdi.`,
            );
          }
        }
      }

      // 2. Bazaga (MongoDB / API) malumotlarni yuboramiz
      const payload = {
        slug,
        visibility,
        platform,
        selectedOS,
        osDetails: updatedOsDetails,
        priceType,
        price: priceType === "paid" ? price : "0$",
        techData,
        langData,
        request: "requested",
      };

      const res = await fetch(`/api/games/${gameSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Saqlashda xatolik yuz berdi");

      // 3. Muvaffaqiyatli xabari va redirect
      showModal(
        "Muvaffaqiyatli!",
        "Oyin malumotlari saqlandi va fayllar yangilandi. Oyinlarim sahifasiga otasiz.",
        "success",
        () => router.push("/developer/my-games"),
      );
    } catch (err: any) {
      showModal("Xatolik!", err.message || "Xatolik yuz berdi", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const blockClass =
    "p-5 sm:p-6 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md space-y-5";
  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-white/10 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500 transition-all";

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-black uppercase italic opacity-60">
            Bazadan malumotlar yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-slate-950 text-red-500">
        <div className="text-center space-y-3">
          <p className="text-lg font-bold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-300">
      {/* CUSTOM DIALOG MODAL (z-[9999]) */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 rounded-3xl border border-white/10 bg-slate-900 shadow-2xl space-y-5">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
            >
              <IoCloseOutline size={20} />
            </button>

            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "p-3 rounded-2xl flex items-center justify-center shrink-0",
                  modal.type === "success"
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : modal.type === "error"
                      ? "bg-red-500/10 text-red-500 border border-red-500/20"
                      : "bg-blue-500/10 text-blue-500 border border-blue-500/20",
                )}
              >
                {modal.type === "success" ? (
                  <IoCheckmarkCircleOutline size={32} />
                ) : (
                  <IoAlertCircleOutline size={32} />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black uppercase italic text-white tracking-wide">
                  {modal.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {modal.message}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (modal.onConfirm) modal.onConfirm();
                  closeModal();
                }}
                className={cn(
                  "w-full py-3 rounded-xl font-black uppercase italic text-xs tracking-wider transition-all active:scale-95 shadow-md",
                  modal.type === "error"
                    ? "bg-red-600 hover:bg-red-500 text-white"
                    : "bg-blue-600 hover:bg-blue-500 text-white",
                )}
              >
                Tushunarli
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-4 border-b border-dashed border-white/10">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter italic text-white">
              O&apos;YINNI <span className="text-blue-500">TAHRIRLASH</span>
            </h1>
            <p className="text-xs sm:text-sm opacity-60 italic">
              ID: {gameId || "Nomalum"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-slate-900 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setVisibility("public")}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase italic transition-all",
                  visibility === "public"
                    ? "bg-blue-600 text-white shadow-md"
                    : "opacity-60",
                )}
              >
                <IoEyeOutline size={16} /> Public
              </button>
              <button
                type="button"
                onClick={() => setVisibility("private")}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase italic transition-all",
                  visibility === "private"
                    ? "bg-red-600 text-white shadow-md"
                    : "opacity-60",
                )}
              >
                <IoEyeOffOutline size={16} /> Private
              </button>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-black uppercase italic text-xs tracking-wider transition-all shadow-lg flex items-center gap-2"
            >
              <IoSaveOutline size={16} />
              {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 overflow-x-auto pb-2 gap-2 scrollbar-none">
          {(["uz", "ru", "en", "tr"] as LanguageType[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLang(lang)}
              className={cn(
                "px-5 py-2.5 rounded-t-xl font-black uppercase italic text-xs tracking-wider transition-all whitespace-nowrap",
                activeLang === lang
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white/5 text-slate-400 hover:bg-white/10",
              )}
            >
              {lang === "uz"
                ? "🇺🇿 UZ"
                : lang === "ru"
                  ? "🇷🇺 RU"
                  : lang === "en"
                    ? "🇺🇸 EN"
                    : "🇹🇷 TR"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {(["uz", "ru", "en", "tr"] as LanguageType[]).map((lang) => (
            <div
              key={lang}
              className={cn(
                "space-y-6",
                activeLang === lang ? "block" : "hidden",
              )}
            >
              {/* Matnlar va Tavsif */}
              <div className={blockClass}>
                <h3 className="text-sm font-black uppercase italic text-blue-500 border-b border-white/10 pb-2 tracking-wider">
                  Matnlar va Tavsif ({lang.toUpperCase()})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase opacity-60 italic">
                      O&apos;yin nomi
                    </label>
                    <input
                      value={langData[lang]?.title || ""}
                      onChange={(e) =>
                        handleTextChange(lang, "title", e.target.value)
                      }
                      className={inputClass}
                      required={activeLang === lang}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase opacity-60 italic text-blue-400">
                      URL Manzili (Slug)
                    </label>
                    <input
                      value={slug}
                      onChange={(e) =>
                        setSlug(
                          e.target.value.toLowerCase().replace(/\s+/g, "-"),
                        )
                      }
                      className={cn(
                        inputClass,
                        "font-mono border-blue-500/30 text-blue-400",
                      )}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase opacity-60 italic">
                      Yorliq (Subtitle)
                    </label>
                    <input
                      value={langData[lang]?.subtitle || ""}
                      onChange={(e) =>
                        handleTextChange(lang, "subtitle", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase opacity-60 italic">
                      Kategoriya
                    </label>
                    <input
                      value={langData[lang]?.category || ""}
                      onChange={(e) =>
                        handleTextChange(lang, "category", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-black uppercase opacity-60 italic">
                      Mavjud tillar soni/matni
                    </label>
                    <input
                      value={langData[lang]?.availableLanguagesCount || ""}
                      onChange={(e) =>
                        handleTextChange(
                          lang,
                          "availableLanguagesCount",
                          e.target.value,
                        )
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-black uppercase opacity-60 italic">
                      Asosiy Tavsif
                    </label>
                    <textarea
                      value={langData[lang]?.Maindescription || ""}
                      onChange={(e) =>
                        handleTextChange(
                          lang,
                          "Maindescription",
                          e.target.value,
                        )
                      }
                      rows={3}
                      className={cn(inputClass, "resize-none")}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-black uppercase opacity-60 italic">
                      To&apos;liq Tavsif
                    </label>
                    <textarea
                      value={langData[lang]?.description || ""}
                      onChange={(e) =>
                        handleTextChange(lang, "description", e.target.value)
                      }
                      rows={4}
                      className={cn(inputClass, "resize-none")}
                    />
                  </div>
                </div>
              </div>

              {/* Media */}
              <div className={blockClass}>
                <h3 className="text-sm font-black uppercase italic text-blue-500 border-b border-white/10 pb-2 tracking-wider">
                  Media yuklamalar ({lang.toUpperCase()})
                </h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase opacity-60 italic block">
                      Ikonka
                    </label>
                    <div className="relative aspect-square w-28 h-28 rounded-2xl border-2 border-dashed border-white/10 bg-slate-900 flex flex-col items-center justify-center overflow-hidden cursor-pointer">
                      {langData[lang]?.iconPreview ? (
                        <img
                          src={langData[lang].iconPreview as string}
                          alt="Icon"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <>
                          <IoImageOutline size={24} className="opacity-40" />
                          <span className="text-[9px] font-black opacity-50 mt-1 uppercase">
                            Tanlash
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleIconChange(e, lang)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-white/5">
                    <label className="text-[11px] font-black uppercase opacity-60 italic block">
                      Geympley Rasmlari
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      <div className="relative aspect-[16/10] rounded-xl border-2 border-dashed border-white/10 bg-slate-900 flex flex-col items-center justify-center overflow-hidden cursor-pointer min-h-[90px]">
                        <IoAddCircleOutline size={24} className="opacity-40" />
                        <span className="text-[9px] font-black opacity-50 uppercase mt-0.5">
                          Qo&apos;shish
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleScreenshotsChange(e, lang)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      {langData[lang]?.screenshotPreviews?.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-[16/10] rounded-xl overflow-hidden group border border-white/10 shadow-sm"
                        >
                          <img
                            src={url}
                            alt={`Screenshot ${idx}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeScreenshot(lang, idx)}
                            className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-500"
                          >
                            <IoTrashOutline size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Technical Details */}
          <div className={blockClass}>
            <h3 className="text-sm font-black uppercase italic text-blue-500 border-b border-white/10 pb-2 tracking-wider">
              Texnik Ma&apos;lumotlar (techData)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase opacity-60 italic">
                  Ishlab Chiquvchi
                </label>
                <input
                  value={techData.developer || ""}
                  onChange={(e) =>
                    handleTechChange("developer", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase opacity-60 italic">
                  Versiya
                </label>
                <input
                  value={techData.version || ""}
                  onChange={(e) => handleTechChange("version", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase opacity-60 italic">
                  Chiqarilgan Sana
                </label>
                <input
                  value={techData.releaseDate || ""}
                  onChange={(e) =>
                    handleTechChange("releaseDate", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase opacity-60 italic">
                  Yuklash Hajmi
                </label>
                <input
                  value={techData.downloadSize || ""}
                  onChange={(e) =>
                    handleTechChange("downloadSize", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase opacity-60 italic">
                  O&apos;yin ichidagi xotira
                </label>
                <input
                  value={techData.inGameSize || ""}
                  onChange={(e) =>
                    handleTechChange("inGameSize", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* System Requirements & R2 File Select */}
          <div className={blockClass}>
            <h3 className="text-sm font-black uppercase italic text-blue-500 border-b border-white/10 pb-2 tracking-wider">
              Platforma & Tizim Talablari
            </h3>
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase opacity-60 italic block">
                Qurilma Turi
              </label>
              <div className="flex flex-wrap gap-3">
                {(["mobile", "pc", "both"] as PlatformType[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={cn(
                      "px-5 py-2.5 rounded-xl font-black uppercase italic text-xs tracking-wider transition-all",
                      platform === p
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white/5 text-slate-400",
                    )}
                  >
                    {p === "both" ? "PC & Mobile" : p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-[11px] font-black uppercase opacity-60 italic block">
                Operatsion Tizim
              </label>
              <div className="flex flex-wrap gap-3">
                {(platform === "pc" || platform === "both") && (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleOS("windows")}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase border transition-all",
                        selectedOS["windows"]
                          ? "border-blue-500 bg-blue-500/10 text-blue-500"
                          : "border-white/10 opacity-60",
                      )}
                    >
                      <IoLogoWindows size={14} /> Windows
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleOS("macos")}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase border transition-all",
                        selectedOS["macos"]
                          ? "border-blue-500 bg-blue-500/10 text-blue-500"
                          : "border-white/10 opacity-60",
                      )}
                    >
                      <IoLogoApple size={14} /> macOS
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleOS("linux")}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase border transition-all",
                        selectedOS["linux"]
                          ? "border-blue-500 bg-blue-500/10 text-blue-500"
                          : "border-white/10 opacity-60",
                      )}
                    >
                      <IoTerminal size={14} /> Linux
                    </button>
                  </>
                )}
                {(platform === "mobile" || platform === "both") && (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleOS("android")}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase border transition-all",
                        selectedOS["android"]
                          ? "border-blue-500 bg-blue-500/10 text-blue-500"
                          : "border-white/10 opacity-60",
                      )}
                    >
                      <IoLogoAndroid size={14} /> Android
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleOS("ios")}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase border transition-all",
                        selectedOS["ios"]
                          ? "border-blue-500 bg-blue-500/10 text-blue-500"
                          : "border-white/10 opacity-60",
                      )}
                    >
                      <IoLogoApple size={14} /> iOS
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-white/5">
              {Object.keys(selectedOS).map(
                (os) =>
                  selectedOS[os] && (
                    <div
                      key={os}
                      className="p-4 sm:p-5 rounded-xl bg-slate-500/5 border border-white/5 space-y-4"
                    >
                      <span className="text-xs font-black uppercase italic text-blue-400 block border-b border-white/5 pb-1.5">
                        {os} talablari
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {["os", "cpu", "gpu", "ram"].map((field) => (
                          <div key={field} className="space-y-1">
                            <label className="text-[10px] font-black uppercase opacity-60 italic">
                              {field}
                            </label>
                            <input
                              value={
                                osDetails[os]?.requirements?.[
                                  field as keyof IOSRequirement
                                ] || ""
                              }
                              onChange={(e) =>
                                handleOSRequirementFieldChange(
                                  os,
                                  field as keyof IOSRequirement,
                                  e.target.value,
                                )
                              }
                              className={inputClass}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-dashed border-white/5">
                        <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs uppercase italic cursor-pointer transition-colors shadow-sm w-full sm:w-fit">
                          <IoFolderOpenOutline size={14} /> Fayl tanlash
                          <input
                            type="file"
                            onChange={(e) => handleFolderFileChange(os, e)}
                            className="hidden"
                          />
                        </label>
                        <span className="text-xs font-bold font-mono opacity-80 truncate max-w-xs">
                          {pendingOSFiles[os] ? (
                            <span className="text-emerald-400">
                              Yangi fayl tanlandi: {pendingOSFiles[os].name}
                            </span>
                          ) : (
                            osDetails[os]?.fileName || "Fayl biriktirilmagan"
                          )}
                        </span>
                      </div>
                    </div>
                  ),
              )}
            </div>
          </div>

          {/* Monetizatsiya */}
          <div className={blockClass}>
            <h3 className="text-sm font-black uppercase italic text-blue-500 border-b border-white/10 pb-2 tracking-wider">
              Monetizatsiya
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div className="space-y-2 flex-1">
                <label className="text-[11px] font-black uppercase opacity-60 italic block">
                  O&apos;yin turi
                </label>
                <div className="flex bg-slate-900 p-1 rounded-xl w-full sm:w-fit">
                  <button
                    type="button"
                    onClick={() => setPriceType("free")}
                    className={cn(
                      "flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs font-black uppercase italic transition-all",
                      priceType === "free"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "opacity-60",
                    )}
                  >
                    Free
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceType("paid")}
                    className={cn(
                      "flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs font-black uppercase italic transition-all",
                      priceType === "paid"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "opacity-60",
                    )}
                  >
                    Paid
                  </button>
                </div>
              </div>
              {priceType === "paid" && (
                <div className="space-y-1.5 flex-1 w-full">
                  <label className="text-[11px] font-black uppercase opacity-60 italic">
                    Narxi ($)
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          </div>

          {/* YANGILIKLAR ROYXATI */}
          <div className={blockClass}>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="text-sm font-black uppercase italic text-blue-500 tracking-wider">
                Yangiliklar Ro&apos;yxati ({activeLang.toUpperCase()})
              </h3>
              <button
                type="button"
                onClick={() => handleAddWhatsNew(activeLang)}
                className="text-blue-500 hover:text-blue-400 flex items-center gap-1 text-xs font-black uppercase italic"
              >
                <IoAddCircleOutline size={16} /> Qo&apos;shish
              </button>
            </div>
            <div className="space-y-3">
              {(langData[activeLang]?.whatsNew || [""]).map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    value={item}
                    onChange={(e) =>
                      handleWhatsNewChange(activeLang, index, e.target.value)
                    }
                    placeholder="Masalan: Versiya 1.2 xatolar tuzatildi..."
                    className={inputClass}
                  />
                  {(langData[activeLang]?.whatsNew || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveWhatsNew(activeLang, index)}
                      className="p-3.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                    >
                      <IoTrashOutline size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* PASTKI SAQLASH TUGMASI */}
          {/* <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-black uppercase italic tracking-wider transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg"
          >
            <IoCloudUploadOutline size={20} />
            {isSubmitting ? "Saqlanmoqda..." : "Ozgarishlarni Saqlash"}
          </button> */}
        </form>
      </div>
    </main>
  );
}
