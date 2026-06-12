/*
  Warnings:

  - You are about to drop the `TranscriptEvent` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,version]` on the table `Resume` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `resumeStrengths` to the `InterviewSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resumeWeaknesses` to the `InterviewSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('FREE', 'ADMIN');

-- DropForeignKey
ALTER TABLE "TranscriptEvent" DROP CONSTRAINT "TranscriptEvent_interviewId_fkey";

-- DropForeignKey
ALTER TABLE "TranscriptEvent" DROP CONSTRAINT "TranscriptEvent_turnId_fkey";

-- AlterTable
ALTER TABLE "InterviewSession" ADD COLUMN     "jobDescription" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "resumeId" TEXT;

-- AlterTable
ALTER TABLE "InterviewSummary" ADD COLUMN     "resumeStrengths" JSONB NOT NULL,
ADD COLUMN     "resumeWeaknesses" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'FREE';

-- DropTable
DROP TABLE "TranscriptEvent";

-- DropEnum
DROP TYPE "TranscriptRole";

-- CreateIndex
CREATE INDEX "Resume_userId_idx" ON "Resume"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Resume_userId_version_key" ON "Resume"("userId", "version");

-- AddForeignKey
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;
