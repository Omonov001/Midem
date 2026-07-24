import { Schema, model, models, Document } from "mongoose";

// Rank turlari uchun alohida type
export type UserRank = "bronze" | "gold" | "platinum" | "diamond";

export interface IUser extends Document {
  clerkId: string;
  name: string;
  username?: string;
  email: string;
  picture: string;
  role: "user" | "admin" | "owner" | "developer";

  // Dashboard statistikasi uchun maydonlar
  balance: number;
  gamesCount: number;
  achievements: number;
  playtime: number;

  // Daraja va Rank
  level: number;
  rank: UserRank;
  isPremium: boolean;

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
    clerkId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    picture: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "owner", "developer"],
      default: "user",
    },

    // --- DASHBOARD VA STATISTIKA MAYDONLARI ---
    balance: { type: Number, default: 0 },
    gamesCount: { type: Number, default: 0 },
    achievements: { type: Number, default: 0 },
    playtime: { type: Number, default: 0 },

    // Daraja va Unvon (Rank)
    level: { type: Number, default: 1 },
    rank: {
      type: String,
      enum: ["bronze", "gold", "platinum", "diamond"],
      default: "bronze",
    },

    isPremium: { type: Boolean, default: false },

    // Oxirgi o'ynalgan o'yin
    lastPlayedGame: {
      title: { type: String, default: "" },
      image: { type: String, default: "" },
      lastPlayedAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true },
);

const User = models.User || model<IUser>("User", UserSchema);

export default User;
