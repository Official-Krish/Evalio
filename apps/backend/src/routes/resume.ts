import { Elysia, t } from "elysia";
import { prisma } from "../lib/prisma";
import { authGuard } from "../middleware/auth";
import { uploadResumeToS3 } from "../lib/s3";
import { parseResume } from "../utils/ResumeParser";

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot).toLowerCase();
}

export const resumeRoutes = new Elysia({ prefix: "/resumes" }).guard(
  {},
  (app) =>
    app
      .use(authGuard)
      .post(
        "/upload",
        async ({ user, body, set }) => {
          const file = body.file;
          if (!file || !file.name) {
            set.status = 400;
            return { error: "No file provided" };
          }

          const ext = getExtension(file.name);
          if (!ALLOWED_EXTENSIONS.includes(ext)) {
            set.status = 400;
            return { error: "Only PDF, DOCX, and TXT files are allowed" };
          }

          if (file.size > MAX_FILE_SIZE) {
            set.status = 400;
            return { error: "File size must be under 10 MB" };
          }

          const buffer = Buffer.from(await file.arrayBuffer());
          const extractedText = await parseResume(buffer, file.name);

          const contentType = file.type || "application/octet-stream";

          const maxVersion = await prisma.resume.findFirst({
            where: { userId: user.id },
            orderBy: { version: "desc" },
            select: { version: true },
          });
          const nextVersion = (maxVersion?.version ?? 0) + 1;

          const result = await uploadResumeToS3({
            userId: user.id,
            version: nextVersion,
            fileName: file.name,
            fileBuffer: buffer,
            mimeType: contentType,
          });

          if ("error" in result) {
            set.status = 500;
            return { error: result.error };
          }

          const resume = await prisma.resume.create({
            data: {
              userId: user.id,
              version: nextVersion,
              originalUrl: result.url,
              extractedText,
            },
          });

          return { resume };
        },
        {
          body: t.Object({
            file: t.File(),
          }),
        },
      )
      .get("/", async ({ user }) => {
        const resumes = await prisma.resume.findMany({
          where: { userId: user.id },
          orderBy: { version: "desc" },
        });
        return { resumes };
      }),
);
