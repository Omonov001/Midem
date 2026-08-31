// lib/download.ts

export const handleGameDownload = async (
  fileName: string,
  isPaid: boolean,
  userHasBought: boolean,
) => {
  try {
    const response = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, isPaid, userHasBought }),
    });

    const data = await response.json();

    if (data.downloadUrl) {
      // Vaqtinchalik xavfsiz link orqali yuklashni boshlaymiz
      window.location.href = data.downloadUrl;
    } else {
      alert(data.error || "Yuklab olishda xatolik yuz berdi!");
    }
  } catch (error) {
    console.error("Xatolik:", error);
    alert("Server bilan bog'lanishda xatolik.");
  }
};
