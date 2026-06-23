-- CreateTable
CREATE TABLE "WaitingRoomParticipant" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "memberId" TEXT,
    "fullName" TEXT NOT NULL,
    "socketId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaitingRoomParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WaitingRoomParticipant_meetingId_idx" ON "WaitingRoomParticipant"("meetingId");

-- AddForeignKey
ALTER TABLE "WaitingRoomParticipant" ADD CONSTRAINT "WaitingRoomParticipant_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("meetingId") ON DELETE RESTRICT ON UPDATE CASCADE;
