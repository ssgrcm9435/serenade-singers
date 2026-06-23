-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "passcode" TEXT,
ADD COLUMN     "recordingEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "waitingRoom" BOOLEAN NOT NULL DEFAULT true;
