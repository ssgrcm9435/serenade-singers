import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  registerDevice(dto: RegisterDeviceDto) {
    return this.prisma.userDevice.upsert({
      where: { fcmToken: dto.fcmToken },
      update: {
        userId: dto.userId,
        device: dto.device,
      },
      create: {
        userId: dto.userId,
        fcmToken: dto.fcmToken,
        device: dto.device,
      },
    });
  }

  createNotification(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: dto,
    });
  }

  listNotifications() {
    return this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  listDevices() {
    return this.prisma.userDevice.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  }
}
