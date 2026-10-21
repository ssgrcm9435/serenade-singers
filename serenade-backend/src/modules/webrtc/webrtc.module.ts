import { Module } from '@nestjs/common';
import { WebrtcGateway } from './webrtc.gateway';
import { PresenceGateway } from './presence.gateway';
import { MeetingsModule } from '../meetings/meetings.module';

@Module({
  imports: [MeetingsModule],
  providers: [WebrtcGateway, PresenceGateway],
})
export class WebrtcModule {}
