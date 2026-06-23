import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { WebrtcModule } from './modules/webrtc/webrtc.module';
import { ChatModule } from './modules/chat/chat.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, MeetingsModule, WebrtcModule, ChatModule, ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
