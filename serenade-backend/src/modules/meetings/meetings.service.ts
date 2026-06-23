import { generateMeetingId, generatePasscode } from './utils/meeting-code';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';

@Injectable()
export class MeetingsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateMeetingDto) {
    return this.prisma.meeting.create({
      data: {
        meetingId: dto.meetingId || generateMeetingId(),
        title: dto.title,
        description: dto.description,
        hostId: dto.hostId,
        startTime: new Date(dto.startTime),
        roomName: dto.roomName,
      passcode: generatePasscode(),
      },
    });
  }

  findAll() {
    return this.prisma.meeting.findMany({
      orderBy: { startTime: 'asc' },
      include: { participants: true },
    });
  }

  async requestJoin(meetingId: string, fullName: string, memberId?: string, socketId?: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { meetingId },
    });

    if (!meeting) throw new NotFoundException('Meeting not found');

    return this.prisma.waitingRoomParticipant.create({
      data: {
        meetingId,
        fullName,
        memberId,
        socketId,
        status: meeting.waitingRoom ? 'PENDING' : 'APPROVED',
      },
    });
  }

  waitingRoomList(meetingId: string) {
    return this.prisma.waitingRoomParticipant.findMany({
      where: { meetingId },
      orderBy: { createdAt: 'asc' },
    });
  }

  approveParticipant(participantId: string) {
    return this.prisma.waitingRoomParticipant.update({
      where: { id: participantId },
      data: { status: 'APPROVED' },
    });
  }

  rejectParticipant(participantId: string) {
    return this.prisma.waitingRoomParticipant.update({
      where: { id: participantId },
      data: { status: 'REJECTED' },
    });
  }

  async validateJoin(meetingId: string, passcode: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { meetingId },
    });

    if (!meeting) throw new NotFoundException('Meeting not found');

    if (meeting.passcode && meeting.passcode !== passcode) {
      throw new UnauthorizedException('Invalid meeting passcode');
    }

    return {
      success: true,
      meetingId: meeting.meetingId,
      roomName: meeting.roomName,
      status: meeting.status,
      waitingRoom: meeting.waitingRoom,
      joinUrl: `/meeting/${meeting.meetingId}`,
    };
  }

  async findOne(meetingId: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { meetingId },
      include: { participants: true, callLogs: true },
    });

    if (!meeting) throw new NotFoundException('Meeting not found');
    return meeting;
  }

  async start(meetingId: string) {
    const meeting = await this.prisma.meeting.update({
      where: { meetingId },
      data: { status: 'LIVE' },
    });

    await this.prisma.callLog.create({
      data: {
        meetingId: meeting.id,
        action: 'MEETING_STARTED',
      },
    });

    return meeting;
  }

  lockMeeting(meetingId: string) {
    return this.prisma.meeting.update({
      where: { meetingId },
      data: { locked: true },
    });
  }

  unlockMeeting(meetingId: string) {
    return this.prisma.meeting.update({
      where: { meetingId },
      data: { locked: false },
    });
  }

  async end(meetingId: string) {
    const meeting = await this.prisma.meeting.update({
      where: { meetingId },
      data: { status: 'ENDED' },
    });

    await this.prisma.callLog.create({
      data: {
        meetingId: meeting.id,
        action: 'MEETING_ENDED',
      },
    });

    return meeting;
  }
}
