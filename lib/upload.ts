export const handleGameUpload = async (file: File) => {
  try {
    // 1. Backend'dan signed URL olamiz
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.uploadUrl) {
      throw new Error(data.error || "Upload URL olinmadi");
    }

    // 2. Cloudflare R2 ga yuklaymiz
    const uploadRes = await fetch(data.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error(`R2 yuklash xatosi: ${uploadRes.status}`);
    }

    return {
      success: true,
      fileKey: data.fileKey,
    };
  } catch (error) {
    console.error("Yuklashda xatolik:", error);

    return {
      success: false,
      error,
    };
  }
};
