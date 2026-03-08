import { put, head } from "@vercel/blob";
import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");
  const body = typeof data === "string" ? Buffer.from(data) : data;

  if (!isBlobConfigured()) {
    ensureUploadsDir();
    const filePath = path.join(UPLOADS_DIR, key.replace(/\//g, path.sep));
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, body);
    const url = `/uploads/${key}`;
    return { key, url };
  }

  const blob = await put(key, body, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });

  return { key, url: blob.url };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");

  if (!isBlobConfigured()) {
    const url = `/uploads/${key}`;
    return { key, url };
  }

  try {
    const blob = await head(key);
    return { key, url: blob.url };
  } catch {
    return { key, url: "" };
  }
}
