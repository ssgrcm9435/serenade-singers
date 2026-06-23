import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { JoinMeetingDto } from './dto/join-meeting.dto';
import { ApproveWaitingDto, RequestJoinDto } from './dto/waiting-room.dto';
import { MeetingsService } from './meetings.service';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  create(@Body() dto: CreateMeetingDto) {
    return this.meetingsService.create(dto);
  }

  @Post('join')
  join(@Body() dto: JoinMeetingDto) {
    return this.meetingsService.validateJoin(dto.meetingId, dto.passcode);
  }

  @Post('waiting-room/request')
  requestJoin(@Body() dto: RequestJoinDto) {
    return this.meetingsService.requestJoin(
      dto.meetingId,
      dto.fullName,
      dto.memberId,
      dto.socketId,
    );
  }

  @Get(':meetingId/waiting-room')
  waitingRoomList(@Param('meetingId') meetingId: string) {
    return this.meetingsService.waitingRoomList(meetingId);
  }

  @Patch('waiting-room/approve')
  approveParticipant(@Body() dto: ApproveWaitingDto) {
    return this.meetingsService.approveParticipant(dto.participantId);
  }

  @Patch('waiting-room/reject')
  rejectParticipant(@Body() dto: ApproveWaitingDto) {
    return this.meetingsService.rejectParticipant(dto.participantId);
  }

  @Get()
  findAll() {
    return this.meetingsService.findAll();
  }

  @Get(':meetingId')
  findOne(@Param('meetingId') meetingId: string) {
    return this.meetingsService.findOne(meetingId);
  }

  @Patch(':meetingId/start')
  start(@Param('meetingId') meetingId: string) {
    return this.meetingsService.start(meetingId);
  }

  @Patch(':meetingId/end')
  end(@Param('meetingId') meetingId: string) {
    return this.meetingsService.end(meetingId);
  }
}
