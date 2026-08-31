import { Schema, model, models, Document } from "mongoose";

export interface IPurchaseDocument extends Document {
  buyerId: Schema.Types.ObjectId;
  gameId: Schema.Types.ObjectId;
  developerId: Schema.Types.ObjectId;

  lemonSqueezyOrderId: string;

  amount: number; // umumiy summa
  currency: string;
  commission: number; // 20%
  developerShare: number; // 80%

  status: "paid" | "refunded";

  createdAt: Date;
  updatedAt: Date;
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

    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true },
    commission: { type: Number, required: true },
    developerShare: { type: Number, required: true },

    status: {
      type: String,
      enum: ["paid", "refunded"],
      default: "paid",
      index: true,
    },
  },
  { timestamps: true },
);

PurchaseSchema.index({ buyerId: 1, gameId: 1 }, { unique: true });

const Purchase =
  models.Purchase || model<IPurchaseDocument>("Purchase", PurchaseSchema);
export default Purchase;
