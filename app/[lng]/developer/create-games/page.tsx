/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ui/theme-provider";
import { handleGameUpload } from "@/lib/upload";
import { uploadImageToFirebase } from "@/lib/uploadImage";

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
  IoHardwareChipOutline,
  IoLinkOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoArrowForwardOutline,
  IoCardOutline,
  IoRefreshOutline,
} from "react-icons/io5";

type PlatformType = "mobile" | "pc" | "both";
type LanguageType = "uz" | "ru" | "en" | "tr";
type VisibilityType = "public" | "private";
type PriceType = "free" | "paid";

interface CardData {
  _id: string;
  cardLast4: string;
  cardholderName: string;
  country: string;
  currency: string;
  verified: boolean;
}

interface LangSpecificData {
  title: string;
  subtitle: string;
  Maindescription: string;
  description: string;
  category: string;
  availableLanguagesCount: string;
  iconFile: File | null;
  iconPreview: string | null;
  screenshotFiles: File[];
  screenshotPreviews: string[];
  whatsNew: string[];
}

interface TechnicalDetails {
  version: string;
  downloadSize: string;
  inGameSize: string;
  developer: string;
  releaseDate: string;
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

export default function CreateGamePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [slug, setSlug] = useState("");
  const [activeLang, setActiveLang] = useState<LanguageType>("uz");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // =========================
  // PAYOUT CARDS
  // =========================
  const [cards, setCards] = useState<CardData[]>([]);
  const [selectedCardId, setSelectedCardId] = useState("");
  const [cardsLoading, setCardsLoading] = useState(false);

  const loadCards = async () => {
    try {
      setCardsLoading(true);

      const res = await fetch("/api/cards", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Kartalarni yuklab bolmadi");
      }

      const data = await res.json();

      const loadedCards: CardData[] = data.data || [];

      setCards(loadedCards);

      // Birinchi verified kartani avtomatik tanlash
      if (!selectedCardId) {
        const verifiedCard = loadedCards.find((card) => card.verified);

        if (verifiedCard) {
          setSelectedCardId(verifiedCard._id);
        }
      }
    } catch (error) {
      console.error("Cards load error:", error);
    } finally {
      setCardsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // TECH DATA
  // =========================
  const [techData, setTechData] = useState<TechnicalDetails>({
    version: "",
    downloadSize: "",
    inGameSize: "",
    developer: "",
    releaseDate: "",
  });

  // =========================
  // LANG DATA
  // =========================
  const [langData, setLangData] = useState<
    Record<LanguageType, LangSpecificData>
  >({
    uz: {
      title: "",
      subtitle: "",
      Maindescription: "",
      description: "",
      category: "",
      availableLanguagesCount: "",
      iconFile: null,
      iconPreview: null,
      screenshotFiles: [],
      screenshotPreviews: [],
      whatsNew: [""],
    },
    ru: {
      title: "",
      subtitle: "",
      Maindescription: "",
      description: "",
      category: "",
      availableLanguagesCount: "",
      iconFile: null,
      iconPreview: null,
      screenshotFiles: [],
      screenshotPreviews: [],
      whatsNew: [""],
    },
    en: {
      title: "",
      subtitle: "",
      Maindescription: "",
      description: "",
      category: "",
      availableLanguagesCount: "",
      iconFile: null,
      iconPreview: null,
      screenshotFiles: [],
      screenshotPreviews: [],
      whatsNew: [""],
    },
    tr: {
      title: "",
      subtitle: "",
      Maindescription: "",
      description: "",
      category: "",
      availableLanguagesCount: "",
      iconFile: null,
      iconPreview: null,
      screenshotFiles: [],
      screenshotPreviews: [],
      whatsNew: [""],
    },
  });

  // =========================
  // PLATFORM
  // =========================
  const [platform, setPlatform] = useState<PlatformType>("pc");

  const [selectedOS, setSelectedOS] = useState<Record<string, boolean>>({
    windows: true,
  });

  const [osDetails, setOsDetails] = useState<Record<string, OSData>>({
    windows: {
      requirements: {
        os: "Windows 10/11 64-bit",
        cpu: "",
        gpu: "",
        ram: "",
      },
      buildFile: null,
      fileName: "",
    },
    macos: {
      requirements: {
        os: "macOS 13+",
        cpu: "",
        gpu: "",
        ram: "",
      },
      buildFile: null,
      fileName: "",
    },
    linux: {
      requirements: {
        os: "Ubuntu 22.04 LTS",
        cpu: "",
        gpu: "",
        ram: "",
      },
      buildFile: null,
      fileName: "",
    },
    android: {
      requirements: {
        os: "Android 10+",
        cpu: "",
        gpu: "",
        ram: "",
      },
      buildFile: null,
      fileName: "",
    },
    ios: {
      requirements: {
        os: "iOS 16+",
        cpu: "",
        gpu: "",
        ram: "",
      },
      buildFile: null,
      fileName: "",
    },
  });

  const [visibility, setVisibility] = useState<VisibilityType>("public");

  const [priceType, setPriceType] = useState<PriceType>("free");

  const [price, setPrice] = useState("");

  // =========================
  // TECH CHANGE
  // =========================
  const handleTechDataChange = (
    field: keyof TechnicalDetails,
    value: string,
  ) => {
    setTechData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =========================
  // ICON
  // =========================
  const handleIconChange = (
    e: ChangeEvent<HTMLInputElement>,
    lang: LanguageType,
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setLangData((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        iconFile: file,
        iconPreview: URL.createObjectURL(file),
      },
    }));
  };

  // =========================
  // SCREENSHOTS
  // =========================
  const handleScreenshotsChange = (
    e: ChangeEvent<HTMLInputElement>,
    lang: LanguageType,
  ) => {
    const files = e.target.files;

    if (!files) return;

    const fileList = Array.from(files);

    const urls = fileList.map((file) => URL.createObjectURL(file));

    setLangData((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        screenshotFiles: [...prev[lang].screenshotFiles, ...fileList],
        screenshotPreviews: [...prev[lang].screenshotPreviews, ...urls],
      },
    }));
  };

  const removeScreenshot = (lang: LanguageType, index: number) => {
    setLangData((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        screenshotFiles: prev[lang].screenshotFiles.filter(
          (_, i) => i !== index,
        ),
        screenshotPreviews: prev[lang].screenshotPreviews.filter(
          (_, i) => i !== index,
        ),
      },
    }));
  };

  // =========================
  // TEXT
  // =========================
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
  };

  // =========================
  // OS
  // =========================
  const toggleOS = (os: string) => {
    setSelectedOS((prev) => ({
      ...prev,
      [os]: !prev[os],
    }));
  };

  const handleFolderFileChange = (
    os: string,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setOsDetails((prev) => ({
      ...prev,
      [os]: {
        ...prev[os],
        buildFile: file,
        fileName: file.name,
      },
    }));
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
        requirements: {
          ...prev[os].requirements,
          [field]: value,
        },
      },
    }));
  };

  // =========================
  // WHATS NEW
  // =========================
  const handleAddWhatsNew = (lang: LanguageType) => {
    setLangData((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        whatsNew: [...prev[lang].whatsNew, ""],
      },
    }));
  };

  const handleRemoveWhatsNew = (lang: LanguageType, index: number) => {
    setLangData((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        whatsNew: prev[lang].whatsNew.filter((_, i) => i !== index),
      },
    }));
  };

  const handleWhatsNewChange = (
    lang: LanguageType,
    index: number,
    value: string,
  ) => {
    setLangData((prev) => {
      const updated = [...prev[lang].whatsNew];

      updated[index] = value;

      return {
        ...prev,
        [lang]: {
          ...prev[lang],
          whatsNew: updated,
        },
      };
    });
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Paid game uchun card majburiy
    if (priceType === "paid" && !selectedCardId) {
      alert("Pullik oyin uchun payout kartani tanlang!");
      return;
    }

    setIsSubmitting(true);

    try {
      const finalLanguagesData: Record<string, any> = {};

      // LANGUAGES
      for (const lang of ["uz", "ru", "en", "tr"] as LanguageType[]) {
        const langInfo = langData[lang];

        let iconUrl = "";
        const screenshotUrls: string[] = [];

        if (langInfo.iconFile) {
          setUploadStatus(
            `[${lang.toUpperCase()}] Logotip Firebasega yuklanmoqda...`,
          );

          iconUrl = await uploadImageToFirebase(
            langInfo.iconFile,
            "game-icons",
          );
        }

        for (const file of langInfo.screenshotFiles) {
          setUploadStatus(`[${lang.toUpperCase()}] Screenshot yuklanmoqda...`);

          const url = await uploadImageToFirebase(file, "screenshots");

          screenshotUrls.push(url);
        }

        finalLanguagesData[lang] = {
          title: langInfo.title || "",
          subtitle: langInfo.subtitle || "",
          Maindescription:
            langInfo.Maindescription || langInfo.description || "",
          description: langInfo.description || "",
          category: langInfo.category || "",
          availableLanguagesCount: langInfo.availableLanguagesCount || "",
          iconPreview: iconUrl || null,
          screenshotPreviews: screenshotUrls,
          whatsNew: langInfo.whatsNew.filter((item) => item.trim() !== ""),
        };
      }

      // OS FILES
      const finalOSDetails: Record<string, any> = {};

      for (const os of Object.keys(selectedOS)) {
        if (selectedOS[os] && osDetails[os]?.buildFile) {
          const file = osDetails[os].buildFile!;

          setUploadStatus(
            `${os.toUpperCase()} fayli R2 xotirasiga yuklanmoqda...`,
          );

          const uploadResult = await handleGameUpload(file);

          if (!uploadResult.success) {
            throw new Error(`${os} faylini Cloudflare R2ga yuklashda xatolik!`);
          }

          finalOSDetails[os] = {
            requirements: osDetails[os].requirements,
            fileName: uploadResult.fileKey,
          };
        } else if (selectedOS[os]) {
          finalOSDetails[os] = {
            requirements: osDetails[os].requirements,
            fileName: osDetails[os].fileName || "",
          };
        }
      }

      setUploadStatus("Malumotlar saqlanmoqda...");

      // SLUG
      const baseTitle = langData.uz.title || langData.en.title || "game";

      const generatedSlug =
        slug.trim() !== ""
          ? slug
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)+/g, "")
          : baseTitle
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)+/g, "") +
            "-" +
            Date.now();

      // =========================
      // FINAL PAYLOAD
      // =========================
      const payload = {
        slug: generatedSlug,

        platform,

        selectedOS,

        osDetails: finalOSDetails,

        visibility,

        priceType,

        price: priceType === "paid" ? price : "0$",

        // MUHIM:
        // Endi karta malumotlari yuborilmaydi.
        // Faqat Card ID yuboriladi.
        payoutCardId: priceType === "paid" ? selectedCardId : null,

        techData,

        langData: finalLanguagesData,
      };

      const res = await fetch("/api/create-game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Oyinni saqlashda xatolik yuz berdi",
        );
      }

      setIsSuccessModalOpen(true);
    } catch (error: any) {
      console.error("Xatolik:", error);

      alert(error.message || "Yuklashda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
      setUploadStatus("");
    }
  };

  const handleConfirmAndNavigate = () => {
    setIsSuccessModalOpen(false);
    router.push("/developer/my-games");
  };

  // =========================
  // STYLES
  // =========================
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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* HEADER */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
              Yangi Oʻyin Qoʻshish
            </h1>

            <p className="text-xs mt-1 text-slate-400 font-medium">
              MyGames loyihalar boshqaruvi
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 w-full sm:w-auto">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-95 transition-all duration-200",

                isSubmitting && "opacity-50 cursor-not-allowed",
              )}
            >
              {isSubmitting ? "Yuklanmoqda..." : "Oʻyinni Nashr Qilish 🚀"}
            </button>

            {uploadStatus && (
              <span className="text-xs text-blue-400 font-medium animate-pulse">
                {uploadStatus}
              </span>
            )}
          </div>
        </div>

        {/* SLUG */}
        <section className={blockClass}>
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-black flex items-center gap-2">
              <IoLinkOutline className="text-blue-500" size={20} />
              Oyin Slugi (URL nomi)
            </h2>

            <p className="text-xs text-slate-400">
              Oyin uchun unikal URL manzilini kiriting.
            </p>
          </div>

          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Masalan: pubg-mobile-v3"
            className={inputClass}
          />
        </section>

        {/* LANGUAGES */}
        <section className={blockClass}>
          <div>
            <h2 className="text-base font-black flex items-center gap-2">
              <IoLanguageOutline className="text-blue-500" size={20} />
              Oʻyin Maʼlumotlari
            </h2>

            <p className="text-xs text-slate-400">
              Har bir tildagi maʼlumotlarni alohida kiriting.
            </p>
          </div>

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
                  ? "Ozbek"
                  : lang === "ru"
                    ? "Русский"
                    : lang === "en"
                      ? "English"
                      : "Türkçe"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">
                Oʻyin nomi
              </label>

              <input
                type="text"
                value={langData[activeLang].title}
                onChange={(e) =>
                  handleTextChange(activeLang, "title", e.target.value)
                }
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
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-blue-400">
                <IoDocumentTextOutline className="inline mr-1" size={16} />
                Asosiy Tavsif
              </label>

              <textarea
                value={langData[activeLang].Maindescription}
                onChange={(e) =>
                  handleTextChange(
                    activeLang,
                    "Maindescription",
                    e.target.value,
                  )
                }
                rows={3}
                className={cn(inputClass, "resize-none font-medium")}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">
                Qoʻshimcha Tavsif
              </label>

              <input
                type="text"
                value={langData[activeLang].description}
                onChange={(e) =>
                  handleTextChange(activeLang, "description", e.target.value)
                }
                className={inputClass}
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
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-400">
                Mavjud Tillar
              </label>

              <input
                type="text"
                value={langData[activeLang].availableLanguagesCount}
                onChange={(e) =>
                  handleTextChange(
                    activeLang,
                    "availableLanguagesCount",
                    e.target.value,
                  )
                }
                className={inputClass}
              />
            </div>
          </div>

          {/* MEDIA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">
                Oʻyin Logotipi
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

        {/* PLATFORM */}
        <section className={blockClass}>
          <div>
            <h2 className="text-base font-black flex items-center gap-2">
              <IoLogoWindows className="text-blue-500" size={20} />
              Platforma va Build Paketlari
            </h2>
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
                    : "border-white/5 bg-white/5 text-slate-400",
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
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {os} Build va Tizim Talablari
                </h3>

                <div className="relative border border-dashed border-white/10 rounded-xl p-3 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <IoFolderOpenOutline size={20} className="text-blue-400" />

                    <div>
                      <p className="text-xs font-bold">
                        {osDetails[os].fileName ||
                          "Faylni yuklang (.zip, .apk, .exe)"}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-white/5 text-xs font-bold rounded-lg border border-white/10">
                    Fayl tanlash
                  </span>

                  <input
                    type="file"
                    onChange={(e) => handleFolderFileChange(os, e)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    ["os", "cpu", "gpu", "ram"] as (keyof OSRequirements)[]
                  ).map((field) => (
                    <div key={field} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">
                        {field}
                      </label>

                      <input
                        type="text"
                        value={osDetails[os].requirements[field]}
                        onChange={(e) =>
                          handleOSRequirementFieldChange(
                            os,
                            field,
                            e.target.value,
                          )
                        }
                        className={cn(inputClass, "py-2 px-3 text-xs")}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* TECH DATA */}
        <section className={blockClass}>
          <div>
            <h2 className="text-base font-black flex items-center gap-2 text-blue-400">
              <IoHardwareChipOutline size={20} />
              Umumiy Texnik Malumotlar
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(
              [
                ["version", "Versiya", "3.2.0.18742"],
                ["downloadSize", "Yuklash Hajmi", "1.42 GB"],
                ["inGameSize", "Oyin Ichida", "~3.5 GB"],
                ["developer", "Tuzuvchi", "Level Infinite"],
                ["releaseDate", "Chiqarilgan Sana", "19 Mart, 2018"],
              ] as [keyof TechnicalDetails, string, string][]
            ).map(([field, label, placeholder]) => (
              <div key={field} className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  {label}
                </label>

                <input
                  type="text"
                  value={techData[field]}
                  onChange={(e) => handleTechDataChange(field, e.target.value)}
                  placeholder={placeholder}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </section>

        {/* PRICE + CARD */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={blockClass}>
            <h3 className="text-xs font-black">Narx va Monetizatsiya</h3>

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
              <div className="space-y-4 pt-1">
                {/* PRICE */}
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Narx (Masalan: 9.99$)"
                  className={inputClass}
                />

                {/* CARD SELECTOR */}
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-blue-400 flex items-center gap-2">
                        <IoCardOutline size={17} />
                        Developer Payout
                      </p>

                      <p className="text-[10px] text-slate-500 mt-1">
                        Sotuvlardan tushadigan mablag shu kartaga yuboriladi.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={loadCards}
                      disabled={cardsLoading}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
                    >
                      <IoRefreshOutline
                        size={16}
                        className={cardsLoading ? "animate-spin" : ""}
                      />
                    </button>
                  </div>

                  {cardsLoading ? (
                    <div className="p-4 rounded-xl bg-white/5 text-xs text-slate-400 text-center">
                      Kartalar yuklanmoqda...
                    </div>
                  ) : cards.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-white/10 text-center">
                      <IoCardOutline
                        size={28}
                        className="mx-auto text-slate-500 mb-2"
                      />

                      <p className="text-xs font-bold text-slate-300">
                        Hali payout karta qoshilmagan
                      </p>

                      <p className="text-[10px] text-slate-500 mt-1">
                        Avval payout kartangizni qoshing.
                      </p>

                      <button
                        type="button"
                        onClick={() => router.push("/developer/cards")}
                        className="mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold"
                      >
                        + Karta qoshish
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cards
                        .filter((card) => card.verified)
                        .map((card) => (
                          <button
                            key={card._id}
                            type="button"
                            onClick={() => setSelectedCardId(card._id)}
                            className={cn(
                              "w-full p-4 rounded-xl border text-left transition-all",

                              selectedCardId === card._id
                                ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                                : "border-white/5 bg-white/5 hover:border-white/10",
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                  <IoCardOutline size={21} />
                                </div>

                                <div>
                                  <p className="text-xs font-black">
                                    {card.cardholderName}
                                  </p>

                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    •••• {card.cardLast4} · {card.currency}
                                  </p>
                                </div>
                              </div>

                              {selectedCardId === card._id && (
                                <IoCheckmarkCircleOutline
                                  size={22}
                                  className="text-blue-500"
                                />
                              )}
                            </div>
                          </button>
                        ))}

                      <button
                        type="button"
                        onClick={() => router.push("/developer/cards")}
                        className="w-full py-3 rounded-xl border border-dashed border-blue-500/30 text-blue-400 text-xs font-bold hover:bg-blue-500/5 transition-all"
                      >
                        + Yangi payout karta qoshish
                      </button>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-500">
                    MIDEMda toliq karta raqami, CVV, PIN yoki bank paroli
                    saqlanmaydi.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* VISIBILITY */}
          <div className={blockClass}>
            <h3 className="text-xs font-black">Koʻrinuvchanlik</h3>

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

        {/* CHANGELOG */}
        <section className={blockClass}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black">Changelog / Oʻzgarishlar</h3>

            <button
              type="button"
              onClick={() => handleAddWhatsNew(activeLang)}
              className="p-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <IoAddCircleOutline size={14} />
              Qoʻshish
            </button>
          </div>

          <div className="space-y-2">
            {langData[activeLang].whatsNew.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={item}
                  onChange={(e) =>
                    handleWhatsNewChange(activeLang, index, e.target.value)
                  }
                  placeholder="Yangi nima qoshildi..."
                  className={cn(inputClass, "py-2")}
                />

                {langData[activeLang].whatsNew.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveWhatsNew(activeLang, index)}
                    className="p-2.5 bg-red-500/10 text-red-500 rounded-xl"
                  >
                    <IoTrashOutline size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </form>

      {/* SUCCESS MODAL */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div
            className={cn(
              "w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl border flex flex-col items-center text-center gap-5",

              isDark
                ? "bg-slate-900 border-white/10 text-white"
                : "bg-white border-slate-200 text-slate-900",
            )}
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center ring-8 ring-emerald-500/5">
              <IoCheckmarkCircleOutline size={42} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black">
                Muvaffaqiyatli Yuklandi! 🎉
              </h3>

              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Oʻyin maʼlumotlari, media fayllar hamda build paketlari
                muvaffaqiyatli saqlandi.
              </p>
            </div>

            <button
              type="button"
              onClick={handleConfirmAndNavigate}
              className="w-full mt-2 py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              Oʻyinlarim boʻlimiga oʻtish
              <IoArrowForwardOutline size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
