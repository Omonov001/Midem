import { handleGameUpload } from "@/lib/upload";

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20 MB

export async function uploadImageToFirebase(
  file: File,
  folderName: string = "images",
): Promise<string> {
  try {
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error("Rasm maksimal 20 MB bo'lishi mumkin!");
    }

    const result = await handleGameUpload(file);

    if (!result.success || !result.fileKey) {
      throw new Error("Rasm R2 ga yuklanmadi!");
    }

    const PUBLIC_R2_DOMAIN = process.env.NEXT_PUBLIC_R2_DOMAIN || "";
    const baseUrl = PUBLIC_R2_DOMAIN.replace(/\/$/, "");

    return `${baseUrl}/${result.fileKey}`;
  } catch (error) {
    console.error("R2 ga rasm yuklashda xatolik:", error);

    throw error instanceof Error ? error : new Error("Rasm yuklanmadi!");
  }
}
