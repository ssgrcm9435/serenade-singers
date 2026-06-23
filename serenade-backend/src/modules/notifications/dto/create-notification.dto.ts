import { IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  target?: string;
}
