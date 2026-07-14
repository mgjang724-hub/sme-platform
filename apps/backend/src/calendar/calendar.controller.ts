import { Controller, Get, Request } from '@nestjs/common';
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  async getEvents(@Request() req: any) {
    return this.calendarService.getEvents(req.user);
  }
}
