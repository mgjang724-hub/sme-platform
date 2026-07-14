import { Controller, Get, Post, Body, Param, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LessonsService } from './lessons.service';

@Controller()
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get('courses/:id/heatmap')
  async getHeatmap(@Param('id') courseId: string) {
    return this.lessonsService.getHeatmap(courseId);
  }

  @Post('deliverables/:id/files')
  async uploadFile(
    @Request() req: any,
    @Param('id') deliverableId: string,
    @Body() body: any,
  ) {
    return this.lessonsService.createPresignedUrl(req.user, deliverableId, body);
  }

  @Post('deliverables/:id/upload-local')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLocalFile(
    @Request() req: any,
    @Param('id') deliverableId: string,
    @UploadedFile() file: any,
  ) {
    return this.lessonsService.uploadLocalFile(req.user, deliverableId, file);
  }

  @Get('deliverables/:id/files')
  async getVersions(@Param('id') deliverableId: string) {
    return this.lessonsService.getVersions(deliverableId);
  }
}
