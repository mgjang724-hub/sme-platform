import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async getReviewQueue() {
    return this.prisma.deliverable.findMany({
      where: {
        deliverable_type: 'SCRIPT',
        current_status: {
          in: ['SUBMITTED', 'IN_REVIEW', 'REVISION_REQUESTED'],
        },
      },
      include: {
        lesson: {
          include: {
            course: {
              include: {
                members: {
                  where: { revoked_at: null },
                  include: {
                    user: {
                      select: { user_id: true, name: true, email: true, global_role: true }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        deliverable_id: 'desc',
      }
    });
  }
}
