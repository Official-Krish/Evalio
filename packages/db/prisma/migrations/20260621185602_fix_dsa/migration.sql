/*
  Warnings:

  - You are about to drop the column `questions` on the `DsaSession` table. All the data in the column will be lost.
  - You are about to drop the `DsaQuestionAttempt` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DsaQuestionAttempt" DROP CONSTRAINT "DsaQuestionAttempt_dsaSessionId_fkey";

-- AlterTable
ALTER TABLE "DsaSession" DROP COLUMN "questions";

-- DropTable
DROP TABLE "DsaQuestionAttempt";

-- CreateTable
CREATE TABLE "DsaProblem" (
    "id" TEXT NOT NULL,
    "dsaSessionId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "code" TEXT,
    "codeSnapshots" JSONB,
    "currentPhase" TEXT NOT NULL DEFAULT 'understanding',
    "phasesCompleted" TEXT[],
    "score" DOUBLE PRECISION,
    "feedback" TEXT,
    "complexity" TEXT,
    "timeTaken" INTEGER,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DsaProblem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DsaProblem_dsaSessionId_idx" ON "DsaProblem"("dsaSessionId");

-- AddForeignKey
ALTER TABLE "DsaProblem" ADD CONSTRAINT "DsaProblem_dsaSessionId_fkey" FOREIGN KEY ("dsaSessionId") REFERENCES "DsaSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
