import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CalendarService {
  private readonly filepath = path.join(process.cwd(), 'calendar_events.json');

  constructor(private prisma: PrismaService) {}

  private readCustomEvents(): any[] {
    try {
      if (!fs.existsSync(this.filepath)) {
        fs.writeFileSync(this.filepath, JSON.stringify([]));
        return [];
      }
      const data = fs.readFileSync(this.filepath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      return [];
    }
  }

  private writeCustomEvents(events: any[]): void {
    fs.writeFileSync(this.filepath, JSON.stringify(events, null, 2));
  }

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

    // Merge custom events
    const customEvents = this.readCustomEvents();
    customEvents.forEach(evt => {
      // If user is SME, only show custom events they created or that are related to courses they are assigned to
      if (user.global_role === 'SME') {
        const isMyCourse = evt.course_id ? courses.some(c => c.course_id === evt.course_id) : false;
        const isMyCreated = evt.creator_id === user.user_id;
        if (isMyCourse || isMyCreated || !evt.course_id) {
          events.push(evt);
        }
      } else {
        events.push(evt);
      }
    });

    return events;
  }

  async createEvent(user: any, dto: any) {
    const { label, date, kind, description, course_id } = dto;
    const events = this.readCustomEvents();

    let course_name = '공통 일정';
    if (course_id) {
      const course = await this.prisma.course.findUnique({
        where: { course_id }
      });
      if (course) {
        course_name = course.course_name;
      }
    }

    const newEvent = {
      id: `custom-${Date.now()}`,
      course_id: course_id || null,
      course_name,
      label,
      date,
      kind: kind || 'meeting',
      description: description || '',
      creator_name: user.name,
      creator_id: user.user_id,
      created_at: new Date().toISOString()
    };

    events.push(newEvent);
    this.writeCustomEvents(events);

    return newEvent;
  }
}
