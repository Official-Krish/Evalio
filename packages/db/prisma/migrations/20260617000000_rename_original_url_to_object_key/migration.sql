-- Rename originalUrl to objectKey in Resume table
ALTER TABLE "Resume" RENAME COLUMN "originalUrl" TO "objectKey";
