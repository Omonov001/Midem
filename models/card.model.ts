import { Schema, model, models, Document } from "mongoose";

export interface ICardDocument extends Document {
  userId: string;

  // Provider tokeni — haqiqiy karta ma'lumotining o'rniga
  providerToken: string;

  // UI uchun faqat oxirgi 4 raqam
  cardLast4: string;

  cardholderName: string;

  country: string;
  currency: string;

  verified: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const CardSchema = new Schema<ICardDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    providerToken: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },

    cardLast4: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 4,
      match: /^\d{4}$/,
    },

    cardholderName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    country: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 3,
    },

    currency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 3,
    },

    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

CardSchema.index({ userId: 1, verified: 1 });

const Card = models.Card || model<ICardDocument>("Card", CardSchema);

export default Card;
