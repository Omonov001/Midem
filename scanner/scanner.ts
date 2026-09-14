import { createWriteStream } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import crypto from "node:crypto";

import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

import { r2 } from "./r2.js";

const BUCKET = "midem-games";
const TEMP_DIR = path.resolve("./tmp");

function runClamAV(filePath: string): Promise<{
  clean: boolean;
  threat: string | null;
}> {
  return new Promise((resolve, reject) => {
    const command = process.env.CLAMAV_COMMAND || "clamscan";

    const child = spawn(command, ["--no-summary", "--stdout", filePath]);

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);

    child.on("close", (code) => {
      // ClamAV:
      // 0 = clean
      // 1 = infected
      // 2+ = scanner error

      if (code === 0) {
        resolve({
          clean: true,
          threat: null,
        });

        return;
      }

      if (code === 1) {
        const match = stdout.match(/: (.+) FOUND/i);

        resolve({
          clean: false,
          threat: match?.[1] || "Threat detected",
        });

        return;
      }

      reject(new Error(`ClamAV error: ${stderr || stdout}`));
    });
  });
}

export async function scanGameBuild(key: string): Promise<{
  clean: boolean;
  sha256: string;
  threat: string | null;
}> {
  if (
    !key.startsWith("quarantine/") ||
    key.includes("..") ||
    key.includes("\\")
  ) {
    throw new Error("Invalid quarantine key");
  }

  await mkdir(TEMP_DIR, {
    recursive: true,
  });

  const safeId = crypto.randomUUID();

  const filePath = path.join(TEMP_DIR, safeId);

  try {
    const head = await r2.send(
      new HeadObjectCommand({
        Bucket: BUCKET,
        Key: key,
      }),
    );

    if (!head.ContentLength || head.ContentLength <= 0) {
      throw new Error("Empty file");
    }

    const object = await r2.send(
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
      }),
    );

    if (!object.Body) {
      throw new Error("R2 object body not found");
    }

    const hash = crypto.createHash("sha256");

    const output = createWriteStream(filePath);

    const body = object.Body as AsyncIterable<Uint8Array>;

    for await (const chunk of body) {
      hash.update(chunk);
      output.write(chunk);
    }

    await new Promise<void>((resolve, reject) => {
      output.end(() => resolve());
      output.on("error", reject);
    });

    const sha256 = hash.digest("hex");

    const scan = await runClamAV(filePath);

    return {
      clean: scan.clean,
      sha256,
      threat: scan.threat,
    };
  } finally {
    await rm(filePath, {
      force: true,
    }).catch(() => {});
  }
}
