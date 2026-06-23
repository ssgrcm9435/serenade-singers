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

type Participant = {
  socketId: string;
  userId?: string | null;
  fullName: string;
};

const meetingParticipants = new Map<string, Participant[]>();

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
    for (const [meetingId, participants] of meetingParticipants.entries()) {
      const existed = participants.some((p) => p.socketId === client.id);
      if (!existed) continue;

      meetingParticipants.set(
        meetingId,
        participants.filter((p) => p.socketId !== client.id),
      );

      this.server.to(`meeting:${meetingId}`).emit('participant-left', {
        socketId: client.id,
        meetingId,
      });
    }
  }

  @SubscribeMessage('join-meeting')
  handleJoinMeeting(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { meetingId: string; userId?: string; fullName?: string },
  ) {
    const room = `meeting:${payload.meetingId}`;
    const currentParticipants = meetingParticipants.get(payload.meetingId) || [];

    client.join(room);

    client.emit('existing-participants', {
      meetingId: payload.meetingId,
      participants: currentParticipants,
    });

    const participant: Participant = {
      socketId: client.id,
      userId: payload.userId || null,
      fullName: payload.fullName || 'Participant',
    };

    meetingParticipants.set(payload.meetingId, [...currentParticipants, participant]);

    client.to(room).emit('participant-joined', {
      ...participant,
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

    const participants = meetingParticipants.get(payload.meetingId) || [];
    meetingParticipants.set(
      payload.meetingId,
      participants.filter((p) => p.socketId !== client.id),
    );

    client.to(room).emit('participant-left', {
      socketId: client.id,
      meetingId: payload.meetingId,
    });

    return { success: true };
  }

  @SubscribeMessage('webrtc-offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { meetingId: string; offer: unknown; targetSocketId: string },
  ) {
    client.to(payload.targetSocketId).emit('webrtc-offer', {
      fromSocketId: client.id,
      offer: payload.offer,
      meetingId: payload.meetingId,
    });
  }

  @SubscribeMessage('webrtc-answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { meetingId: string; answer: unknown; targetSocketId: string },
  ) {
    client.to(payload.targetSocketId).emit('webrtc-answer', {
      fromSocketId: client.id,
      answer: payload.answer,
      meetingId: payload.meetingId,
    });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { meetingId: string; candidate: unknown; targetSocketId: string },
  ) {
    client.to(payload.targetSocketId).emit('ice-candidate', {
      fromSocketId: client.id,
      candidate: payload.candidate,
      meetingId: payload.meetingId,
    });
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

  @SubscribeMessage('join-host-room')
  handleJoinHostRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { meetingId: string },
  ) {
    client.join(`host:${payload.meetingId}`);

    client.emit('host-room-joined', {
      meetingId: payload.meetingId,
    });
  }

  @SubscribeMessage('waiting-room-request')
  handleWaitingRoomRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      meetingId: string;
      participantId?: string;
      fullName: string;
      memberId?: string;
    },
  ) {
    this.server.to(`host:${payload.meetingId}`).emit('waiting-room-request', {
      socketId: client.id,
      meetingId: payload.meetingId,
      participantId: payload.participantId || null,
      fullName: payload.fullName,
      memberId: payload.memberId || null,
      createdAt: new Date().toISOString(),
    });

    client.emit('waiting-room-status', {
      meetingId: payload.meetingId,
      status: 'PENDING',
      message: 'Waiting for host approval.',
    });
  }

  @SubscribeMessage('waiting-room-approved')
  handleWaitingRoomApproved(
    @MessageBody()
    payload: {
      meetingId: string;
      socketId: string;
    },
  ) {
    this.server.to(payload.socketId).emit('waiting-room-status', {
      meetingId: payload.meetingId,
      status: 'APPROVED',
      message: 'You have been approved to join.',
    });
  }

  @SubscribeMessage('waiting-room-rejected')
  handleWaitingRoomRejected(
    @MessageBody()
    payload: {
      meetingId: string;
      socketId: string;
    },
  ) {
    this.server.to(payload.socketId).emit('waiting-room-status', {
      meetingId: payload.meetingId,
      status: 'REJECTED',
      message: 'Your request to join was rejected.',
    });
  }
}
