-- CreateEnum
CREATE TYPE "InterviewMode" AS ENUM ('VOICE', 'DSA');

-- CreateEnum
CREATE TYPE "LeetCodeDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "InterviewSession" ADD COLUMN     "mode" "InterviewMode" NOT NULL DEFAULT 'VOICE';

-- CreateTable
CREATE TABLE "LeetCodeQuestion" (
    "id" TEXT NOT NULL,
    "leetcodeId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "difficulty" "LeetCodeDifficulty" NOT NULL,
    "acceptanceRate" DOUBLE PRECISION NOT NULL,
    "frequency" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "companies" TEXT[],
    "description" TEXT,
    "expectedTopics" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeetCodeQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DsaSession" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "language" TEXT NOT NULL DEFAULT 'python',
    "questions" JSONB NOT NULL,
    "currentIndex" INTEGER NOT NULL DEFAULT 0,
    "timeTaken" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "DsaSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DsaQuestionAttempt" (
    "id" TEXT NOT NULL,
    "dsaSessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "code" TEXT,
    "codeSnapshots" JSONB,
    "currentPhase" TEXT NOT NULL DEFAULT 'understanding',
    "phasesCompleted" TEXT[],
    "score" DOUBLE PRECISION,
    "feedback" TEXT,
    "complexity" TEXT,
    "timeTaken" INTEGER,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "DsaQuestionAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeetCodeQuestion_leetcodeId_key" ON "LeetCodeQuestion"("leetcodeId");

-- CreateIndex
CREATE UNIQUE INDEX "DsaSession_interviewId_key" ON "DsaSession"("interviewId");

-- CreateIndex
CREATE INDEX "DsaSession_userId_idx" ON "DsaSession"("userId");

-- CreateIndex
CREATE INDEX "DsaQuestionAttempt_dsaSessionId_idx" ON "DsaQuestionAttempt"("dsaSessionId");

-- AddForeignKey
ALTER TABLE "DsaSession" ADD CONSTRAINT "DsaSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DsaSession" ADD CONSTRAINT "DsaSession_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "InterviewSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DsaQuestionAttempt" ADD CONSTRAINT "DsaQuestionAttempt_dsaSessionId_fkey" FOREIGN KEY ("dsaSessionId") REFERENCES "DsaSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
