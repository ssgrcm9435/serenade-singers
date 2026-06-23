import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { MeetingsService } from './meetings.service';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  create(@Body() dto: CreateMeetingDto) {
    return this.meetingsService.create(dto);
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
