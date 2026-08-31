import { Schema, model, models, Document, Types } from "mongoose";

export type MessageRequestType =
  | "game_suggestion"
  | "bug_report"
  | "partnership"
  | "other";

export interface IMessage extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;

  requestType: MessageRequestType;
  subject: string;
  message: string;

  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    // Xabar yuborgan USER
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Xabar qabul qiladigan ADMIN / OWNER / DEVELOPER
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    requestType: {
      type: String,
      enum: ["game_suggestion", "bug_report", "partnership", "other"],
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
  },
  {
    timestamps: true,
  },
);

const Message = models.Message || model<IMessage>("Message", MessageSchema);

export default Message;
