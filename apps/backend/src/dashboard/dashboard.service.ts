import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GlobalRole, FeedbackStatus, DecisionStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getPlannerDashboard(user: any) {
    if (user.global_role !== GlobalRole.PLANNER && user.global_role !== GlobalRole.ADMIN) {
      throw new ForbiddenException('기획자 대시보드 권한이 없습니다.');
    }

    const now = new Date();

    // 1. Feedbacks requiring review (created by planner, status is RESOLVED)
    const feedbackResolved = await this.prisma.feedback.count({
      where: {
        created_by: user.user_id,
        status: FeedbackStatus.RESOLVED,
      },
    });

    // 2. Delayed/Overdue feedbacks (due_date < now, not resolved or closed)
    const delayedFeedbacks = await this.prisma.feedback.count({
      where: {
        due_date: { lt: now },
        status: { in: [FeedbackStatus.OPEN, FeedbackStatus.IN_PROGRESS, FeedbackStatus.REOPENED] },
        deliverable: {
          lesson: {
            course: {
              planner_id: user.user_id,
            },
          },
        },
      },
    });

    // 3. Deliverables pending approval (current_status in SUBMITTED, IN_REVIEW)
    const pendingApproval = await this.prisma.deliverable.count({
      where: {
        current_status: { in: ['SUBMITTED', 'IN_REVIEW'] },
        lesson: {
          course: {
            planner_id: user.user_id,
          },
        },
      },
    });

    // 4. DecisionLogs waiting for answer
    const pendingDecisions = await this.prisma.decisionLog.count({
      where: {
        status: DecisionStatus.WAITING,
        course: {
          planner_id: user.user_id,
        },
      },
    });

    // 5. Course List with progress rate & delayed lessons
    const courses = await this.prisma.course.findMany({
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
        lessons: {
          include: {
            deliverables: {
              include: {
                feedbacks: true,
              },
            },
          },
        },
      },
    });

    const mappedCourses = courses.map((course) => {
      const totalLessons = course.lessons.length;
      let approvedLessons = 0;
      let delayedCount = 0;

      course.lessons.forEach((lesson) => {
        const scriptDeliv = lesson.deliverables.find((d) => d.deliverable_type === 'SCRIPT');
        if (scriptDeliv) {
          if (scriptDeliv.current_status === 'APPROVED') {
            approvedLessons++;
          }
          // Delayed if any associated feedback is overdue
          const hasOverdueFeedback = scriptDeliv.feedbacks.some(
            (f) =>
              f.due_date &&
              f.due_date < now &&
              [FeedbackStatus.OPEN, FeedbackStatus.IN_PROGRESS, FeedbackStatus.REOPENED].includes(f.status as any),
          );
          if (hasOverdueFeedback || scriptDeliv.blocking_reason) {
            delayedCount++;
          }
        }
      });

      const progressRate = totalLessons > 0 ? Math.round((approvedLessons / totalLessons) * 100) : 0;

      return {
        course_id: course.course_id,
        course_name: course.course_name,
        courseCode: course.courseCode,
        status: course.status,
        current_stage: course.current_stage,
        lesson_count: totalLessons,
        progress_rate: progressRate,
        delayed_lessons: delayedCount,
      };
    });

    // 6. Action Needed tasks list (derived from unresolved feedbacks and decisions)
    const actionFeedbacks = await this.prisma.feedback.findMany({
      where: {
        status: { in: [FeedbackStatus.OPEN, FeedbackStatus.IN_PROGRESS, FeedbackStatus.RESOLVED, FeedbackStatus.REOPENED] },
        deliverable: {
          lesson: {
            course: {
              planner_id: user.user_id,
            },
          },
        },
      },
      include: {
        deliverable: {
          include: {
            lesson: {
              select: { lesson_no: true, title: true },
            },
          },
        },
      },
      take: 10,
    });

    const actionDecisions = await this.prisma.decisionLog.findMany({
      where: {
        status: DecisionStatus.ASKED,
        course: {
          planner_id: user.user_id,
        },
      },
      include: {
        lesson: {
          select: { lesson_no: true, title: true },
        },
      },
      take: 10,
    });

    const actionTasks = [
      ...actionFeedbacks.map((f) => ({
        id: f.feedback_id,
        type: 'FEEDBACK',
        title: `[차시 ${f.deliverable.lesson.lesson_no}] 피드백: ${f.content.substring(0, 30)}`,
        status: f.status,
        dueDate: f.due_date,
        lessonNo: f.deliverable.lesson.lesson_no,
      })),
      ...actionDecisions.map((d) => ({
        id: d.decision_id,
        type: 'DECISION',
        title: `[차시 ${d.lesson?.lesson_no || '전체'}] 의사결정: ${d.question.substring(0, 30)}`,
        status: d.status,
        dueDate: d.due_date,
        lessonNo: d.lesson?.lesson_no || 0,
      })),
    ];

    return {
      kpis: {
        feedbackResolved,
        pendingApproval,
        pendingDecisions,
      },
      courses: mappedCourses,
      actionTasks,
    };
  }
}
