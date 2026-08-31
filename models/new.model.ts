import mongoose, { Schema, Document, ObjectId } from "mongoose";

export type VisibilityType = "public" | "private";
export type RequestStatusType = "requested" | "approved" | "rejected";

interface ITranslation {
  title: string;
  content: string;
  banners: string[];
}

export interface INews extends Document {
  slug: string;
  selectedGame?: mongoose.Types.ObjectId;
  authorId: ObjectId;
  visibility: VisibilityType;
  request: RequestStatusType;
  views: number;
  likes: number;
  likedUsers: mongoose.Types.ObjectId[]; // <-- Yangi qo'shildi
  translations: {
    uz: ITranslation;
    ru: ITranslation;
    en: ITranslation;
    tu: ITranslation;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TranslationSchema = new mongoose.Schema({
  title: { type: String, required: false },
  content: { type: String, required: false },
  banners: [{ type: String }],
});

const NewsSchema = new Schema<INews>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    selectedGame: {
      type: Schema.Types.ObjectId,
      ref: "Game",
      required: false,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    request: {
      type: String,
      enum: ["requested", "approved", "rejected"],
      default: "requested",
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }], // <-- Yangi qo'shildi
    translations: {
      uz: { type: TranslationSchema, required: true },
      ru: { type: TranslationSchema, required: true },
      en: { type: TranslationSchema, required: true },
      tu: { type: TranslationSchema, required: true },
    },
  },
  {
    timestamps: true,
  },
);

export const News =
  mongoose.models.News || mongoose.model<INews>("News", NewsSchema);
