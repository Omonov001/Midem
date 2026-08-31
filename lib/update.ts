export const handleGameUpdate = async (newFile: File, oldFileKey: string) => {
  try {
    // 1. Backend'dan yuklash uchun Presigned URL olamiz
    const res = await fetch("/api/update-game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oldFileKey: oldFileKey,
        newFileName: newFile.name,
        fileType: newFile.type,
      }),
    });

    const data = await res.json();

    if (!data.uploadUrl) {
      throw new Error(data.error || "Update URL olinmadi");
    }

    // 2. Yangi faylni to'g'ridan-to'g'ri R2 ga yuklaymiz
    const updateRes = await fetch(data.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": newFile.type,
      },
      body: newFile,
    });

    if (updateRes.ok) {
      return { success: true, newFileKey: data.newFileKey };
    } else {
      throw new Error("R2 ga yangi faylni yuklab bo'lmadi");
    }
  } catch (error) {
    console.error("Yangilashda xatolik:", error);
    return { success: false, error };
  }
};
