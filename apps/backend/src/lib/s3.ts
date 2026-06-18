import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

const bucketName = Bun.env.S3_BUCKET_NAME || Bun.env.AWS_BUCKET_NAME;
const region = Bun.env.S3_REGION || Bun.env.AWS_REGION;
const accessKeyId = Bun.env.AWS_ACCESS_KEY_ID || Bun.env.AWS_ACCESS_KEY;
const secretAccessKey = Bun.env.AWS_SECRET_ACCESS_KEY || Bun.env.AWS_SECRET_KEY;
const sessionToken = Bun.env.AWS_SESSION_TOKEN;
const CDN_BASE_URL = Bun.env.ASSETS_CDN_BASE_URL || Bun.env.CDN_BASE_URL;

if (!bucketName || !region || !CDN_BASE_URL) {
  throw new Error(
    "S3_BUCKET_NAME, S3_REGION, and CDN_BASE_URL must be configured for uploads.",
  );
}

if (!Bun.env.CLOUDFRONT_KEY_PAIR_ID || !Bun.env.CLOUDFRONT_PRIVATE_KEY) {
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
  try {
    const url = `https://cdn.krishlabs.tech/${objectKey}`;

    let privateKey = Bun.env.CLOUDFRONT_PRIVATE_KEY!;
    if (privateKey.includes("\\n")) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }
    privateKey = privateKey.replace(/\r/g, "");

    return getSignedUrl({
      url,
      keyPairId: Bun.env.CLOUDFRONT_KEY_PAIR_ID!,
      privateKey,
      dateLessThan: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown URL generation error";
    console.error("Resume URL generation error:", message);
    return null;
  }
}
