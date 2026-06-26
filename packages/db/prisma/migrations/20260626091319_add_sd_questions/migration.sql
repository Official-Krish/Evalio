-- CreateTable
CREATE TABLE "SystemDesignQuestion" (
    "id" TEXT NOT NULL,
    "companyName" TEXT,
    "position" TEXT,
    "interviewDepth" "InterviewDepth" NOT NULL,
    "interviewStyle" "InterviewStyle" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fullBreakdown" TEXT NOT NULL,
    "backupTitle" TEXT,
    "backupDescription" TEXT,
    "backupFullBreakdown" TEXT,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemDesignQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SdQuestionSeenByUser" (
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interviewId" TEXT NOT NULL,

    CONSTRAINT "SdQuestionSeenByUser_pkey" PRIMARY KEY ("userId","questionId")
);

-- CreateIndex
CREATE INDEX "SystemDesignQuestion_companyName_position_idx" ON "SystemDesignQuestion"("companyName", "position");

-- CreateIndex
CREATE INDEX "SdQuestionSeenByUser_userId_idx" ON "SdQuestionSeenByUser"("userId");

-- AddForeignKey
ALTER TABLE "SdQuestionSeenByUser" ADD CONSTRAINT "SdQuestionSeenByUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SdQuestionSeenByUser" ADD CONSTRAINT "SdQuestionSeenByUser_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "SystemDesignQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
