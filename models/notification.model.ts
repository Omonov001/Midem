import mongoose, { Schema, Document, Model } from "mongoose";

export type NotificationRecipientType = "public" | "user";

export type NotificationType =
  | "system"
  | "message"
  | "achievement"
  | "payment"
  | "admin"
  | "account";

export interface NotificationTranslation {
  title: string;
  message: string;
}

export interface NotificationTranslations {
  uz: NotificationTranslation;
  ru: NotificationTranslation;
  en: NotificationTranslation;
  tr: NotificationTranslation;
}

export interface INotification extends Document {
  recipientType: NotificationRecipientType;

  // MongoDB User._id string ko'rinishida saqlanadi.
  // Public notification uchun null.
  userId?: string | null;

  type: NotificationType;

  translations: NotificationTranslations;

  deletedBy: string[];
  // Private notification:
  // shu user o'qiganmi yoki yo'qmi.
  isRead: boolean;

  // Public notification:
  // notificationni o'qigan User._id lar.
  readBy: string[];

  // Notification yuborgan userning MongoDB User._id / Clerk ID si
  senderId?: string | null;

  link?: string | null;

  createdAt: Date;
  updatedAt: Date;
}

const NotificationTranslationSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    _id: false,
  },
);

const NotificationSchema = new Schema<INotification>(
  {
    recipientType: {
      type: String,
      enum: ["public", "user"],
      required: true,
      default: "public",
      index: true,
    },

    // MongoDB User._id
    userId: {
      type: String,
      default: null,
      index: true,
    },

    type: {
      type: String,
      enum: ["system", "message", "achievement", "payment", "admin", "account"],
      required: true,
      default: "system",
      index: true,
    },

    deletedBy: {
      type: [String],
      default: [],
      index: true,
    },

    translations: {
      uz: {
        type: NotificationTranslationSchema,
        required: true,
      },

      ru: {
        type: NotificationTranslationSchema,
        required: true,
      },

      en: {
        type: NotificationTranslationSchema,
        required: true,
      },

      tr: {
        type: NotificationTranslationSchema,
        required: true,
      },
    },

    // Private notification uchun ishlatiladi
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Public notification uchun ishlatiladi
    readBy: {
      type: [String],
      default: [],
    },

    senderId: {
      type: String,
      default: null,
    },

    link: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Public + private notificationlarni tez topish
NotificationSchema.index({
  recipientType: 1,
  userId: 1,
  createdAt: -1,
});

// Eng yangi notificationlar
NotificationSchema.index({
  createdAt: -1,
});

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
