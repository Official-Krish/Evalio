-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationOtp" TEXT,
ADD COLUMN     "verificationOtpExpiry" TIMESTAMP(3);
