/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { connectToDatabase } from "@/lib/mongoose";
import User, { IUser } from "@/models/user.model";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getUserData(): Promise<IUser | null> {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) return null;

    await connectToDatabase();

    const dbUser = await User.findOne({
      clerkId: clerkUser.id,
    }).populate("purchasedGames");

    if (!dbUser) return null;

    return JSON.parse(JSON.stringify(dbUser));
  } catch (error) {
    console.error("User ma'lumotlarini olishda xatolik:", error);

    return null;
  }
}

interface UpdateUserParams {
  name: string;
  username: string;
}

export async function updateUserData(params: UpdateUserParams) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Avtorizatsiyadan o'tilmagan. Iltimos, tizimga kiring.",
      };
    }

    await connectToDatabase();

    const { name, username } = params;

    const existingUsername = await User.findOne({
      username,
      clerkId: { $ne: userId },
    });

    if (existingUsername) {
      return {
        success: false,
        error: "Ushbu username allaqachon band!",
      };
    }

    const updatedUser = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        $set: {
          name,
          username,
        },
      },
      {
        new: true,
      },
    );

    if (!updatedUser) {
      return {
        success: false,
        error: "Foydalanuvchi topilmadi.",
      };
    }

    revalidatePath("/account");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedUser)),
    };
  } catch (error: any) {
    console.error("updateUserData actionida xatolik:", error);

    return {
      success: false,
      error: error.message || "Serverda kutilmagan xatolik yuz berdi.",
    };
  }
}

export async function deleteUserAccount() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Ruxsat berilmagan",
      };
    }

    const client = await clerkClient();

    await client.users.deleteUser(userId);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("deleteUserAccount xatolik:", error);

    return {
      success: false,
      error: error.message || "Hisobni o'chirishda xatolik",
    };
  }
}
