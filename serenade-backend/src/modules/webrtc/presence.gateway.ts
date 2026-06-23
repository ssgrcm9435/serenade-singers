import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

const onlineUsers = new Map<string, string>();

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class PresenceGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('user-online')
  userOnline(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: string; fullName?: string },
  ) {
    onlineUsers.set(payload.userId, client.id);

    this.server.emit('presence-updated', {
      userId: payload.userId,
      fullName: payload.fullName || 'Member',
      status: 'online',
    });

    return { success: true };
  }

  @SubscribeMessage('user-offline')
  userOffline(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: string },
  ) {
    onlineUsers.delete(payload.userId);

    this.server.emit('presence-updated', {
      userId: payload.userId,
      status: 'offline',
    });

    return { success: true };
  }

  @SubscribeMessage('get-online-users')
  getOnlineUsers() {
    return {
      success: true,
      users: Array.from(onlineUsers.keys()),
    };
  }
}
