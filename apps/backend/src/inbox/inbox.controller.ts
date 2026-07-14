import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { InboxService } from './inbox.service';

@Controller('inbox')
export class InboxController {
  constructor(private readonly inboxService: InboxService) {}

  @Get()
  async findAll(@Request() req: any) {
    return this.inboxService.findAll(req.user);
  }

  @Post()
  async createThread(@Request() req: any, @Body() dto: any) {
    return this.inboxService.createThread(req.user, dto);
  }

  @Post(':id/reply')
  async replyThread(
    @Request() req: any,
    @Param('id') threadId: string,
    @Body('text') text: string,
  ) {
    return this.inboxService.replyThread(req.user, threadId, text);
  }
}
