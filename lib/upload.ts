export const handleGameUpload = async (file: File) => {
  try {
    // 1. Backend'dan URL olamiz
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
      }),
    });

    const data = await res.json();

    if (!data.uploadUrl) {
      throw new Error(data.error || "Upload URL olinmadi");
    }

    // 2. R2 ga yuklaymiz (Content-Type bo'sh bo'lsa "application/octet-stream" beramiz)
    const uploadRes = await fetch(data.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    if (uploadRes.ok) {
      return { success: true, fileKey: data.fileKey };
    } else {
      throw new Error(`R2 yuklash xatosi: ${uploadRes.status}`);
    }
  } catch (error) {
    console.error("Yuklashda xatolik:", error);
    return { success: false, error };
  }
};
