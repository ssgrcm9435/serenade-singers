import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { generateMeetingId, generatePasscode } from './utils/meeting-code';
import { compare, hash } from 'bcrypt';
import { signMeetToken } from './meeting-tokens';

const safeMeeting = {
  id: true, meetingId: true, title: true, description: true,
  startTime: true, status: true, waitingRoom: true, locked: true, createdAt: true,
} as const;

@Injectable()
export class MeetingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMeetingDto) {
    if (!dto.title?.trim() || dto.title.length > 140) throw new BadRequestException('A meeting title is required (max 140 characters).');
    const startTime = new Date(dto.startTime);
    if (!Number.isFinite(startTime.getTime())) throw new BadRequestException('Invalid start time');
    const passcode = generatePasscode();
    const meeting = await this.prisma.meeting.create({
      data: {
        meetingId: generateMeetingId(),
        title: dto.title.trim(),
        description: dto.description?.slice(0, 500) || null,
        startTime,
        roomName: 'serenade-' + Date.now() + '-' + generateMeetingId(),
        passcode: await hash(passcode, 12),
        waitingRoom: true,
      },
      select: safeMeeting,
    });
    return { ...meeting, passcode, joinUrl: '/meeting?meetingId=' + meeting.meetingId };
  }

  findAll() {
    return this.prisma.meeting.findMany({ select: safeMeeting, orderBy: { startTime: 'desc' }, take: 100 });
  }

  async findOne(meetingId: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { meetingId }, select: safeMeeting });
    if (!meeting) throw new NotFoundException('Meeting not found');
    return meeting;
  }

  async validateJoin(meetingId: string, passcode: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { meetingId } });
    if (!meeting) throw new UnauthorizedException('Invalid meeting ID or passcode');
    if (meeting.status === 'ENDED' || meeting.status === 'CANCELLED') throw new ForbiddenException('Meeting is closed');
    if (meeting.locked) throw new ForbiddenException('The host locked this meeting');
    const saved = meeting.passcode || '';
    const valid = saved.startsWith('$2') ? await compare(passcode || '', saved) : saved === passcode;
    if (!valid || !saved) throw new UnauthorizedException('Invalid meeting ID or passcode');
    return {
      success: true,
      meetingId: meeting.meetingId,
      title: meeting.title,
      accessToken: signMeetToken('member', meeting.meetingId, undefined, 2 * 3600),
      waitingRoom: meeting.waitingRoom,
    };
  }

  async requestJoin(meetingId: string, fullName: string, memberId?: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { meetingId } });
    if (!meeting) throw new NotFoundException('Meeting not found');
    if (meeting.locked || meeting.status === 'ENDED' || meeting.status === 'CANCELLED') throw new ForbiddenException('Meeting unavailable');
    const name = (fullName || '').trim();
    if (name.length < 2 || name.length > 80) throw new BadRequestException('Enter your name (2–80 characters).');
    const participant = await this.prisma.waitingRoomParticipant.create({
      data: { meetingId, fullName: name, memberId: memberId?.slice(0, 100), status: meeting.waitingRoom ? 'PENDING' : 'APPROVED' },
    });
    return {
      id: participant.id, status: participant.status,
      accessToken: signMeetToken('admitted', meetingId, participant.id, 4 * 3600),
    };
  }

  async ownStatus(meetingId: string, participantId: string) {
    const participant = await this.prisma.waitingRoomParticipant.findUnique({ where: { id: participantId } });
    if (!participant || participant.meetingId !== meetingId) throw new NotFoundException('Request not found');
    const meeting = await this.prisma.meeting.findUnique({ where: { meetingId } });
    if (!meeting || meeting.status === 'ENDED' || meeting.status === 'CANCELLED') return { status: 'ENDED' };
    return { status: participant.status };
  }

  async canEnter(meetingId: string, participantId: string) {
    const state = await this.ownStatus(meetingId, participantId);
    return state.status === 'APPROVED';
  }

  waitingRoomList(meetingId: string) {
    return this.prisma.waitingRoomParticipant.findMany({ where: { meetingId }, orderBy: { createdAt: 'asc' }, take: 200 });
  }

  approveParticipant(participantId: string) {
    return this.prisma.waitingRoomParticipant.update({ where: { id: participantId }, data: { status: 'APPROVED' } });
  }

  rejectParticipant(participantId: string) {
    return this.prisma.waitingRoomParticipant.update({ where: { id: participantId }, data: { status: 'REJECTED' } });
  }

  async recordEvent(meetingId: string, action: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { meetingId }, select: { id: true } });
    if (!meeting) throw new NotFoundException('Meeting not found');
    return this.prisma.callLog.create({ data: { meetingId: meeting.id, action } });
  }

  async meetingAnalytics(meetingId: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { meetingId }, select: { id: true } });
    if (!meeting) throw new NotFoundException('Meeting not found');
    const logs = await this.prisma.callLog.findMany({ where: { meetingId: meeting.id } });
    return {
      meetingId,
      totalJoinEvents: logs.filter(l => l.action === 'PARTICIPANT_JOINED').length,
      totalLeaveEvents: logs.filter(l => l.action === 'PARTICIPANT_LEFT').length,
      totalLogs: logs.length,
    };
  }

  async meetingHistory(meetingId: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { meetingId }, select: { id: true } });
    if (!meeting) throw new NotFoundException('Meeting not found');
    return this.prisma.callLog.findMany({ where: { meetingId: meeting.id }, orderBy: { createdAt: 'desc' }, take: 50 });
  }

  async chatHistory(meetingId: string) {
    return (await this.prisma.meetingChatMessage.findMany({
      where: { meetingId }, orderBy: { createdAt: 'desc' }, take: 100,
      select: { id: true, senderName: true, content: true, createdAt: true },
    })).reverse();
  }

  async saveChatMessage(meetingId: string, senderName: string, content: string) {
    return this.prisma.meetingChatMessage.create({
      data: { meetingId, senderName: senderName.slice(0, 80), content },
      select: { id: true, senderName: true, content: true, createdAt: true },
    });
  }

  start(meetingId: string) {
    return this.prisma.meeting.update({ where: { meetingId }, data: { status: 'LIVE' }, select: safeMeeting });
  }
  end(meetingId: string) {
    return this.prisma.meeting.update({ where: { meetingId }, data: { status: 'ENDED' }, select: safeMeeting });
  }
  lockMeeting(meetingId: string) {
    return this.prisma.meeting.update({ where: { meetingId }, data: { locked: true }, select: safeMeeting });
  }
  unlockMeeting(meetingId: string) {
    return this.prisma.meeting.update({ where: { meetingId }, data: { locked: false }, select: safeMeeting });
  }
}
