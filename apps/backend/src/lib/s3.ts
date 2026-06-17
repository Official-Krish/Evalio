import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

const bucketName = process.env.S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME;
const region = process.env.S3_REGION || process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY;
const secretAccessKey =
  process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_KEY;
const sessionToken = process.env.AWS_SESSION_TOKEN;
const CDN_BASE_URL =
  process.env.ASSETS_CDN_BASE_URL || process.env.CDN_BASE_URL;

if (!bucketName || !region || !CDN_BASE_URL) {
  throw new Error(
    "S3_BUCKET_NAME, S3_REGION, and CDN_BASE_URL must be configured for uploads.",
  );
}

if (
  !process.env.CLOUDFRONT_KEY_PAIR_ID ||
  !process.env.CLOUDFRONT_PRIVATE_KEY
) {
  throw new Error(
    "CLOUDFRONT_KEY_PAIR_ID and CLOUDFRONT_PRIVATE_KEY must be configured for signed URLs.",
  );
}

const s3 = new S3Client({
  region,
  ...(accessKeyId && secretAccessKey
    ? {
        credentials: {
          accessKeyId,
          secretAccessKey,
          ...(sessionToken ? { sessionToken } : {}),
        },
      }
    : {}),
});

async function putObjectToS3(input: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
      ACL: "private",
    }),
  );
}

type UploadSuccess = {
  key: string;
  error?: never;
};

type UploadFailure = {
  url?: never;
  error: string;
};

type UploadResponse = UploadSuccess | UploadFailure;

function sanitizeFileName(name: string): string {
  const ext = name.lastIndexOf(".");
  const base = ext === -1 ? name : name.slice(0, ext);
  const clean = base.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100);
  const suffix = ext === -1 ? "" : name.slice(ext).toLowerCase();
  return clean + suffix;
}

export async function uploadResumeToS3({
  userId,
  resumeUuid,
  version,
  fileName,
  fileBuffer,
  mimeType,
}: {
  userId: string;
  resumeUuid: string;
  version: number;
  fileName: string;
  fileBuffer: Buffer;
  mimeType: string;
}): Promise<UploadResponse> {
  try {
    const safeName = sanitizeFileName(fileName);
    const objectKey = `evalio/resume/${userId}/${resumeUuid}/v${version}/${safeName}`;

    await putObjectToS3({
      key: objectKey,
      body: fileBuffer,
      contentType: mimeType,
    });

    return { key: objectKey };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown upload error";
    console.error("Resume upload error:", message);
    return { error: "Error uploading file" };
  }
}

export function generateResumeUrl(objectKey: string) {
  const url = `https://cdn.krishlabs.tech/${objectKey}`;

  return getSignedUrl({
    url,
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
    privateKey: process.env.CLOUDFRONT_PRIVATE_KEY!,
    dateLessThan: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });
}
