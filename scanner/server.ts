import "dotenv/config";

import Fastify from "fastify";

import { scanGameBuild } from "./scanner.js";

const app = Fastify({
  logger: true,
});

const PORT = Number(process.env.PORT || 8080);

const TOKEN = process.env.MIDEM_SCANNER_TOKEN;

if (!TOKEN) {
  throw new Error("MIDEM_SCANNER_TOKEN is required");
}

app.post("/scan", async (request, reply) => {
  const authorization = request.headers.authorization || "";

  if (authorization !== `Bearer ${TOKEN}`) {
    return reply.code(401).send({
      clean: false,
      error: "Unauthorized",
    });
  }

  const body = request.body as {
    bucket?: string;
    key?: string;
    uploadId?: string;
    userId?: string;
  };

  if (
    body.bucket !== "midem-games" ||
    !body.key ||
    !body.uploadId ||
    !body.userId
  ) {
    return reply.code(400).send({
      clean: false,
      error: "Invalid scan request",
    });
  }

  if (!body.key.startsWith("quarantine/")) {
    return reply.code(400).send({
      clean: false,
      error: "Only quarantine objects can be scanned",
    });
  }

  try {
    const result = await scanGameBuild(body.key);

    return reply.send({
      clean: result.clean,
      sha256: result.sha256,
      threat: result.threat,
    });
  } catch (error) {
    request.log.error(error);

    return reply.code(500).send({
      clean: false,
      error: "Scanner failed",
    });
  }
});

app.get("/health", async () => {
  return {
    status: "ok",
    service: "midem-scanner",
  };
});

await app.listen({
  host: "0.0.0.0",
  port: PORT,
});
