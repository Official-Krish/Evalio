-- AlterTable
ALTER TABLE "CandidateSkillProfile" ADD COLUMN     "failurePatterns" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "patternSignals" JSONB NOT NULL DEFAULT '[]';
