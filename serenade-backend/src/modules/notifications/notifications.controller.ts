import { Body, Controller, Get, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('devices')
  registerDevice(@Body() dto: RegisterDeviceDto) {
    return this.notificationsService.registerDevice(dto);
  }

  @Get('devices')
  listDevices() {
    return this.notificationsService.listDevices();
  }

  @Post()
  createNotification(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.createNotification(dto);
  }

  @Get()
  listNotifications() {
    return this.notificationsService.listNotifications();
  }
}
