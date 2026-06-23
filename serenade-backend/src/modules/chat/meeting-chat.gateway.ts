import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class MeetingChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-meeting-chat')
  joinMeetingChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { meetingId: string; fullName?: string },
  ) {
    const room = `meeting-chat:${payload.meetingId}`;
    client.join(room);

    client.emit('meeting-chat-joined', {
      meetingId: payload.meetingId,
      room,
    });

    client.to(room).emit('meeting-chat-system', {
      message: `${payload.fullName || 'A participant'} joined the meeting chat.`,
    });
  }

  @SubscribeMessage('meeting-chat-message')
  sendMeetingChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      meetingId: string;
      senderName: string;
      message: string;
    },
  ) {
    const room = `meeting-chat:${payload.meetingId}`;

    const chatMessage = {
      socketId: client.id,
      meetingId: payload.meetingId,
      senderName: payload.senderName || 'Participant',
      message: payload.message,
      createdAt: new Date().toISOString(),
    };

    this.server.to(room).emit('meeting-chat-message', chatMessage);

    return chatMessage;
  }
}
