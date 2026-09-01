import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  /** 설정 화면에서 쓰는 내 정보. 비밀번호 해시는 빼고 돌려준다. */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        name: true,
        email: true,
        global_role: true,
        phone: true,
        noti_muted: true,
        noti_frequency: true,
      },
    });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  /** 본인만 자기 정보를 고칠 수 있다. 역할과 이메일은 여기서 바꾸지 않는다. */
  async updateProfile(userId: string, dto: any) {
    const { name, phone, noti_muted, noti_frequency } = dto;

    if (name !== undefined && !String(name).trim()) {
      throw new BadRequestException('이름은 비워 둘 수 없습니다.');
    }
    const allowedFrequency = ['realtime', 'daily', 'weekly'];
    if (noti_frequency !== undefined && !allowedFrequency.includes(noti_frequency)) {
      throw new BadRequestException('알림 주기 값이 올바르지 않습니다.');
    }

    return this.prisma.user.update({
      where: { user_id: userId },
      data: {
        ...(name !== undefined ? { name: String(name).trim() } : {}),
        ...(phone !== undefined ? { phone: phone ? String(phone).trim() : null } : {}),
        ...(noti_muted !== undefined ? { noti_muted: Boolean(noti_muted) } : {}),
        ...(noti_frequency !== undefined ? { noti_frequency } : {}),
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        global_role: true,
        phone: true,
        noti_muted: true,
        noti_frequency: true,
      },
    });
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
