-- CreateEnum
CREATE TYPE "InterviewStyle" AS ENUM ('SUPPORTIVE', 'PROFESSIONAL', 'CHALLENGING', 'BAR_RAISER');

-- CreateEnum
CREATE TYPE "InterviewDepth" AS ENUM ('STANDARD', 'PROBING', 'CHALLENGE', 'BAR_RAISER');

-- AlterTable
ALTER TABLE "InterviewSession" ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "interviewDepth" "InterviewDepth" NOT NULL DEFAULT 'STANDARD',
ADD COLUMN     "interviewStyle" "InterviewStyle" NOT NULL DEFAULT 'PROFESSIONAL',
ADD COLUMN     "roleTitle" TEXT;
