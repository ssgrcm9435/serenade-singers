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
import { verifyMeetToken, MeetClaims } from '../meetings/meeting-tokens';
import { MeetingsService } from '../meetings/meetings.service';

type Participant = {
  socketId: string;
  userId?: string | null;
  fullName: string;
};

const meetingParticipants = new Map<string, Participant[]>();

@WebSocketGateway({
  cors: {
    origin: process.env.MEETING_WEB_ORIGIN || 'https://serenade-singers.onrender.com',
    credentials: false,
  },
})
export class WebrtcGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly meetings: MeetingsService) {}

  private claim(client: Socket) {
    return (client.data.meetClaims || null) as MeetClaims | null;
  }
  private inMeeting(client: Socket, meetingId: string) {
    return typeof meetingId === 'string' && meetingId.length < 80 && client.rooms.has('meeting:' + meetingId);
  }
  private isAdmin(client: Socket, meetingId: string) {
    return this.claim(client)?.role === 'admin' && client.rooms.has('host:' + meetingId);
  }
  private canRelay(client: Socket, meetingId: string, targetSocketId: string) {
    const target = this.server.sockets.sockets.get(targetSocketId);
    return this.inMeeting(client, meetingId) && Boolean(target?.rooms.has('meeting:' + meetingId));
  }

  handleConnection(client: Socket) {
    try { client.data.meetClaims = verifyMeetToken(client.handshake.auth?.meetingToken); }
    catch { client.disconnect(true); return; }
    client.emit('connected', {
      socketId: client.id,
      message: 'Connected to Serenade Singers meeting server',
    });
  }

  

  @SubscribeMessage('chat-announcement')
  handleAnnouncement(@ConnectedSocket() client: Socket,
    
    @MessageBody()
    payload: {
      meetingId: string;
      message: string;
    },
  ) {
    if (!this.isAdmin(client, payload.meetingId)) return;
    this.server.to(`meeting:${payload.meetingId}`).emit(
      'chat-announcement',
      {
        message: payload.message,
        createdAt: new Date(),
      },
    );
  }

  @SubscribeMessage('chat-delete')
  handleDeleteMessage(@ConnectedSocket() client: Socket,
    
    @MessageBody()
    payload: {
      meetingId: string;
      messageId: string;
    },
  ) {
    if (!this.isAdmin(client, payload.meetingId)) return;
    this.server.to(`meeting:${payload.meetingId}`).emit(
      'chat-delete',
      payload,
    );
  }


  handleDisconnect(client: Socket) {
    for (const [meetingId, participants] of meetingParticipants.entries()) {
      if (!participants.some((p) => p.socketId === client.id)) continue;

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
  async handleJoinMeeting(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { meetingId: string; userId?: string; fullName?: string },
  ) {
    const claims = this.claim(client);
    if (!claims || claims.role !== 'admitted' || claims.meetingId !== payload.meetingId || !claims.participantId) return;
    if (!(await this.meetings.canEnter(payload.meetingId, claims.participantId))) return;
    if (this.inMeeting(client, payload.meetingId)) return;
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
    if (!this.inMeeting(client, payload.meetingId)) return;
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
    if (!this.canRelay(client, payload.meetingId, payload.targetSocketId)) return;
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
    if (!this.canRelay(client, payload.meetingId, payload.targetSocketId)) return;
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
    if (!this.canRelay(client, payload.meetingId, payload.targetSocketId)) return;
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
    if (!this.inMeeting(client, payload.meetingId)) return;
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
    if (!this.inMeeting(client, payload.meetingId)) return;
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
    if (!this.inMeeting(client, payload.meetingId)) return;
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
    if (!this.inMeeting(client, payload.meetingId)) return;
    this.server.to(`meeting:${payload.meetingId}`).emit('hand-raised', {
      socketId: client.id,
      fullName: payload.fullName || 'Participant',
      meetingId: payload.meetingId,
    });
  }

  @SubscribeMessage('host-announcement')
  handleHostAnnouncement(@ConnectedSocket() client: Socket,
    
    @MessageBody() payload: { meetingId: string; message: string },
  ) {
    if (!this.isAdmin(client, payload.meetingId)) return;
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
    if (this.claim(client)?.role !== 'admin') return;
    client.join(`host:${payload.meetingId}`);
    client.emit('host-room-joined', { meetingId: payload.meetingId });
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
    if (this.claim(client)?.role !== 'admitted' || this.claim(client)?.meetingId !== payload.meetingId) return;
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
  handleWaitingRoomApproved(@ConnectedSocket() client: Socket,
    
    @MessageBody() payload: { meetingId: string; socketId: string },
  ) {
    if (!this.isAdmin(client, payload.meetingId)) return;
    this.server.to(payload.socketId).emit('waiting-room-status', {
      meetingId: payload.meetingId,
      status: 'APPROVED',
      message: 'You have been approved to join.',
    });
  }

  @SubscribeMessage('waiting-room-rejected')
  handleWaitingRoomRejected(@ConnectedSocket() client: Socket,
    
    @MessageBody() payload: { meetingId: string; socketId: string },
  ) {
    if (!this.isAdmin(client, payload.meetingId)) return;
    this.server.to(payload.socketId).emit('waiting-room-status', {
      meetingId: payload.meetingId,
      status: 'REJECTED',
      message: 'Your request to join was rejected.',
    });
  }

  @SubscribeMessage('host-mute-all')
  handleHostMuteAll(@ConnectedSocket() client: Socket,
    @MessageBody() payload: { meetingId: string }) {
    this.server.to(`meeting:${payload.meetingId}`).emit('host-mute-all', {
      meetingId: payload.meetingId,
      createdAt: new Date().toISOString(),
    });
  }

  @SubscribeMessage('host-end-meeting')
  handleHostEndMeeting(@ConnectedSocket() client: Socket,
    @MessageBody() payload: { meetingId: string }) {
    this.server.to(`meeting:${payload.meetingId}`).emit('host-end-meeting', {
      meetingId: payload.meetingId,
      message: 'The host ended this meeting.',
      createdAt: new Date().toISOString(),
    });
  }

  @SubscribeMessage('host-remove-participant')
  handleHostRemoveParticipant(@ConnectedSocket() client: Socket,
    
    @MessageBody() payload: { meetingId: string; socketId: string },
  ) {
    if (!this.isAdmin(client, payload.meetingId)) return;
    if (!this.isAdmin(client, payload.meetingId)) return;
    if (!this.isAdmin(client, payload.meetingId)) return;
    this.server.to(payload.socketId).emit('host-remove-participant', {
      meetingId: payload.meetingId,
      message: 'You have been removed from the meeting.',
    });
  }
}
