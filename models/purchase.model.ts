import { Schema, model, models, Document } from "mongoose";

export interface IPurchaseDocument extends Document {
  buyerId: Schema.Types.ObjectId;
  gameId: Schema.Types.ObjectId;
  developerId: Schema.Types.ObjectId;

  lemonSqueezyOrderId: string;

  amount: number;
  currency: string;
  commission: number;
  developerShare: number;

  status: "paid" | "refunded";

  availableAt: Date;

  createdAt: Date;
  updatedAt: Date;
  releasedAt?: Date | null;
}

const PurchaseSchema = new Schema<IPurchaseDocument>(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    gameId: {
      type: Schema.Types.ObjectId,
      ref: "Game",
      required: true,
      index: true,
    },

    developerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    lemonSqueezyOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      required: true,
      uppercase: true,
    },

    commission: {
      type: Number,
      required: true,
      min: 0,
    },

    developerShare: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["paid", "refunded"],
      default: "paid",
      index: true,
    },

    availableAt: {
      type: Date,
      required: true,
      index: true,
    },

    releasedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

PurchaseSchema.index({ buyerId: 1, gameId: 1 }, { unique: true });

const Purchase =
  models.Purchase || model<IPurchaseDocument>("Purchase", PurchaseSchema);

export default Purchase;
