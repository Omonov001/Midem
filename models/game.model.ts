import { Schema, model, models, Document } from "mongoose";

// 1. TypeScript Interfeyslari
export type LanguageType = "uz" | "ru" | "en" | "tr";
export type PlatformType = "mobile" | "pc" | "both";
export type RequestStatusType = "requested" | "approved" | "rejected";

export interface ILangSpecificData {
  title?: string;
  subtitle?: string;
  Maindescription?: string;
  description?: string;
  category?: string;
  availableLanguagesCount?: string;
  iconPreview?: string | null;
  screenshotPreviews?: string[];
  whatsNew?: string[];
}

export interface ITechnicalDetails {
  version?: string;
  downloadSize?: string;
  inGameSize?: string;
  developer?: string;
  releaseDate?: string;
}

export interface IOSRequirement {
  os?: string;
  cpu?: string;
  gpu?: string;
  ram?: string;
}

export interface IOSDetail {
  requirements?: IOSRequirement;
  fileName?: string;
}

export interface IGameDocument extends Document {
  // 🚀 TUZATILDI: Clerk ID'lari (String) va Mongo ID'larni ham ko'tarishi uchun Schema.Types.Mixed qilindi
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  developerId: any;
  slug?: string;
  visibility: "public" | "private";
  request: RequestStatusType;
  platform?: PlatformType;
  selectedOS: Record<string, boolean>;
  osDetails: Record<string, IOSDetail>;
  priceType: "free" | "paid";
  price: number;
  lemonSqueezyVariantId?: string;

  payoutCardId?: Schema.Types.ObjectId | null;

  techData: ITechnicalDetails;
  langData: Partial<Record<LanguageType, ILangSpecificData>>;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Mongoose Sub-Sxemalari
const LangSpecificSchema = new Schema<ILangSpecificData>(
  {
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    Maindescription: { type: String, default: "" },
    description: { type: String, default: "" },
    category: { type: String, default: "" },
    availableLanguagesCount: { type: String, default: "" },
    iconPreview: { type: String, default: null },
    screenshotPreviews: { type: [String], default: [] },
    whatsNew: { type: [String], default: [] },
  },
  { _id: false },
);

const TechnicalDetailsSchema = new Schema<ITechnicalDetails>(
  {
    version: { type: String, default: "" },
    downloadSize: { type: String, default: "" },
    inGameSize: { type: String, default: "" },
    developer: { type: String, default: "" },
    releaseDate: { type: String, default: "" },
  },
  { _id: false },
);

const OSRequirementSchema = new Schema<IOSRequirement>(
  {
    os: { type: String, default: "" },
    cpu: { type: String, default: "" },
    gpu: { type: String, default: "" },
    ram: { type: String, default: "" },
  },
  { _id: false },
);

const OSDetailSchema = new Schema<IOSDetail>(
  {
    requirements: { type: OSRequirementSchema, default: {} },
    fileName: { type: String, default: "" },
  },
  { _id: false },
);

// 3. Asosiy Game Sxemasi
const GameSchema = new Schema<IGameDocument>(
  {
    // 🚀 TUZATILDI: Types.ObjectId o'rniga Schema.Types.Mixed ishlatildi!
    developerId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
      default: "",
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
      index: true,
    },
    request: {
      type: String,
      enum: ["requested", "approved", "rejected"],
      default: "requested",
      index: true,
    },
    platform: {
      type: String,
      enum: ["mobile", "pc", "both"],
      default: "pc",
    },
    selectedOS: {
      type: Schema.Types.Mixed,
      default: {},
    },
    osDetails: {
      type: Map,
      of: OSDetailSchema,
      default: {},
    },
    priceType: {
      type: String,
      enum: ["free", "paid"],
      default: "free",
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    lemonSqueezyVariantId: {
      type: String,
      index: true,
    },
    techData: {
      type: TechnicalDetailsSchema,
      default: {},
    },
    langData: {
      uz: { type: LangSpecificSchema, default: {} },
      ru: { type: LangSpecificSchema, default: {} },
      en: { type: LangSpecificSchema, default: {} },
      tr: { type: LangSpecificSchema, default: {} },
    },
    payoutCardId: {
      type: Schema.Types.ObjectId,
      ref: "Card",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

GameSchema.index({ "langData.uz.title": "text", "langData.en.title": "text" });

const Game = models.Game || model<IGameDocument>("Game", GameSchema);

export default Game;
