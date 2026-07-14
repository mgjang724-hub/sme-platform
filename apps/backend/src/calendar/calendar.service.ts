import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async getEvents(user: any) {
    const courses = await this.prisma.course.findMany({
      where: user.global_role === 'SME' ? {
        members: {
          some: {
            user_id: user.user_id,
            revoked_at: null,
          }
        }
      } : {},
      include: {
        lessons: {
          include: {
            deliverables: {
              where: { deliverable_type: 'SCRIPT' }
            }
          }
        }
      }
    });

    const events: any[] = [];
    
    courses.forEach(c => {
      const ms = c.milestones as any;
      if (ms) {
        if (ms.kickoff) {
          events.push({
            id: `kickoff-${c.course_id}`,
            course_id: c.course_id,
            course_name: c.course_name,
            label: `킥오프: ${c.course_name}`,
            date: ms.kickoff,
            kind: 'kickoff'
          });
        }
        if (ms.script_deadline) {
          events.push({
            id: `script-${c.course_id}`,
            course_id: c.course_id,
            course_name: c.course_name,
            label: `원고제출: ${c.course_name}`,
            date: ms.script_deadline,
            kind: 'due'
          });
        }
        if (ms.review_complete) {
          events.push({
            id: `review-${c.course_id}`,
            course_id: c.course_id,
            course_name: c.course_name,
            label: `검수완료: ${c.course_name}`,
            date: ms.review_complete,
            kind: 'review'
          });
        }
        if (ms.confirm_complete) {
          events.push({
            id: `confirm-${c.course_id}`,
            course_id: c.course_id,
            course_name: c.course_name,
            label: `최종확정: ${c.course_name}`,
            date: ms.confirm_complete,
            kind: 'final'
          });
        }
        if (ms.shoot) {
          events.push({
            id: `shoot-${c.course_id}`,
            course_id: c.course_id,
            course_name: c.course_name,
            label: `촬영예정: ${c.course_name}`,
            date: ms.shoot,
            kind: 'film'
          });
        }
      }
    });

    return events;
  }
}
