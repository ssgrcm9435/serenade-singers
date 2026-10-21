import { AdminMeetingGuard } from '../auth/guards/admin-meeting.guard';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, AdminMeetingGuard],
  exports: [NotificationsService],
})
export class NotificationsModule {}
