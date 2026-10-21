import { AdminMeetingGuard } from '../auth/guards/admin-meeting.guard';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, AdminMeetingGuard],
  exports: [UsersService],
})
export class UsersModule {}
