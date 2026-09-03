import { Schema, model, models, Document } from "mongoose";

export interface IPayoutRequest extends Document {
  developerId: Schema.Types.ObjectId;
  amount: number;
  status: "pending" | "paid" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const PayoutRequestSchema = new Schema<IPayoutRequest>(
  {
    developerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["pending", "paid", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);

const PayoutRequest =
  models.PayoutRequest ||
  model<IPayoutRequest>("PayoutRequest", PayoutRequestSchema);
export default PayoutRequest;
