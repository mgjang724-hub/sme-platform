import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GlobalRole, CourseStatus, DeliverableType } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(user: any, dto: any) {
    if (user.global_role !== GlobalRole.PLANNER && user.global_role !== GlobalRole.ADMIN) {
      throw new ForbiddenException('기획자 또는 관리자만 과정을 생성할 수 있습니다.');
    }

    const { course_name, courseCode, vendor, dev_type, overview, milestones, lessons } = dto;

    return this.prisma.$transaction(async (tx) => {
      const course = await tx.course.create({
        data: {
          course_name,
          courseCode: courseCode || `CRS-${Date.now()}`,
          vendor,
          dev_type,
          overview,
          milestones: milestones || {},
          current_stage: '원고',
          status: CourseStatus.DRAFT,
          planner_id: user.user_id,
          lesson_count: lessons ? lessons.length : 0,
        },
      });

      // Add planner as CourseMember
      await tx.courseMember.create({
        data: {
          course_id: course.course_id,
          user_id: user.user_id,
          role_in_course: 'PLANNER',
        },
      });

      if (lessons && Array.isArray(lessons)) {
        for (const l of lessons) {
          const lesson = await tx.lesson.create({
            data: {
              course_id: course.course_id,
              lesson_no: l.lesson_no,
              title: l.title,
              subtitle: l.subtitle || '',
              lessonCode: l.lessonCode || `LSN-${course.courseCode}-${l.lesson_no}`,
              derived_status: 'NOT_SUBMITTED',
            },
          });

          // Create default SCRIPT deliverable
          await tx.deliverable.create({
            data: {
              lesson_id: lesson.lesson_id,
              deliverable_type: DeliverableType.SCRIPT,
              owner_role: 'SME',
              current_status: 'NOT_SUBMITTED',
            },
          });
        }
      }

      return course;
    });
  }

  async findAll(user: any) {
    const role = user.global_role;

    if (role === GlobalRole.ADMIN || role === GlobalRole.MANAGER) {
      return this.prisma.course.findMany({
        include: {
          planner: {
            select: { user_id: true, name: true, email: true },
          },
        },
      });
    }

    // Otherwise, filter by CourseMember membership (revokedAt is null)
    return this.prisma.course.findMany({
      where: {
        OR: [
          { planner_id: user.user_id },
          {
            members: {
              some: {
                user_id: user.user_id,
                revoked_at: null,
              },
            },
          },
        ],
      },
      include: {
        planner: {
          select: { user_id: true, name: true, email: true },
        },
      },
    });
  }

  async findOne(user: any, course_id: string) {
    const course = await this.prisma.course.findUnique({
      where: { course_id },
      include: {
        planner: {
          select: { user_id: true, name: true, email: true },
        },
        members: {
          where: { revoked_at: null },
          include: {
            user: {
              select: { user_id: true, name: true, email: true, global_role: true },
            },
          },
        },
        lessons: {
          orderBy: { lesson_no: 'asc' },
          include: {
            deliverables: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('해당 과정을 찾을 수 없습니다.');
    }

    // Role check: ADMIN/MANAGER can view anything. Others must be planner or active member
    if (user.global_role !== GlobalRole.ADMIN && user.global_role !== GlobalRole.MANAGER) {
      const isPlanner = course.planner_id === user.user_id;
      const isMember = course.members.some((m) => m.user_id === user.user_id);
      if (!isPlanner && !isMember) {
        throw new ForbiddenException('해당 과정에 접근할 권한이 없습니다.');
      }
    }

    return course;
  }

  async findMembers(course_id: string) {
    return this.prisma.courseMember.findMany({
      where: { 
        course_id,
        revoked_at: null,
      },
      include: {
        user: {
          select: { user_id: true, name: true, email: true, global_role: true },
        },
      },
    });
  }

  async addMember(course_id: string, user: any, dto: any) {
    // Only course planner or ADMIN can add members
    const course = await this.prisma.course.findUnique({
      where: { course_id },
    });

    if (!course) {
      throw new NotFoundException('해당 과정을 찾을 수 없습니다.');
    }

    if (course.planner_id !== user.user_id && user.global_role !== GlobalRole.ADMIN) {
      throw new ForbiddenException('과정 기획자나 관리자만 멤버를 추가할 수 있습니다.');
    }

    const { email, role_in_course } = dto;
    const targetUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      throw new NotFoundException('해당 이메일의 유저를 찾을 수 없습니다.');
    }

    // Check if member already exists
    const existing = await this.prisma.courseMember.findFirst({
      where: {
        course_id,
        user_id: targetUser.user_id,
      },
    });

    if (existing) {
      if (existing.revoked_at === null) {
        return existing; // already active member
      }
      // Re-activate member
      return this.prisma.courseMember.update({
        where: { id: existing.id },
        data: {
          revoked_at: null,
          revoke_reason: null,
          role_in_course: role_in_course || 'SME',
        },
      });
    }

    return this.prisma.courseMember.create({
      data: {
        course_id,
        user_id: targetUser.user_id,
        role_in_course: role_in_course || 'SME',
      },
    });
  }

  async revokeMember(course_id: string, user: any, memberUserId: string, reason: string) {
    const course = await this.prisma.course.findUnique({
      where: { course_id },
    });

    if (!course) {
      throw new NotFoundException('해당 과정을 찾을 수 없습니다.');
    }

    if (course.planner_id !== user.user_id && user.global_role !== GlobalRole.ADMIN) {
      throw new ForbiddenException('과정 기획자나 관리자만 멤버 권한을 회수할 수 있습니다.');
    }

    const member = await this.prisma.courseMember.findFirst({
      where: {
        course_id,
        user_id: memberUserId,
        revoked_at: null,
      },
    });

    if (!member) {
      throw new NotFoundException('해당 과정의 멤버 정보를 찾을 수 없거나 이미 비활성화되었습니다.');
    }

    return this.prisma.courseMember.update({
      where: { id: member.id },
      data: {
        revoked_at: new Date(),
        revoke_reason: reason || '권한 해제',
      },
    });
  }
}
