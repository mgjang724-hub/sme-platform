import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  async create(@Request() req: any, @Body() dto: any) {
    return this.coursesService.create(req.user, dto);
  }

  @Get()
  async findAll(@Request() req: any) {
    return this.coursesService.findAll(req.user);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.coursesService.findOne(req.user, id);
  }

  @Get(':id/members')
  async findMembers(@Param('id') courseId: string) {
    return this.coursesService.findMembers(courseId);
  }

  @Post(':id/members')
  async addMember(
    @Request() req: any,
    @Param('id') courseId: string,
    @Body() dto: any,
  ) {
    return this.coursesService.addMember(courseId, req.user, dto);
  }

  @Post(':id/members/:userId/revoke')
  async revokeMember(
    @Request() req: any,
    @Param('id') courseId: string,
    @Param('userId') memberUserId: string,
    @Body('reason') reason: string,
  ) {
    return this.coursesService.revokeMember(courseId, req.user, memberUserId, reason);
  }
}
