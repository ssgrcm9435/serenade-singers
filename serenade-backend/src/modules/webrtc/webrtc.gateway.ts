import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type JoinRoomPayload = {
  meetingId: string;
  userId?: string;
  fullName?: string;
};

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class WebrtcGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    client.emit('connected', {
      socketId: client.id,
      message: 'Connected to Serenade Singers meeting server',
    });
  }

  handleDisconnect(client: Socket) {
    this.server.emit('participant-left', {
      socketId: client.id,
    });
  }

  @SubscribeMessage('join-meeting')
  handleJoinMeeting(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    const room = `meeting:${payload.meetingId}`;
    client.join(room);

    client.to(room).emit('participant-joined', {
      socketId: client.id,
      userId: payload.userId || null,
      fullName: payload.fullName || 'Participant',
      meetingId: payload.meetingId,
    });

    client.emit('joined-meeting', {
      socketId: client.id,
      meetingId: payload.meetingId,
      room,
    });
  }

  @SubscribeMessage('leave-meeting')
  handleLeaveMeeting(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { meetingId: string },
  ) {
    const room = `meeting:${payload.meetingId}`;
    client.leave(room);

    client.to(room).emit('participant-left', {
      socketId: client.id,
      meetingId: payload.meetingId,
    });

    return { success: true };
  }

  @SubscribeMessage('webrtc-offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { meetingId: string; offer: unknown; targetSocketId?: string },
  ) {
    const room = `meeting:${payload.meetingId}`;

    if (payload.targetSocketId) {
      client.to(payload.targetSocketId).emit('webrtc-offer', {
        fromSocketId: client.id,
        offer: payload.offer,
      });
      return;
    }

    client.to(room).emit('webrtc-offer', {
      fromSocketId: client.id,
      offer: payload.offer,
    });
  }

  @SubscribeMessage('webrtc-answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { answer: unknown; targetSocketId: string },
  ) {
    client.to(payload.targetSocketId).emit('webrtc-answer', {
      fromSocketId: client.id,
      answer: payload.answer,
    });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { candidate: unknown; targetSocketId?: string; meetingId?: string },
  ) {
    if (payload.targetSocketId) {
      client.to(payload.targetSocketId).emit('ice-candidate', {
        fromSocketId: client.id,
        candidate: payload.candidate,
      });
      return;
    }

    if (payload.meetingId) {
      client.to(`meeting:${payload.meetingId}`).emit('ice-candidate', {
        fromSocketId: client.id,
        candidate: payload.candidate,
      });
    }
  }

  @SubscribeMessage('toggle-media')
  handleToggleMedia(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { meetingId: string; audio?: boolean; video?: boolean },
  ) {
    client.to(`meeting:${payload.meetingId}`).emit('participant-media-updated', {
      socketId: client.id,
      audio: payload.audio,
      video: payload.video,
    });
  }

  @SubscribeMessage('screen-share-started')
  handleScreenShareStarted(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { meetingId: string },
  ) {
    client.to(`meeting:${payload.meetingId}`).emit('screen-share-started', {
      socketId: client.id,
      meetingId: payload.meetingId,
    });
  }

  @SubscribeMessage('screen-share-stopped')
  handleScreenShareStopped(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { meetingId: string },
  ) {
    client.to(`meeting:${payload.meetingId}`).emit('screen-share-stopped', {
      socketId: client.id,
      meetingId: payload.meetingId,
    });
  }

  @SubscribeMessage('raise-hand')
  handleRaiseHand(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { meetingId: string; fullName?: string },
  ) {
    this.server.to(`meeting:${payload.meetingId}`).emit('hand-raised', {
      socketId: client.id,
      fullName: payload.fullName || 'Participant',
      meetingId: payload.meetingId,
    });
  }

  @SubscribeMessage('host-announcement')
  handleHostAnnouncement(
    @MessageBody() payload: { meetingId: string; message: string },
  ) {
    this.server.to(`meeting:${payload.meetingId}`).emit('host-announcement', {
      meetingId: payload.meetingId,
      message: payload.message,
      createdAt: new Date().toISOString(),
    });
  }
}
