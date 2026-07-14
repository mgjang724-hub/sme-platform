import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (user && user.status === 'ACTIVE' && (await bcrypt.compare(pass, user.password_hash))) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      sub: user.user_id,
      email: user.email,
      global_role: user.global_role,
      name: user.name,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        global_role: user.global_role,
      },
    };
  }
}
