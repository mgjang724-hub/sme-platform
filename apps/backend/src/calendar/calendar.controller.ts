import { Controller, Get, Post, Body, Request } from '@nestjs/common';
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  async getEvents(@Request() req: any) {
    return this.calendarService.getEvents(req.user);
  }

  @Post()
  async createEvent(@Request() req: any, @Body() body: any) {
    return this.calendarService.createEvent(req.user, body);
  }
}
