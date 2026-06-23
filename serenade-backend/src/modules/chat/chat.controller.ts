import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('chat')
export class ChatController {
  constructor(private prisma: PrismaService) {}

  @Get('rooms')
  async rooms() {
    return this.prisma.chatRoom.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('messages/:roomId')
  async messages(@Param('roomId') roomId: string) {
    return this.prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
  }
}
