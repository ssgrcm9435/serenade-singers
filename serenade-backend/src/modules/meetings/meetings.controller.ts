import { Body, Controller, Get, Param, Patch, Post, Req, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { JoinMeetingDto } from './dto/join-meeting.dto';
import { ApproveWaitingDto, RequestJoinDto } from './dto/waiting-room.dto';
import { MeetingsService } from './meetings.service';
import { MeetClaims, verifyMeetToken } from './meeting-tokens';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meeting: MeetingsService) {}

  private claims(req: { headers: Record<string, string | undefined> }): MeetClaims {
    const header = req.headers.authorization || '';
    return verifyMeetToken(header.startsWith('Bearer ') ? header.slice(7) : undefined);
  }
  private admin(req: { headers: Record<string, string | undefined> }) {
    if (this.claims(req).role !== 'admin') throw new ForbiddenException('Administrator access required');
  }
  private participant(req: { headers: Record<string, string | undefined> }, meetingId: string, role: MeetClaims['role']) {
    const claims = this.claims(req);
    if (claims.role !== role || claims.meetingId !== meetingId) throw new UnauthorizedException('Invalid meeting session');
    return claims;
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateMeetingDto) {
    this.admin(req);
    return this.meeting.create(dto);
  }

  @Get()
  findAll(@Req() req: any) {
    this.admin(req);
    return this.meeting.findAll();
  }

  @Post('join')
  join(@Body() dto: JoinMeetingDto) {
    return this.meeting.validateJoin(dto.meetingId.trim().toUpperCase(), dto.passcode);
  }

  @Post('waiting-room/request')
  requestJoin(@Req() req: any, @Body() dto: RequestJoinDto) {
    this.participant(req, dto.meetingId, 'member');
    return this.meeting.requestJoin(dto.meetingId, dto.fullName, dto.memberId);
  }

  @Get(':meetingId/waiting-room/status')
  waitingRoomStatus(@Req() req: any, @Param('meetingId') meetingId: string) {
    const claims = this.participant(req, meetingId, 'admitted');
    if (!claims.participantId) throw new UnauthorizedException('Missing participant');
    return this.meeting.ownStatus(meetingId, claims.participantId);
  }

  @Get(':meetingId/waiting-room')
  waitingRoomList(@Req() req: any, @Param('meetingId') meetingId: string) {
    this.admin(req);
    return this.meeting.waitingRoomList(meetingId);
  }

  @Patch('waiting-room/approve')
  approveParticipant(@Req() req: any, @Body() dto: ApproveWaitingDto) {
    this.admin(req);
    return this.meeting.approveParticipant(dto.participantId);
  }

  @Patch('waiting-room/reject')
  rejectParticipant(@Req() req: any, @Body() dto: ApproveWaitingDto) {
    this.admin(req);
    return this.meeting.rejectParticipant(dto.participantId);
  }

  @Get(':meetingId/history')
  history(@Req() req: any, @Param('meetingId') meetingId: string) {
    this.admin(req);
    return this.meeting.meetingHistory(meetingId);
  }

  @Get(':meetingId/analytics')
  analytics(@Req() req: any, @Param('meetingId') meetingId: string) {
    this.admin(req);
    return this.meeting.meetingAnalytics(meetingId);
  }

  @Get(':meetingId')
  findOne(@Req() req: any, @Param('meetingId') meetingId: string) {
    this.admin(req);
    return this.meeting.findOne(meetingId);
  }

  @Post(':meetingId/join-log')
  recordJoin(@Req() req: any, @Param('meetingId') meetingId: string) {
    const claims = this.claims(req);
    if (claims.role !== 'admin' && (claims.role !== 'admitted' || claims.meetingId !== meetingId)) throw new ForbiddenException();
    return this.meeting.recordEvent(meetingId, 'PARTICIPANT_JOINED');
  }

  @Post(':meetingId/leave-log')
  recordLeave(@Req() req: any, @Param('meetingId') meetingId: string) {
    const claims = this.claims(req);
    if (claims.role !== 'admin' && (claims.role !== 'admitted' || claims.meetingId !== meetingId)) throw new ForbiddenException();
    return this.meeting.recordEvent(meetingId, 'PARTICIPANT_LEFT');
  }

  @Patch(':meetingId/lock')
  lock(@Req() req: any, @Param('meetingId') meetingId: string) {
    this.admin(req);
    return this.meeting.lockMeeting(meetingId);
  }
  @Patch(':meetingId/unlock')
  unlock(@Req() req: any, @Param('meetingId') meetingId: string) {
    this.admin(req);
    return this.meeting.unlockMeeting(meetingId);
  }
  @Patch(':meetingId/start')
  start(@Req() req: any, @Param('meetingId') meetingId: string) {
    this.admin(req);
    return this.meeting.start(meetingId);
  }
  @Patch(':meetingId/end')
  end(@Req() req: any, @Param('meetingId') meetingId: string) {
    this.admin(req);
    return this.meeting.end(meetingId);
  }
}
