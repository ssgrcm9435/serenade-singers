import {
  ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect,
  SubscribeMessage, WebSocketGateway, WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { MeetClaims, verifyMeetToken } from '../meetings/meeting-tokens';
import { MeetingsService } from '../meetings/meetings.service';

type Participant = { socketId: string; fullName: string; role: 'host' | 'member'; participantId?: string };
type Payload = { meetingId: string; [key: string]: unknown };

@WebSocketGateway({
  namespace: '/meetings',
  cors: { origin: (process.env.MEETING_WEB_ORIGIN || 'https://serenade-singers.onrender.com').split(','), credentials: false },
  maxHttpBufferSize: 64 * 1024,
})
export class WebrtcGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Namespace;
  private rooms = new Map<string, Map<string, Participant>>();
  constructor(private readonly meetings: MeetingsService) {}

  private claims(client: Socket): MeetClaims | null {
    return (client.data.claims as MeetClaims | undefined) || null;
  }
  private validRoom(client: Socket, meetingId: string) {
    return typeof meetingId === 'string' && meetingId.length <= 80 && client.rooms.has('meeting:' + meetingId);
  }
  private host(client: Socket, meetingId: string) {
    return this.validRoom(client, meetingId) && this.claims(client)?.role === 'admin';
  }
  private target(client: Socket, meetingId: string, targetSocketId: string) {
    return this.validRoom(client, meetingId) && typeof targetSocketId === 'string' &&
      Boolean(this.server.sockets.get(targetSocketId)?.rooms.has('meeting:' + meetingId));
  }
  private list(meetingId: string) { return Array.from(this.rooms.get(meetingId)?.values() || []); }
  private broadcastParticipants(meetingId: string) {
    this.server.to('meeting:' + meetingId).emit('participants-updated', { participants: this.list(meetingId) });
  }

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.meetingToken;
      const claims = verifyMeetToken(token);
      if (claims.role === 'member') throw new Error('Waiting room required');
      client.data.claims = claims;
    } catch {
      client.emit('meeting-error', { message: 'Your meeting session is invalid or expired. Rejoin with your meeting ID and passcode.' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const meetingId = client.data.joinedMeeting as string | undefined;
    if (!meetingId) return;
    const participants = this.rooms.get(meetingId);
    participants?.delete(client.id);
    if (participants?.size === 0) this.rooms.delete(meetingId);
    this.server.to('meeting:' + meetingId).emit('participant-left', { socketId: client.id, meetingId });
    this.broadcastParticipants(meetingId);
  }

  @SubscribeMessage('join-meeting')
  async joinMeeting(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { meetingId: string; fullName?: string },
  ) {
    const claims = this.claims(client);
    if (!claims || !payload?.meetingId || client.data.joinedMeeting) return;
    const meetingId = payload.meetingId;
    if (claims.role !== 'admin' &&
      (claims.role !== 'admitted' || claims.meetingId !== meetingId || !claims.participantId ||
        !(await this.meetings.canEnter(meetingId, claims.participantId)))) {
      client.emit('meeting-error', { message: 'You have not been admitted to this room.' });
      return;
    }
    const meeting = await this.meetings.findOne(meetingId).catch(() => null);
    if (!meeting || meeting.status === 'ENDED' || meeting.status === 'CANCELLED') {
      client.emit('meeting-error', { message: 'This meeting has ended.' });
      return;
    }
    const fullName = claims.role === 'admin' ? 'Serenade Host' :
      String(payload.fullName || 'Member').trim().slice(0, 80) || 'Member';
    const peers = this.rooms.get(meetingId) || new Map<string, Participant>();
    const existing = Array.from(peers.values());
    const participant: Participant = {
      socketId: client.id, fullName, role: claims.role === 'admin' ? 'host' : 'member',
      participantId: claims.participantId,
    };
    peers.set(client.id, participant);
    this.rooms.set(meetingId, peers);
    client.data.joinedMeeting = meetingId;
    client.data.fullName = fullName;
    client.join('meeting:' + meetingId);
    // Only the newly joined client initiates offers to avoid simultaneous-offer glare.
    client.emit('existing-participants', { meetingId, participants: existing });
    client.to('meeting:' + meetingId).emit('participant-joined', participant);
    this.broadcastParticipants(meetingId);
    try {
      client.emit('meeting-chat-history', { messages: await this.meetings.chatHistory(meetingId) });
    } catch { client.emit('meeting-chat-history', { messages: [] }); }
    return { success: true };
  }

  @SubscribeMessage('leave-meeting')
  leaveMeeting(@ConnectedSocket() client: Socket, @MessageBody() payload: { meetingId: string }) {
    if (!this.validRoom(client, payload?.meetingId)) return;
    client.leave('meeting:' + payload.meetingId);
    this.handleDisconnect(client);
    client.data.joinedMeeting = undefined;
  }

  @SubscribeMessage('webrtc-offer')
  offer(@ConnectedSocket() client: Socket, @MessageBody() p: Payload & { targetSocketId: string; offer: unknown }) {
    if (!this.target(client, p?.meetingId, p?.targetSocketId)) return;
    this.server.to(p.targetSocketId).emit('webrtc-offer', { fromSocketId: client.id, offer: p.offer });
  }

  @SubscribeMessage('webrtc-answer')
  answer(@ConnectedSocket() client: Socket, @MessageBody() p: Payload & { targetSocketId: string; answer: unknown }) {
    if (!this.target(client, p?.meetingId, p?.targetSocketId)) return;
    this.server.to(p.targetSocketId).emit('webrtc-answer', { fromSocketId: client.id, answer: p.answer });
  }

  @SubscribeMessage('ice-candidate')
  ice(@ConnectedSocket() client: Socket, @MessageBody() p: Payload & { targetSocketId: string; candidate: unknown }) {
    if (!this.target(client, p?.meetingId, p?.targetSocketId)) return;
    this.server.to(p.targetSocketId).emit('ice-candidate', { fromSocketId: client.id, candidate: p.candidate });
  }

  @SubscribeMessage('meeting-chat-message')
  async chat(@ConnectedSocket() client: Socket, @MessageBody() p: { meetingId: string; text: string }) {
    if (!this.validRoom(client, p?.meetingId) || typeof p?.text !== 'string') return;
    const text = p.text.trim().slice(0, 2000);
    if (!text) return;
    if ((client.data.chatLastAt || 0) > Date.now() - 700) {
      client.emit('meeting-error', { message: 'Please wait before sending another message.' }); return;
    }
    client.data.chatLastAt = Date.now();
    const msg = await this.meetings.saveChatMessage(p.meetingId, client.data.fullName || 'Member', text);
    this.server.to('meeting:' + p.meetingId).emit('meeting-chat-message', msg);
  }

  @SubscribeMessage('raise-hand')
  hand(@ConnectedSocket() client: Socket, @MessageBody() p: { meetingId: string; raised: boolean }) {
    if (!this.validRoom(client, p?.meetingId)) return;
    this.server.to('meeting:' + p.meetingId).emit('hand-raised', {
      socketId: client.id, fullName: client.data.fullName, raised: Boolean(p.raised),
    });
  }

  @SubscribeMessage('host-mute-all')
  muteAll(@ConnectedSocket() client: Socket, @MessageBody() p: { meetingId: string }) {
    if (!this.host(client, p?.meetingId)) return;
    client.to('meeting:' + p.meetingId).emit('host-mute-all');
  }

  @SubscribeMessage('host-remove-participant')
  async remove(@ConnectedSocket() client: Socket, @MessageBody() p: { meetingId: string; socketId: string }) {
    if (!this.host(client, p?.meetingId) || !this.target(client, p.meetingId, p.socketId)) return;
    const target = this.server.sockets.get(p.socketId);
    const claims = target && this.claims(target);
    if (!target || !claims || claims.role === 'admin') return;
    if (claims.participantId) await this.meetings.rejectParticipant(claims.participantId);
    target.emit('host-remove-participant');
    target.disconnect(true);
  }

  @SubscribeMessage('host-end-meeting')
  async end(@ConnectedSocket() client: Socket, @MessageBody() p: { meetingId: string }) {
    if (!this.host(client, p?.meetingId)) return;
    await this.meetings.end(p.meetingId);
    this.server.to('meeting:' + p.meetingId).emit('host-end-meeting');
  }

  @SubscribeMessage('host-lock')
  async lock(@ConnectedSocket() client: Socket, @MessageBody() p: { meetingId: string; locked: boolean }) {
    if (!this.host(client, p?.meetingId)) return;
    await (p.locked ? this.meetings.lockMeeting(p.meetingId) : this.meetings.unlockMeeting(p.meetingId));
    this.server.to('meeting:' + p.meetingId).emit('meeting-locked', { locked: Boolean(p.locked) });
  }
}
