import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateMeetingDto {
  @IsOptional()
  @IsString()
  meetingId?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  hostId?: string;

  @IsDateString()
  startTime: string;

  @IsString()
  roomName: string;
}
