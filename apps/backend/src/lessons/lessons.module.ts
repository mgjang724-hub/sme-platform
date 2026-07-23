import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { AiService } from '../ai/ai.service';

@Module({
  providers: [LessonsService, AiService],
  controllers: [LessonsController],
  exports: [LessonsService, AiService],
})
export class LessonsModule {}
