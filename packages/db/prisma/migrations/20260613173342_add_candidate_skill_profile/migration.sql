-- CreateTable
CREATE TABLE "CandidateSkillProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "communication" JSONB NOT NULL DEFAULT '[]',
    "technicalDepth" JSONB NOT NULL DEFAULT '[]',
    "problemSolving" JSONB NOT NULL DEFAULT '[]',
    "leadership" JSONB NOT NULL DEFAULT '[]',
    "commonPatterns" JSONB NOT NULL DEFAULT '[]',
    "mostImprovedSkill" TEXT,
    "weakestSkill" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateSkillProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CandidateSkillProfile_userId_key" ON "CandidateSkillProfile"("userId");

-- AddForeignKey
ALTER TABLE "CandidateSkillProfile" ADD CONSTRAINT "CandidateSkillProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
