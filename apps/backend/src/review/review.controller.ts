import { Controller, Get } from '@nestjs/common';
import { ReviewService } from './review.service';

@Controller('review-queue')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  async getReviewQueue() {
    return this.reviewService.getReviewQueue();
  }
}
