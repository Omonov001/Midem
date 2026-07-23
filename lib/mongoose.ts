import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Next.js hot reload bo'lganda qayta-qayta connection ochilmasligi uchun kesh qilamiz
let cached: MongooseConnection = (
  global as unknown as { mongoose: MongooseConnection }
).mongoose;

if (!cached) {
  cached = (global as unknown as { mongoose: MongooseConnection }).mongoose = {
    conn: null,
    promise: null,
  };
}

export const connectToDatabase = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URL) {
    throw new Error("❌ MONGODB_URL .env.local faylida kiritilmagan!");
  }

  cached.promise =
    cached.promise ||
    mongoose.connect(MONGODB_URL, {
      dbName: "project", // MongoDB'dagi bazangiz nomi
      bufferCommands: false,
    });

  cached.conn = await cached.promise;
  return cached.conn;
};
