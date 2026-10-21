import { AdminMeetingGuard } from '../auth/guards/admin-meeting.guard';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ChatController } from './chat.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ChatController],
  providers: [AdminMeetingGuard],
})
export class ChatModule {}
