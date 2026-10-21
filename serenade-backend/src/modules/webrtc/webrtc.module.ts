import { Module } from '@nestjs/common';
import { WebrtcGateway } from './webrtc.gateway';
import { MeetingsModule } from '../meetings/meetings.module';

@Module({
  imports: [MeetingsModule],
  providers: [WebrtcGateway],
})
export class WebrtcModule {}
