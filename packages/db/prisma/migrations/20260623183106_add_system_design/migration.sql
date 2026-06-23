-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterEnum
ALTER TYPE "InterviewMode" ADD VALUE 'SYSTEM_DESIGN';

-- AlterTable
ALTER TABLE "InterviewSession" ADD COLUMN     "canvasGraphHistory" JSONB DEFAULT '[]',
ADD COLUMN     "finalDiagram" JSONB,
ADD COLUMN     "systemDesignTopicId" TEXT;

-- CreateTable
CREATE TABLE "system_design_topics" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "prompt" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "system_design_topics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_systemDesignTopicId_fkey" FOREIGN KEY ("systemDesignTopicId") REFERENCES "system_design_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
