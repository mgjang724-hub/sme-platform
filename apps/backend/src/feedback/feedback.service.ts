import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FeedbackStatus } from '@prisma/client';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async findByDeliverable(deliverableId: string) {
    return this.prisma.feedback.findMany({
      where: { deliverable_id: deliverableId },
      orderBy: { created_at: 'asc' },
      include: {
        creator: {
          select: { user_id: true, name: true, email: true, global_role: true },
        },
        assignee: {
          select: { user_id: true, name: true, email: true, global_role: true },
        },
        attachments: true,
      },
    });
  }

  async createFeedback(user: any, deliverableId: string, dto: any) {
    const { content, assignee_id, due_date, file_version_id, location_type, location_value } = dto;

    const deliverable = await this.prisma.deliverable.findUnique({
      where: { deliverable_id: deliverableId },
      include: {
        lesson: {
          include: {
            course: {
              include: {
                members: {
                  where: { revoked_at: null },
                },
              },
            },
          },
        },
      },
    });

    if (!deliverable) {
      throw new NotFoundException('해당 산출물을 찾을 수 없습니다.');
    }

    // Determine assignee if not explicitly passed
    let finalAssigneeId = assignee_id;
    if (!finalAssigneeId) {
      // If planner creates it, assign it to first active SME member
      if (user.global_role === 'PLANNER' || user.global_role === 'ADMIN') {
        const smeMember = deliverable.lesson.course.members.find(
          (m) => m.role_in_course === 'SME',
        );
        finalAssigneeId = smeMember?.user_id || deliverable.lesson.course.planner_id;
      } else {
        // If SME creates it, assign it back to the course planner
        finalAssigneeId = deliverable.lesson.course.planner_id;
      }
    }

    return this.prisma.feedback.create({
      data: {
        deliverable_id: deliverableId,
        file_version_id: file_version_id || null,
        location_type: location_type || null,
        location_value: location_value || null,
        content,
        assignee_id: finalAssigneeId,
        created_by: user.user_id,
        due_date: due_date ? new Date(due_date) : null,
        status: FeedbackStatus.OPEN,
      },
      include: {
        creator: {
          select: { name: true, email: true },
        },
      },
    });
  }

  async updateStatus(user: any, feedbackId: string, status: FeedbackStatus) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { feedback_id: feedbackId },
    });

    if (!feedback) {
      throw new NotFoundException('해당 피드백을 찾을 수 없습니다.');
    }

    const updateData: any = { status };

    if (status === FeedbackStatus.REOPENED) {
      updateData.reopen_count = feedback.reopen_count + 1;
    }

    return this.prisma.feedback.update({
      where: { feedback_id: feedbackId },
      data: updateData,
    });
  }
}
