-- DropForeignKey
ALTER TABLE "InterviewSession" DROP CONSTRAINT IF EXISTS "InterviewSession_systemDesignTopicId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewSession" DROP CONSTRAINT IF EXISTS "InterviewSession_systemDesignTopicId_fkey";

-- AlterTable
ALTER TABLE "InterviewSession" DROP COLUMN IF EXISTS "systemDesignTopicId";

-- DropTable
DROP TABLE IF EXISTS "system_design_topics";

-- DropEnum
DROP TYPE IF EXISTS "Difficulty";
