import { Schema, model, models, Document } from "mongoose";

export type PayoutStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled";

export interface IPayoutDocument extends Document {
  userId: Schema.Types.ObjectId;

  amount: number;
  currency: string;

  status: PayoutStatus;

  method: "card";

  requestedAt: Date;
  processedAt?: Date | null;
  paidAt?: Date | null;

  failureReason?: string | null;

  createdAt: Date;
  updatedAt: Date;
}

const PayoutSchema = new Schema<IPayoutDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
      default: "USD",
    },

    status: {
      type: String,
      enum: ["pending", "processing", "paid", "failed", "cancelled"],
      default: "pending",
      index: true,
    },

    method: {
      type: String,
      enum: ["card"],
      default: "card",
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    processedAt: {
      type: Date,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    failureReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

PayoutSchema.index({ userId: 1, createdAt: -1 });

const Payout = models.Payout || model<IPayoutDocument>("Payout", PayoutSchema);

export default Payout;
