import { NextResponse } from "next/server";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import { auth } from "@clerk/nextjs/server";

import { r2 } from "@/lib/r2";

// ============================================================
// CONFIG
// ============================================================

const GAME_BUCKET = "midem-games";

const MAX_GAME_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB

// ============================================================
// RESPONSE
// ============================================================

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

// ============================================================
// POST /api/upload/complete
// ============================================================

export async function POST(req: Request) {
  try {
    // ----------------------------------------------------------
    // 1. AUTH
    // ----------------------------------------------------------

    const { userId } = await auth();

    if (!userId) {
      return errorResponse("Avval tizimga kirishingiz kerak.", 401);
    }

    // ----------------------------------------------------------
    // 2. BODY
    // ----------------------------------------------------------

    const contentType = req.headers.get("content-type")?.toLowerCase() || "";

    if (!contentType.includes("application/json")) {
      return errorResponse("Noto'g'ri request formati.", 415);
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return errorResponse("Noto'g'ri JSON.", 400);
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return errorResponse("Noto'g'ri request body.", 400);
    }

    const data = body as Record<string, unknown>;

    const uploadId =
      typeof data.uploadId === "string" ? data.uploadId.trim() : "";

    if (!uploadId) {
      return errorResponse("Upload ID ko'rsatilmagan.", 400);
    }

    // UUID formatini tekshiramiz
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        uploadId,
      )
    ) {
      return errorResponse("Noto'g'ri upload ID.", 400);
    }

    // ----------------------------------------------------------
    // 3. QUARANTINE OBJECT KEY
    // ----------------------------------------------------------

    const prefix = `quarantine/${userId}/`;

    // Bizning upload route aynan shu formatni yaratadi.
    // Hozircha object nomini uploadId bilan aniqlash uchun
    // R2 list kerak bo'ladi.
    //
    // Shuning uchun upload route'dan quarantineKey ham yuboramiz.
    //
    // Bu endpoint'ni keyingi bosqichda upload route bilan
    // yanada qattiq bog'laymiz.

    const quarantineKey =
      typeof data.quarantineKey === "string" ? data.quarantineKey.trim() : "";

    if (!quarantineKey) {
      return errorResponse("Quarantine fayl kaliti ko'rsatilmagan.", 400);
    }

    // Path traversal himoyasi
    if (
      quarantineKey.includes("..") ||
      quarantineKey.includes("\\") ||
      !quarantineKey.startsWith(prefix)
    ) {
      return errorResponse("Noto'g'ri quarantine fayl kaliti.", 400);
    }

    // Faqat aynan shu upload ID ga tegishli metadata
    const expectedMetadataPart = `uploadId=${uploadId}`;

    // ----------------------------------------------------------
    // 4. OBJECT EXISTENCE + SIZE
    // ----------------------------------------------------------

    let object;

    try {
      object = await r2.send(
        new HeadObjectCommand({
          Bucket: GAME_BUCKET,
          Key: quarantineKey,
        }),
      );
    } catch (error) {
      console.error("[UPLOAD_COMPLETE_HEAD_ERROR]", error);

      return errorResponse(
        "Quarantine fayli topilmadi yoki hali yuklanmagan.",
        404,
      );
    }

    if (!object.ContentLength) {
      return errorResponse("Fayl hajmini aniqlab bo'lmadi.", 400);
    }

    if (object.ContentLength <= 0) {
      return errorResponse("Bo'sh game build yuklab bo'lmaydi.", 400);
    }

    if (object.ContentLength > MAX_GAME_SIZE) {
      return errorResponse("Game build maksimal 5 GB bo'lishi mumkin.", 413);
    }

    // ----------------------------------------------------------
    // 5. METADATA TEKSHIRISH
    // ----------------------------------------------------------

    const metadata = object.Metadata || {};

    if (metadata.uploadid !== uploadId) {
      return errorResponse("Upload ID fayl bilan mos kelmaydi.", 403);
    }

    if (metadata.uploadedby !== userId) {
      return errorResponse("Bu fayl sizga tegishli emas.", 403);
    }

    if (metadata.quarantine !== "true") {
      return errorResponse("Fayl quarantine holatida emas.", 400);
    }

    // ----------------------------------------------------------
    // 6. ORIGINAL FILE NAME
    // ----------------------------------------------------------

    const originalFileName =
      metadata.originalfilename || quarantineKey.split("/").pop() || "";

    if (!originalFileName) {
      return errorResponse("Original fayl nomi topilmadi.", 400);
    }

    // ----------------------------------------------------------
    // 7. SCAN
    // ----------------------------------------------------------
    //
    // MUHIM:
    //
    // Bu yerda hali antivirusni FAKE qilib clean demaymiz.
    //
    // Keyingi bosqich:
    //
    // R2 quarantine
    //       ↓
    // isolated scanner worker
    //       ↓
    // ClamAV / Defender / boshqa scanner
    //       ↓
    // clean / infected
    //
    // Hozir scanner ulanmagan bo'lsa RELEASE QILMAYMIZ.
    //

    const scannerUrl = process.env.MIDEM_SCANNER_URL?.trim();

    if (!scannerUrl) {
      console.error("[UPLOAD_COMPLETE] MIDEM_SCANNER_URL mavjud emas.");

      return errorResponse(
        "Game scanner serveri sozlanmagan. Fayl quarantine holatida qoldirildi.",
        503,
      );
    }

    // ----------------------------------------------------------
    // 8. SCANNER'GA YUBORISH
    // ----------------------------------------------------------

    let scanResponse: Response;

    try {
      scanResponse = await fetch(`${scannerUrl.replace(/\/+$/, "")}/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MIDEM_SCANNER_TOKEN || ""}`,
        },
        body: JSON.stringify({
          bucket: GAME_BUCKET,
          key: quarantineKey,
          uploadId,
          userId,
        }),
        cache: "no-store",
      });
    } catch (error) {
      console.error("[UPLOAD_COMPLETE_SCANNER_CONNECTION_ERROR]", error);

      return errorResponse(
        "Scanner serveriga ulanib bo'lmadi. Fayl quarantine holatida qoldirildi.",
        503,
      );
    }

    if (!scanResponse.ok) {
      const scannerText = await scanResponse.text().catch(() => "");

      console.error(
        "[UPLOAD_COMPLETE_SCANNER_ERROR]",
        scanResponse.status,
        scannerText,
      );

      return errorResponse(
        "Game build scan qilinmadi. Fayl quarantine holatida qoldirildi.",
        503,
      );
    }

    let scanData: {
      clean?: boolean;
      sha256?: string;
      threat?: string | null;
    };

    try {
      scanData = await scanResponse.json();
    } catch {
      return errorResponse("Scanner noto'g'ri javob qaytardi.", 503);
    }

    // ----------------------------------------------------------
    // 9. INFECTED
    // ----------------------------------------------------------

    if (scanData.clean !== true) {
      console.error("[UPLOAD_COMPLETE_INFECTED]", {
        uploadId,
        userId,
        threat: scanData.threat || null,
      });

      // Zararlangan faylni PUBLIC games/ ga o'tkazmaymiz.
      //
      // Hozircha quarantine'da qoldiramiz.
      // Keyinchalik admin/security worker orqali o'chirish mumkin.

      return NextResponse.json(
        {
          success: false,
          status: "rejected",
          error: "Game build xavfsizlik tekshiruvidan o'tmadi.",
          threat: scanData.threat || null,
        },
        {
          status: 422,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    // ----------------------------------------------------------
    // 10. SHA-256
    // ----------------------------------------------------------

    const sha256 =
      typeof scanData.sha256 === "string" &&
      /^[a-f0-9]{64}$/i.test(scanData.sha256)
        ? scanData.sha256.toLowerCase()
        : "";

    if (!sha256) {
      return errorResponse("Scanner SHA-256 hash qaytarmadi.", 503);
    }

    // ----------------------------------------------------------
    // 11. FINAL KEY
    // ----------------------------------------------------------

    const finalKey = `games/${uploadId}-${originalFileName}`;

    // ----------------------------------------------------------
    // 12. QUARANTINE -> FINAL
    // ----------------------------------------------------------

    try {
      await r2.send(
        new CopyObjectCommand({
          Bucket: GAME_BUCKET,
          CopySource: `${GAME_BUCKET}/${encodeURIComponent(
            quarantineKey,
          ).replace(/%2F/g, "/")}`,
          Key: finalKey,
          MetadataDirective: "REPLACE",
          ContentType: object.ContentType || "application/octet-stream",
          Metadata: {
            uploadedBy: userId,
            originalFileName,
            uploadId,
            scanStatus: "clean",
            sha256,
            signed: "false",
            quarantine: "false",
          },
        }),
      );
    } catch (error) {
      console.error("[UPLOAD_COMPLETE_COPY_ERROR]", error);

      return errorResponse(
        "Tekshirilgan faylni release qilishda xatolik.",
        500,
      );
    }

    // ----------------------------------------------------------
    // 13. QUARANTINE'NI O'CHIRISH
    // ----------------------------------------------------------

    try {
      await r2.send(
        new DeleteObjectCommand({
          Bucket: GAME_BUCKET,
          Key: quarantineKey,
        }),
      );
    } catch (error) {
      // Final file allaqachon mavjud.
      // Quarantine o'chirish xatosi release'ni bekor qilmasin.
      console.error("[UPLOAD_COMPLETE_QUARANTINE_DELETE_ERROR]", error);
    }

    // ----------------------------------------------------------
    // 14. SUCCESS
    // ----------------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        status: "released",
        fileKey: finalKey,
        uploadId,
        sha256,
        scanned: true,
        clean: true,
        signed: false,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("[UPLOAD_COMPLETE_ROUTE_ERROR]", error);

    return errorResponse("Uploadni yakunlashda server xatosi.", 500);
  }
}
