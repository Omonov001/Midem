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

    const dbUser = await User.findOne({ clerkId: clerkUser.id });

    if (!dbUser) return null;

    // Next.js Server Action JSON formatiga o'tkazish uchun parse qilamiz
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
    // 1. Clerk orqali joriy foydalanuvchini tekshirish
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Avtorizatsiyadan o'tilmagan. Iltimos, tizimga kiring.",
      };
    }

    // 2. Baza bilan ulanish
    await connectToDatabase();

    const { name, username } = params;

    // 3. Username band emasligini tekshirish (o'zidan tashqari boshqa user ishlatmayotgan bo'lsin)
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

    // 4. Ma'lumotlarni bazada yangilash
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: { name, username } },
      { new: true },
    );

    if (!updatedUser) {
      return {
        success: false,
        error: "Foydalanuvchi topilmadi.",
      };
    }

    // 5. Account va Dashboard sahifalaridagi keshni yangilash
    revalidatePath("/account");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedUser)),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      return { success: false, error: "Ruxsat berilmagan" };
    }

    // 1. Clerk'dan foydalanuvchini o'chiramiz
    // (U o'chishi bilan Clerk avtomatcha sizning Webhook'ingizga "user.deleted" yuboradi
    // va Webhook MongoDB'dan ham o'chirib beradi!)
    const client = await clerkClient();
    await client.users.deleteUser(userId);

    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("deleteUserAccount xatolik:", error);
    return {
      success: false,
      error: error.message || "Hisobni o'chirishda xatolik",
    };
  }
}
