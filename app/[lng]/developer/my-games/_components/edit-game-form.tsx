"use client";

import React, { useState, ChangeEvent } from "react";
import { cn } from "@/lib/utils";
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
} from "react-icons/io5";

// CRITICAL: index.ts faylingiz qayerda joylashgan bolsa, yolini togri korsating.
// Masalan, agar u src/constants/index.ts da bolsa: "@/constants" deb yozing.
import {
  MOCK_GAMES,
  type LanguageType,
  type PlatformType,
  type OSRequirement,
  type OSDetail,
  type LangSpecificData,
} from "@/constants";

interface EditGameFormProps {
  gameSlug: string;
}

export default function EditGameForm({ gameSlug }: EditGameFormProps) {
  const isDark = true;

  // Malumot xavfsiz yuklanishi uchun zaxira (fallback) obekt bilan taminlaymiz
  const gameTarget = MOCK_GAMES?.find((game) => game.slug === gameSlug) || {
    id: "",
    slug: "",
    visibility: "private" as const,
    platform: "pc" as const,
    selectedOS: {},
    osDetails: {},
    priceType: "free" as const,
    price: "",
    whatsNew: [""],
    langData: {} as Record<LanguageType, LangSpecificData>,
  };

  // --- STATELAR ---
  const [activeLang, setActiveLang] = useState<LanguageType>("uz");
  const [visibility, setVisibility] = useState<"public" | "private">(
    gameTarget.visibility,
  );
  const [slug, setSlug] = useState<string>(gameTarget.slug);
  const [platform, setPlatform] = useState<PlatformType>(gameTarget.platform);
  const [selectedOS, setSelectedOS] = useState<Record<string, boolean>>(
    gameTarget.selectedOS || {},
  );
  const [osDetails, setOsDetails] = useState<Record<string, OSDetail>>(
    gameTarget.osDetails || {},
  );
  const [priceType, setPriceType] = useState<"free" | "paid">(
    gameTarget.priceType,
  );
  const [price, setPrice] = useState<string>(gameTarget.price);
  const [whatsNew, setWhatsNew] = useState<string[]>(
    gameTarget.whatsNew || [""],
  );
  const [langData, setLangData] = useState<
    Record<LanguageType, LangSpecificData>
  >(gameTarget.langData);

  // --- HANDLERS ---
  const handleTextChange = (
    lang: LanguageType,
    field: keyof LangSpecificData,
    value: string,
  ) => {
    setLangData((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [field]: value,
      },
    }));

    if (lang === "uz" && field === "title") {
      const generated = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generated);
    }
  };

  const toggleOS = (os: string) => {
    setSelectedOS((prev) => ({ ...prev, [os]: !prev[os] }));
  };

  const handleOSRequirementFieldChange = (
    os: string,
    field: keyof OSRequirement,
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
          requirements: {
            ...currentOS.requirements,
            [field]: value,
          },
        },
      };
    });
  };

  const handleFolderFileChange = (
    os: string,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setOsDetails((prev) => {
        const currentOS = prev[os] || {
          requirements: { os: "", cpu: "", gpu: "", ram: "" },
          fileName: "",
        };
        return {
          ...prev,
          [os]: {
            ...currentOS,
            fileName,
          },
        };
      });
    }
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

  const handleAddWhatsNew = () => setWhatsNew((prev) => [...prev, ""]);
  const handleWhatsNewChange = (index: number, value: string) => {
    const updated = [...whatsNew];
    updated[index] = value;
    setWhatsNew(updated);
  };
  const handleRemoveWhatsNew = (index: number) =>
    setWhatsNew((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Payload:", {
      id: gameTarget.id,
      slug,
      visibility,
      platform,
      selectedOS,
      osDetails,
      priceType,
      price,
      whatsNew,
      langData,
    });
  };

  const blockClass =
    "p-5 sm:p-6 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md space-y-5";
  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-white/10 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500 transition-all";

  return (
    <main
      className={cn(
        "relative min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-300",
      )}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-dashed border-white/10">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter italic text-white">
              OYINNI <span className="text-blue-500">TAHRIRLASH</span>
            </h1>
            <p className="text-xs sm:text-sm opacity-60 italic">
              ID: {gameTarget.id || "Nomalum"} — Oyin malumotlari muvaffaqiyatli
              boglandi.
            </p>
          </div>

          <div className="flex bg-slate-900 p-1 rounded-xl w-full sm:w-fit">
            <button
              type="button"
              onClick={() => setVisibility("public")}
              className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black uppercase italic transition-all",
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
                "flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black uppercase italic transition-all",
                visibility === "private"
                  ? "bg-red-600 text-white shadow-md"
                  : "opacity-60",
              )}
            >
              <IoEyeOffOutline size={16} /> Private
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
              {/* Inputs Group */}
              <div className={blockClass}>
                <h3 className="text-sm font-black uppercase italic text-blue-500 border-b border-white/10 pb-2 tracking-wider">
                  Matnlar va Tavsif ({lang.toUpperCase()})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase opacity-60 italic">
                      Oyin nomi
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
                      rows={4}
                      className={cn(inputClass, "resize-none")}
                      required={activeLang === lang}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-black uppercase opacity-60 italic">
                      Toliq Tavsif
                    </label>
                    <textarea
                      value={langData[lang]?.description || ""}
                      onChange={(e) =>
                        handleTextChange(lang, "description", e.target.value)
                      }
                      rows={4}
                      className={cn(inputClass, "resize-none")}
                      required={activeLang === lang}
                    />
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className={blockClass}>
                <h3 className="text-sm font-black uppercase italic text-blue-500 border-b border-white/10 pb-2 tracking-wider">
                  Texnik Malumotlar ({lang.toUpperCase()})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase opacity-60 italic">
                      Kategoriya
                    </label>
                    <input
                      required={activeLang === lang}
                      value={langData[lang]?.category || ""}
                      onChange={(e) =>
                        handleTextChange(lang, "category", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase opacity-60 italic">
                      Ishlab chiquvchi
                    </label>
                    <input
                      required={activeLang === lang}
                      value={langData[lang]?.developer || ""}
                      onChange={(e) =>
                        handleTextChange(lang, "developer", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase opacity-60 italic">
                      Versiya
                    </label>
                    <input
                      required={activeLang === lang}
                      value={langData[lang]?.version || ""}
                      onChange={(e) =>
                        handleTextChange(lang, "version", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase opacity-60 italic">
                      Yuklash hajmi
                    </label>
                    <input
                      required={activeLang === lang}
                      value={langData[lang]?.downloadSize || ""}
                      onChange={(e) =>
                        handleTextChange(lang, "downloadSize", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase opacity-60 italic">
                      Oyin ichidagi xotira
                    </label>
                    <input
                      required={activeLang === lang}
                      value={langData[lang]?.inGameSize || ""}
                      onChange={(e) =>
                        handleTextChange(lang, "inGameSize", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase opacity-60 italic">
                      Chiqarilgan sana
                    </label>
                    <input
                      required={activeLang === lang}
                      value={langData[lang]?.releaseDate || ""}
                      onChange={(e) =>
                        handleTextChange(lang, "releaseDate", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                    <label className="text-[11px] font-black uppercase opacity-60 italic">
                      Mavjud tillar matni
                    </label>
                    <input
                      required={activeLang === lang}
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
                </div>
              </div>

              {/* Media Section */}
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
                          Qoshish
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

          {/* System Requirements (OS) */}
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
                              required
                              value={
                                osDetails[os]?.requirements?.[
                                  field as keyof OSRequirement
                                ] || ""
                              }
                              onChange={(e) =>
                                handleOSRequirementFieldChange(
                                  os,
                                  field as keyof OSRequirement,
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
                          <IoFolderOpenOutline size={14} /> Buildni yangilash
                          <input
                            type="file"
                            onChange={(e) => handleFolderFileChange(os, e)}
                            className="hidden"
                          />
                        </label>
                        <span className="text-xs font-bold opacity-60 truncate max-w-xs">
                          {osDetails[os]?.fileName || "Eski fayl saqlangan."}
                        </span>
                      </div>
                    </div>
                  ),
              )}
            </div>
          </div>

          {/* Monetization */}
          <div className={blockClass}>
            <h3 className="text-sm font-black uppercase italic text-blue-500 border-b border-white/10 pb-2 tracking-wider">
              Monetizatsiya
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div className="space-y-2 flex-1">
                <label className="text-[11px] font-black uppercase opacity-60 italic block">
                  Oyin turi
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
                    Narxi
                  </label>
                  <input
                    required
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Changelog */}
          <div className={blockClass}>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="text-sm font-black uppercase italic text-blue-500 tracking-wider">
                Yangiliklar Royxati
              </h3>
              <button
                type="button"
                onClick={handleAddWhatsNew}
                className="text-blue-500 hover:text-blue-400 flex items-center gap-1 text-xs font-black uppercase italic"
              >
                <IoAddCircleOutline size={16} /> Qoshish
              </button>
            </div>
            <div className="space-y-3">
              {whatsNew.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    value={item}
                    required
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleWhatsNewChange(index, e.target.value)
                    }
                    className={inputClass}
                  />
                  {whatsNew.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeScreenshot(activeLang, index)}
                      className="p-3.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    >
                      <IoTrashOutline size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase italic tracking-wider transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg"
          >
            <IoCloudUploadOutline size={20} /> Ozgarishlarni Saqlash
          </button>
        </form>
      </div>
    </main>
  );
}
