import { IsOptional, IsString } from 'class-validator';

export class RequestJoinDto {
  @IsString()
  meetingId: string;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  memberId?: string;

  @IsOptional()
  @IsString()
  socketId?: string;
}

export class ApproveWaitingDto {
  @IsString()
  participantId: string;
}
