import { Controller, Get, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('planner')
  async getPlannerDashboard(@Request() req: any) {
    return this.dashboardService.getPlannerDashboard(req.user);
  }
}
