import { UseGuards } from '@nestjs/common';
import { AdminMeetingGuard } from '../auth/guards/admin-meeting.guard';
import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AdminMeetingGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
