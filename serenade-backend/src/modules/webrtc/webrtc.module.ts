import { Module } from '@nestjs/common';
import { WebrtcGateway } from './webrtc.gateway';
import { PresenceGateway } from './presence.gateway';

@Module({
  providers: [WebrtcGateway, PresenceGateway],
})
export class WebrtcModule {}
