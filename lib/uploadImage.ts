import { handleGameUpload } from "@/lib/upload";

export async function uploadImageToFirebase(
  file: File,
  folderName: string = "images",
): Promise<string> {
  try {
    // Rasmni Cloudflare R2 ga yuklaymiz
    const result = await handleGameUpload(file);

    if (!result.success || !result.fileKey) {
      throw new Error("Rasm R2 ga yuklanmadi!");
    }

    const PUBLIC_R2_DOMAIN = process.env.NEXT_PUBLIC_R2_DOMAIN || "";

    // Agar URL oxirida '/' bo'lsa, uni tozalab to'g'ri havola yasaymiz
    const baseUrl = PUBLIC_R2_DOMAIN.replace(/\/$/, "");
    return `${baseUrl}/${result.fileKey}`;
  } catch (error) {
    console.error("R2 ga rasm yuklashda xatolik:", error);
    throw new Error("Rasm yuklanmadi!");
  }
}
