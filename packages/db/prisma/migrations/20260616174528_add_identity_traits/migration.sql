-- AlterTable
ALTER TABLE "CandidateSkillProfile" ADD COLUMN     "identityTraits" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "traitHistory" JSONB NOT NULL DEFAULT '[]';
