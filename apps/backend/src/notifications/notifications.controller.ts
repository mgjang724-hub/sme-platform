import { Controller, Get, Post, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@Request() req: any) {
    return this.notificationsService.findAll(req.user);
  }

  @Post('mark-all')
  async markAllRead(@Request() req: any) {
    return this.notificationsService.markAllRead(req.user);
  }
}
