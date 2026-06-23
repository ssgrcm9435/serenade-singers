import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private prisma: PrismaService) {}

  @SubscribeMessage('join-chat-room')
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    client.join(payload.roomId);

    client.emit('chat-room-joined', {
      roomId: payload.roomId,
    });
  }

  @SubscribeMessage('send-message')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId: string;
      senderId: string;
      content: string;
    },
  ) {
    const message = await this.prisma.message.create({
      data: {
        roomId: payload.roomId,
        senderId: payload.senderId,
        content: payload.content,
      },
    });

    this.server.to(payload.roomId).emit('new-message', message);

    return message;
  }

  @SubscribeMessage('typing')
  typing(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; userId: string },
  ) {
    client.to(payload.roomId).emit('user-typing', payload);
  }
}
