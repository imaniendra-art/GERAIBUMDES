import * as Minio from "minio";

const rawEndpoint =
  process.env.MINIO_ENDPOINT || "https://minio-console.stimiyapmim.ac.id";
const accessKey = process.env.MINIO_ACCESS_KEY || "admin_pusdatin";
const secretKey = process.env.MINIO_SECRET_KEY || "admin_pusdatin123";
export const MINIO_BUCKET = process.env.MINIO_BUCKET || "gerai-bumdes";

function parseMinioEndpoint(endpointStr: string) {
  const trimmed = endpointStr.trim().replace(/\/+$/, "");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const parsed = new URL(trimmed);
    const useSSL = parsed.protocol === "https:";
    const port = parsed.port
      ? parseInt(parsed.port, 10)
      : useSSL
      ? 443
      : 80;
    return {
      endPoint: parsed.hostname,
      port,
      useSSL,
      publicBaseUrl: `${parsed.protocol}//${parsed.host}`,
    };
  }

  // Fallback jika hanya hostname[:port]
  const [host, portStr] = trimmed.split(":");
  const port = portStr ? parseInt(portStr, 10) : 443;
  const useSSL = port === 443;
  return {
    endPoint: host,
    port,
    useSSL,
    publicBaseUrl: `${useSSL ? "https" : "http"}://${trimmed}`,
  };
}

const endpointConfig = parseMinioEndpoint(rawEndpoint);

export const MINIO_PUBLIC_BASE_URL = (
  process.env.MINIO_PUBLIC_URL || endpointConfig.publicBaseUrl
).replace(/\/+$/, "");

let minioClientInstance: Minio.Client | null = null;
let bucketInitialized = false;

export function getMinioClient(): Minio.Client {
  if (!minioClientInstance) {
    minioClientInstance = new Minio.Client({
      endPoint: endpointConfig.endPoint,
      port: endpointConfig.port,
      useSSL: endpointConfig.useSSL,
      accessKey,
      secretKey,
    });
  }
  return minioClientInstance;
}

/**
 * Memastikan bucket tersedia dan memiliki policy public-read untuk objek di dalamnya.
 */
export async function ensureBucketReady(
  bucketName: string = MINIO_BUCKET
): Promise<void> {
  if (bucketInitialized && bucketName === MINIO_BUCKET) return;

  const client = getMinioClient();
  const exists = await client.bucketExists(bucketName);

  if (!exists) {
    await client.makeBucket(bucketName, "us-east-1");
  }

  // Pastikan policy public-read diterapkan agar URL gambar dapat diakses langsung oleh browser
  const publicReadPolicy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucketName}/*`],
      },
    ],
  };

  try {
    await client.setBucketPolicy(bucketName, JSON.stringify(publicReadPolicy));
  } catch (err) {
    console.warn("[MinIO] Gagal mengatur bucket policy:", err);
  }

  if (bucketName === MINIO_BUCKET) {
    bucketInitialized = true;
  }
}

/**
 * Mengunggah Buffer file ke MinIO dan mengembalikan URL publiknya.
 */
export async function uploadToMinio(
  buffer: Buffer,
  objectName: string,
  contentType: string
): Promise<{ url: string; objectName: string; bucket: string }> {
  const client = getMinioClient();
  await ensureBucketReady(MINIO_BUCKET);

  const cleanKey = objectName.replace(/^\/+/, "");

  await client.putObject(MINIO_BUCKET, cleanKey, buffer, buffer.length, {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
  });

  const url = `${MINIO_PUBLIC_BASE_URL}/${MINIO_BUCKET}/${cleanKey}`;

  return {
    url,
    objectName: cleanKey,
    bucket: MINIO_BUCKET,
  };
}

/**
 * Menghapus file dari MinIO berdasarkan URL publik atau object key.
 */
export async function deleteFromMinio(fileUrlOrKey: string): Promise<void> {
  if (!fileUrlOrKey) return;
  const client = getMinioClient();

  let objectKey = fileUrlOrKey;
  const prefix = `${MINIO_PUBLIC_BASE_URL}/${MINIO_BUCKET}/`;
  if (fileUrlOrKey.startsWith(prefix)) {
    objectKey = fileUrlOrKey.substring(prefix.length);
  } else {
    objectKey = fileUrlOrKey.replace(/^\/+/, "");
  }

  await client.removeObject(MINIO_BUCKET, objectKey);
}

