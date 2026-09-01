import { Controller, Get, Patch, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Get('me')
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.user_id);
  }

  @Patch('me')
  async updateProfile(@Request() req: any, @Body() dto: any) {
    return this.authService.updateProfile(req.user.user_id, dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout() {
    // Stateless JWT logout is handled on client-side (token deletion).
    // Returning 204.
    return;
  }
}
