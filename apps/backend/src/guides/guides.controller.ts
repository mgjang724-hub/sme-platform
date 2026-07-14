import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { GuidesService } from './guides.service';

@Controller('guides')
export class GuidesController {
  constructor(private readonly guidesService: GuidesService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.guidesService.findAll(search, category);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.guidesService.findOne(id);
  }

  @Post()
  async create(@Request() req: any, @Body() dto: any) {
    return this.guidesService.create(req.user, dto);
  }

  @Put(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.guidesService.update(id, req.user, dto);
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.guidesService.remove(id, req.user);
  }
}
