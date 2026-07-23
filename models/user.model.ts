import { Schema, model, models, Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  name: string;
  username?: string;
  email: string;
  picture: string;
  role: "user" | "admin" | "owner" | "developer";
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
  },
  { timestamps: true },
);

const User = models.User || model<IUser>("User", UserSchema);

export default User;
