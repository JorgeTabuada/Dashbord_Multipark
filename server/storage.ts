import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

function isS3Configured(): boolean {
  return !!(process.env.AWS_REGION && process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID);
}

const getS3Client = (() => {
  let client: S3Client | null = null;
  return () => {
    if (!client) {
      const region = process.env.AWS_REGION;
      if (!region) throw new Error("AWS_REGION not configured");
      client = new S3Client({ region });
    }
    return client;
  };
})();

function getBucket(): string {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) throw new Error("AWS_S3_BUCKET not configured");
  return bucket;
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

  // Use local filesystem if S3 is not configured
  if (!isS3Configured()) {
    ensureUploadsDir();
    const filePath = path.join(UPLOADS_DIR, key.replace(/\//g, path.sep));
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const body = typeof data === "string" ? Buffer.from(data) : data;
    fs.writeFileSync(filePath, body);
    const url = `/uploads/${key}`;
    return { key, url };
  }

  const s3 = getS3Client();
  const bucket = getBucket();
  const body = typeof data === "string" ? Buffer.from(data) : data;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: 3600 * 24 * 7 }
  );

  return { key, url };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");

  if (!isS3Configured()) {
    const url = `/uploads/${key}`;
    return { key, url };
  }

  const s3 = getS3Client();
  const bucket = getBucket();

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: 3600 * 24 * 7 }
  );

  return { key, url };
}
