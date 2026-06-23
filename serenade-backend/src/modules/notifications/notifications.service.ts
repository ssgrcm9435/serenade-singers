import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { getFirebaseMessaging } from './firebase-admin';

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

  async sendPushToAll(dto: CreateNotificationDto) {
    const notification = await this.createNotification(dto);
    const devices = await this.prisma.userDevice.findMany();

    const messaging = getFirebaseMessaging();

    if (!messaging) {
      return {
        success: false,
        message: 'Firebase Admin is not configured.',
        notification,
        deviceCount: devices.length,
      };
    }

    if (devices.length === 0) {
      return {
        success: true,
        message: 'No registered devices.',
        notification,
        deviceCount: 0,
      };
    }

    const tokens = devices.map((d) => d.fcmToken);

    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: dto.title,
        body: dto.body,
      },
      data: {
        type: dto.type,
        target: dto.target || '',
      },
    });

    return {
      success: true,
      notification,
      deviceCount: tokens.length,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  }
}
