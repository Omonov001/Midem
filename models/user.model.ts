import { Schema, model, models, Document } from "mongoose";

// Rank turlari
export type UserRank = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export interface IUser extends Document {
  clerkId: string;
  name: string;
  username?: string;
  email: string;
  picture: string;

  role: "user" | "admin" | "owner" | "developer";

  // Stripe Connect
  stripeAccountId?: string | null;

  // Dashboard statistikasi
  balance: number;
  gamesCount: number;
  achievements: number;
  playtime: number;

  // Daraja va Rank
  level: number;
  rank: UserRank;
  isPremium: boolean;

  // Ban holati
  isBanned: boolean;

  // Oxirgi faollik
  lastSeen: Date;

  // Oxirgi o'ynalgan o'yin
  lastPlayedGame?: {
    title: string;
    image: string;
    lastPlayedAt: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      unique: true,
      sparse: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    picture: {
      type: String,
      required: true,
    },

    // ROLE
    role: {
      type: String,
      enum: ["user", "admin", "owner", "developer"],
      default: "user",
    },

    // STRIPE CONNECT
    stripeAccountId: {
      type: String,
      default: null,
      index: true,
    },

    // DASHBOARD VA STATISTIKA
    balance: {
      type: Number,
      default: 0,
    },

    gamesCount: {
      type: Number,
      default: 0,
    },

    achievements: {
      type: Number,
      default: 0,
    },

    playtime: {
      type: Number,
      default: 0,
    },

    // LEVEL VA RANK
    level: {
      type: Number,
      default: 1,
    },

    rank: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum", "diamond"],
      default: "bronze",
    },

    isPremium: {
      type: Boolean,
      default: false,
    },

    // BAN
    isBanned: {
      type: Boolean,
      default: false,
      index: true,
    },

    // USER OXIRGI FAOLLIGI
    lastSeen: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // OXIRGI O'YNALGAN O'YIN
    lastPlayedGame: {
      title: {
        type: String,
        default: "",
      },

      image: {
        type: String,
        default: "",
      },

      lastPlayedAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  },
);

const User = models.User || model<IUser>("User", UserSchema);

export default User;
