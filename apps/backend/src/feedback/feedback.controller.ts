import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackStatus } from '@prisma/client';

@Controller()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get('deliverables/:id/feedbacks')
  async findByDeliverable(@Param('id') deliverableId: string) {
    return this.feedbackService.findByDeliverable(deliverableId);
  }

  @Post('deliverables/:id/feedbacks')
  async createFeedback(
    @Request() req: any,
    @Param('id') deliverableId: string,
    @Body() dto: any,
  ) {
    return this.feedbackService.createFeedback(req.user, deliverableId, dto);
  }

  @Post('feedbacks/:id/status')
  async updateStatus(
    @Request() req: any,
    @Param('id') feedbackId: string,
    @Body('status') status: FeedbackStatus,
  ) {
    return this.feedbackService.updateStatus(req.user, feedbackId, status);
  }
}
