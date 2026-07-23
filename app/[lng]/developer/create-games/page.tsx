/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ui/theme-provider";
import {
  IoCloudUploadOutline,
  IoAddCircleOutline,
  IoTrashOutline,
  IoImageOutline,
  IoLogoWindows,
  IoLogoApple,
  IoLogoAndroid,
  IoTerminal,
  IoFolderOpenOutline,
  IoLanguageOutline,
} from "react-icons/io5";

type PlatformType = "mobile" | "pc" | "both";
type LanguageType = "uz" | "ru" | "en" | "tr";
type VisibilityType = "public" | "private";
type PriceType = "free" | "paid";

interface LangSpecificData {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  developer: string;
  version: string;
  downloadSize: string;
  inGameSize: string;
  releaseDate: string;
  availableLanguagesCount: string;
  iconPreview: string | null;
  screenshotPreviews: string[];
}

interface OSRequirements {
  os: string;
  cpu: string;
  gpu: string;
  ram: string;
}

interface OSData {
  requirements: OSRequirements;
  buildFile: File | null;
  fileName: string;
}

interface GameFormData {
  languages: Record<LanguageType, LangSpecificData>;
  platform: PlatformType;
  selectedOS: Record<string, boolean>;
  osDetails: Record<string, OSData>;
  visibility: VisibilityType;
  priceType: PriceType;
  price?: string;
  whatsNew: string[];
}

export default function CreateGamePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeLang, setActiveLang] = useState<LanguageType>("uz");

  const [langData, setLangData] = useState<
    Record<LanguageType, LangSpecificData>
  >({
    uz: {
      title: "",
      subtitle: "",
      description: "",
      category: "",
      developer: "",
      version: "",
      downloadSize: "",
      inGameSize: "",
      releaseDate: "",
      availableLanguagesCount: "",
      iconPreview: null,
      screenshotPreviews: [],
    },
    ru: {
      title: "",
      subtitle: "",
      description: "",
      category: "",
      developer: "",
      version: "",
      downloadSize: "",
      inGameSize: "",
      releaseDate: "",
      availableLanguagesCount: "",
      iconPreview: null,
      screenshotPreviews: [],
    },
    en: {
      title: "",
      subtitle: "",
      description: "",
      category: "",
      developer: "",
      version: "",
      downloadSize: "",
      inGameSize: "",
      releaseDate: "",
      availableLanguagesCount: "",
      iconPreview: null,
      screenshotPreviews: [],
    },
    tr: {
      title: "",
      subtitle: "",
      description: "",
      category: "",
      developer: "",
      version: "",
      downloadSize: "",
      inGameSize: "",
      releaseDate: "",
      availableLanguagesCount: "",
      iconPreview: null,
      screenshotPreviews: [],
    },
  });

  const [platform, setPlatform] = useState<PlatformType>("pc");
  const [selectedOS, setSelectedOS] = useState<Record<string, boolean>>({
    windows: true,
  });

  const [osDetails, setOsDetails] = useState<Record<string, OSData>>({
    windows: {
      requirements: { os: "Windows 10/11 64-bit", cpu: "", gpu: "", ram: "" },
      buildFile: null,
      fileName: "",
    },
    macos: {
      requirements: { os: "macOS 13+", cpu: "", gpu: "", ram: "" },
      buildFile: null,
      fileName: "",
    },
    linux: {
      requirements: { os: "Ubuntu 22.04 LTS", cpu: "", gpu: "", ram: "" },
      buildFile: null,
      fileName: "",
    },
    android: {
      requirements: { os: "Android 10+", cpu: "", gpu: "", ram: "" },
      buildFile: null,
      fileName: "",
    },
    ios: {
      requirements: { os: "iOS 16+", cpu: "", gpu: "", ram: "" },
      buildFile: null,
      fileName: "",
    },
  });

  const [visibility, setVisibility] = useState<VisibilityType>("public");
  const [priceType, setPriceType] = useState<PriceType>("free");
  const [price, setPrice] = useState<string>("");
  const [whatsNew, setWhatsNew] = useState<string[]>([""]);

  const handleIconChange = (
    e: ChangeEvent<HTMLInputElement>,
    lang: LanguageType,
  ): void => {
    const file = e.target.files?.[0];
    if (file) {
      setLangData((prev) => ({
        ...prev,
        [lang]: { ...prev[lang], iconPreview: URL.createObjectURL(file) },
      }));
    }
  };

  const handleScreenshotsChange = (
    e: ChangeEvent<HTMLInputElement>,
    lang: LanguageType,
  ): void => {
    const files = e.target.files;
    if (files) {
      const urls = Array.from(files).map((file) => URL.createObjectURL(file));
      setLangData((prev) => ({
        ...prev,
        [lang]: {
          ...prev[lang],
          screenshotPreviews: [...prev[lang].screenshotPreviews, ...urls],
        },
      }));
    }
  };

  const removeScreenshot = (lang: LanguageType, index: number): void => {
    setLangData((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        screenshotPreviews: prev[lang].screenshotPreviews.filter(
          (_, i) => i !== index,
        ),
      },
    }));
  };

  const handleTextChange = (
    lang: LanguageType,
    field: keyof LangSpecificData,
    value: string,
  ) => {
    setLangData((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }));
  };

  const toggleOS = (os: string) => {
    setSelectedOS((prev) => ({ ...prev, [os]: !prev[os] }));
  };

  const handleFolderFileChange = (
    os: string,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setOsDetails((prev) => ({
        ...prev,
        [os]: { ...prev[os], buildFile: file, fileName: file.name },
      }));
    }
  };

  const handleOSRequirementFieldChange = (
    os: string,
    field: keyof OSRequirements,
    value: string,
  ) => {
    setOsDetails((prev) => ({
      ...prev,
      [os]: {
        ...prev[os],
        requirements: { ...prev[os].requirements, [field]: value },
      },
    }));
  };

  const handleAddWhatsNew = (): void => setWhatsNew([...whatsNew, ""]);
  const handleRemoveWhatsNew = (index: number): void =>
    setWhatsNew(whatsNew.filter((_, i) => i !== index));
  const handleWhatsNewChange = (index: number, value: string): void => {
    const updated = [...whatsNew];
    updated[index] = value;
    setWhatsNew(updated);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const gameData: GameFormData = {
      languages: langData,
      platform,
      selectedOS,
      osDetails,
      visibility,
      priceType,
      price: priceType === "paid" ? price : undefined,
      whatsNew: whatsNew.filter((item) => item.trim() !== ""),
    };
    console.log("Saqlandi:", gameData);
    alert("Oʻyin maʼlumotlari muvaffaqiyatli saqlandi!");
  };

  const inputClass = cn(
    "w-full px-4 py-3 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200",
    isDark
      ? "bg-slate-900 border-white/10 text-white placeholder-slate-500"
      : "bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400",
  );

  const blockClass = cn(
    "p-5 sm:p-6 lg:p-8 rounded-2xl border space-y-6 transition-all duration-300",
    isDark
      ? "bg-slate-900/40 border-white/5 backdrop-blur-md"
      : "bg-white border-slate-200 shadow-sm",
  );

  return (
    <div className="w-full ml-5 max-w-5xl my-16 mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Sarlavha qismi (Orqaga qaytishsiz, toza va animatsiyali) */}
      <div className="mb-6 flex justify-between items-center animate-in duration-500 fill-mode-forwards delay-75">
        <div>
          <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            Yangi Oʻyin Qoʻshish
          </h1>
          <p className="text-ms mt-1 text-slate-400 font-medium">
            MyGames loyihalar boshqaruvi
          </p>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-98 transition-all duration-200"
        >
          Oʻyinni Nashr Qilish
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. TILLAR PANELI */}
        <section className={blockClass}>
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-black flex items-center gap-2">
              <IoLanguageOutline className="text-blue-500" size={20} /> Oʻyin
              Maʼlumotlari (Koʻp tillilik)
            </h2>
            <p className="text-xs text-slate-400">
              Har bir tildagi maʼlumotlarni alohida kiriting.
            </p>
          </div>

          {/* Til Tablari */}
          <div
            className={cn(
              "p-1 rounded-xl flex gap-1",
              isDark ? "bg-white/5" : "bg-slate-200/60",
            )}
          >
            {(["uz", "ru", "en", "tr"] as LanguageType[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLang(lang)}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-lg transition-all uppercase tracking-wider",
                  activeLang === lang
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200",
                )}
              >
                {lang === "uz"
                  ? "O'zbek"
                  : lang === "ru"
                    ? "Русский"
                    : lang === "en"
                      ? "English"
                      : "Türkçe"}
              </button>
            ))}
          </div>

          {/* Aktiv til formasi inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">
                Oʻyin nomi ({activeLang.toUpperCase()})
              </label>
              <input
                type="text"
                value={langData[activeLang].title}
                onChange={(e) =>
                  handleTextChange(activeLang, "title", e.target.value)
                }
                placeholder="Masalan: Shadow Fight"
                className={inputClass}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">
                Qisqa tarif
              </label>
              <input
                type="text"
                value={langData[activeLang].subtitle}
                onChange={(e) =>
                  handleTextChange(activeLang, "subtitle", e.target.value)
                }
                placeholder="Eng zo'r jangovar o'yin"
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-400">
                Toʻliq tavsif
              </label>
              <textarea
                value={langData[activeLang].description}
                onChange={(e) =>
                  handleTextChange(activeLang, "description", e.target.value)
                }
                placeholder="O'yin haqida batafsil ma'lumot..."
                rows={4}
                className={cn(inputClass, "resize-none font-medium")}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">
                Kategoriya
              </label>
              <input
                type="text"
                value={langData[activeLang].category}
                onChange={(e) =>
                  handleTextChange(activeLang, "category", e.target.value)
                }
                placeholder="Action, RPG..."
                className={inputClass}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">
                Ishlab chiquvchi
              </label>
              <input
                type="text"
                value={langData[activeLang].developer}
                onChange={(e) =>
                  handleTextChange(activeLang, "developer", e.target.value)
                }
                placeholder="Nekki Studio"
                className={inputClass}
              />
            </div>
          </div>

          {/* Media (Logo & Screenshots) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">
                Oʻyin Logotipi (1:1)
              </label>
              <div className="relative group aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden hover:border-blue-500/50 transition-all cursor-pointer bg-black/10">
                {langData[activeLang].iconPreview ? (
                  <>
                    <img
                      src={langData[activeLang].iconPreview!}
                      alt="Icon"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <IoCloudUploadOutline size={24} className="text-white" />
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <IoImageOutline
                      size={28}
                      className="mx-auto text-slate-500 mb-1"
                    />
                    <span className="text-xs font-medium text-slate-400">
                      Logotip yuklash
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleIconChange(e, activeLang)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-400">
                Screenshotlar
              </label>
              <div className="grid grid-cols-3 gap-2">
                {langData[activeLang].screenshotPreviews.map((src, index) => (
                  <div
                    key={index}
                    className="relative aspect-video rounded-xl overflow-hidden group border border-white/5"
                  >
                    <img
                      src={src}
                      alt="screen"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeScreenshot(activeLang, index)}
                      className="absolute top-1 right-1 p-1 bg-red-600 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <IoTrashOutline size={14} />
                    </button>
                  </div>
                ))}
                <div className="relative aspect-video rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center hover:border-blue-500/50 transition-all cursor-pointer bg-black/10">
                  <IoAddCircleOutline size={22} className="text-slate-500" />
                  <span className="text-[10px] font-bold text-slate-400 mt-1">
                    Rasm qoʻshish
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleScreenshotsChange(e, activeLang)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. PLATFORMA VA BUILD */}
        <section className={blockClass}>
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-black flex items-center gap-2">
              <IoLogoWindows className="text-blue-500" size={20} /> Platforma va
              Build Paketlari
            </h2>
            <p className="text-xs text-slate-400">
              Oʻyin ishlaydigan platformalarni belgilang.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(["pc", "mobile", "both"] as PlatformType[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={cn(
                  "p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 capitalize transition-all",
                  platform === p
                    ? "border-blue-500 bg-blue-500/10 text-blue-500 shadow-md"
                    : "border-white/5 bg-white/5 text-slate-400 hover:text-slate-200",
                )}
              >
                {p === "pc" ? (
                  <IoLogoWindows size={18} />
                ) : p === "mobile" ? (
                  <IoLogoAndroid size={18} />
                ) : (
                  <IoTerminal size={18} />
                )}
                {p === "both" ? "Universal" : p}
              </button>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="text-xs font-bold text-slate-400">
              Operatsion Tizimlar
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(osDetails).map((os) => {
                if (platform === "pc" && ["android", "ios"].includes(os))
                  return null;
                if (
                  platform === "mobile" &&
                  ["windows", "macos", "linux"].includes(os)
                )
                  return null;

                return (
                  <button
                    key={os}
                    type="button"
                    onClick={() => toggleOS(os)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 capitalize transition-all",
                      selectedOS[os]
                        ? "bg-slate-200 text-slate-900 border-transparent"
                        : "bg-white/5 border-white/5 text-slate-400",
                    )}
                  >
                    {os === "windows" && <IoLogoWindows />}
                    {os === "macos" && <IoLogoApple />}
                    {os === "android" && <IoLogoAndroid />}
                    {os}
                  </button>
                );
              })}
            </div>
          </div>

          {Object.keys(osDetails).map((os) => {
            if (!selectedOS[os]) return null;
            if (platform === "pc" && ["android", "ios"].includes(os))
              return null;
            if (
              platform === "mobile" &&
              ["windows", "macos", "linux"].includes(os)
            )
              return null;

            return (
              <div
                key={os}
                className="p-4 rounded-xl bg-black/10 border border-white/5 space-y-3"
              >
                <h3 className="text-xs font-black capitalize flex items-center gap-2 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />{" "}
                  {os} Build sozlamalari
                </h3>

                <div className="relative border border-dashed border-white/10 rounded-xl p-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <IoFolderOpenOutline size={20} className="text-blue-400" />
                    <div>
                      <p className="text-xs font-bold">
                        {osDetails[os].fileName ||
                          "Faylni yuklang (.zip, .apk, .exe)"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1 bg-white/5 text-xs font-bold rounded-lg border border-white/10"
                  >
                    Fayl tanlash
                  </button>
                  <input
                    type="file"
                    onChange={(e) => handleFolderFileChange(os, e)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["os", "cpu", "gpu", "ram"].map((field) => (
                    <div key={field} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">
                        {field}
                      </label>
                      <input
                        type="text"
                        value={
                          osDetails[os].requirements[
                            field as keyof OSRequirements
                          ]
                        }
                        onChange={(e) =>
                          handleOSRequirementFieldChange(
                            os,
                            field as keyof OSRequirements,
                            e.target.value,
                          )
                        }
                        placeholder={`Minimal ${field}`}
                        className={cn(inputClass, "py-2 px-3 text-xs")}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* 3. VISIBILITY VA NARX */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={blockClass}>
            <h3 className="text-xs font-black text-slate-200">
              Narx va Monetizatsiya
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {(["free", "paid"] as PriceType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPriceType(type)}
                  className={cn(
                    "py-2.5 rounded-xl border text-xs font-bold capitalize transition-all",
                    priceType === type
                      ? "border-blue-500 bg-blue-500/10 text-blue-500"
                      : "border-white/5 bg-white/5 text-slate-400",
                  )}
                >
                  {type === "free" ? "Bepul" : "Pullik"}
                </button>
              ))}
            </div>

            {priceType === "paid" && (
              <div className="space-y-1 pt-1">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Narxni kiriting (UZS)"
                  className={inputClass}
                />
              </div>
            )}
          </div>

          <div className={blockClass}>
            <h3 className="text-xs font-black text-slate-200">
              Koʻrinuvchanlik
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {(["public", "private"] as VisibilityType[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={cn(
                    "py-2.5 rounded-xl border text-xs font-bold capitalize transition-all",
                    visibility === v
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                      : "border-white/5 bg-white/5 text-slate-400",
                  )}
                >
                  {v === "public" ? "Ochiq (Public)" : "Yashirin (Private)"}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 4. YANGILIKLAR */}
        <section className={blockClass}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-200">
                Changelog (Oʻzgarishlar)
              </h3>
            </div>
            <button
              type="button"
              onClick={handleAddWhatsNew}
              className="p-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
            >
              <IoAddCircleOutline size={14} /> Qoʻshish
            </button>
          </div>

          <div className="space-y-2">
            {whatsNew.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleWhatsNewChange(index, e.target.value)}
                  placeholder="Yangi nima qo'shildi..."
                  className={cn(inputClass, "py-2")}
                />
                {whatsNew.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveWhatsNew(index)}
                    className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all"
                  >
                    <IoTrashOutline size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 5. NASHR QILISH TUGMASI (Eng pastda) */}
      </form>
    </div>
  );
}
