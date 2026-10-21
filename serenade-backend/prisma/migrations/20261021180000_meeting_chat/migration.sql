CREATE TABLE "MeetingChatMessage" (
  "id" TEXT NOT NULL,
  "meetingId" TEXT NOT NULL,
  "senderName" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MeetingChatMessage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MeetingChatMessage_meetingId_createdAt_idx" ON "MeetingChatMessage"("meetingId", "createdAt");
ALTER TABLE "MeetingChatMessage" ADD CONSTRAINT "MeetingChatMessage_meetingId_fkey"
  FOREIGN KEY ("meetingId") REFERENCES "Meeting"("meetingId") ON DELETE CASCADE ON UPDATE CASCADE;
