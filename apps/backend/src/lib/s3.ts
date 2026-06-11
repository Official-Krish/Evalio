import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

const bucketName = process.env.S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME
const region = process.env.S3_REGION || process.env.AWS_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_KEY
const sessionToken = process.env.AWS_SESSION_TOKEN
const CDN_BASE_URL = process.env.ASSETS_CDN_BASE_URL || process.env.CDN_BASE_URL

if (!bucketName || !region || !CDN_BASE_URL) {
  throw new Error(
    "S3_BUCKET_NAME, S3_REGION, and CDN_BASE_URL must be configured for uploads."
  )
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
})

function keyToCdnUrl(key: string): string {
  return `${CDN_BASE_URL!.replace(/\/$/, "")}/${key}`
}

async function putObjectToS3(input: {
  key: string
  body: Buffer
  contentType: string
}): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
    })
  )
}

type UploadSuccess = {
  url: string
  error?: never
}

type UploadFailure = {
  url?: never
  error: string
}

type UploadResponse = UploadSuccess | UploadFailure

export async function uploadResumeToS3({
  userId,
  version,
  fileName,
  fileBuffer,
  mimeType,
}: {
  userId: string
  version: number
  fileName: string
  fileBuffer: Buffer
  mimeType: string
}): Promise<UploadResponse> {
  try {
    const objectKey = `ai-interviewresumes/${userId}/v${version}/${fileName}`

    await putObjectToS3({
      key: objectKey,
      body: fileBuffer,
      contentType: mimeType,
    })

    return { url: keyToCdnUrl(objectKey) }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown upload error"
    console.error("Resume upload error:", message)
    return { error: "Error uploading file" }
  }
}
