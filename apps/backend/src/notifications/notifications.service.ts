import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface NotificationItem {
  id: string;
  recipient_role: 'PLANNER' | 'SME';
  kind: 'feedback' | 'status' | 'deadline' | 'inquiry';
  title: string;
  desc: string;
  time: string;
  cta: string;
  href: string;
  unread: boolean;
  created_at: string;
}

@Injectable()
export class NotificationsService {
  private filePath = path.join(process.cwd(), 'notifications.json');
  private notifications: NotificationItem[] = [];

  constructor() {
    this.loadNotifications();
  }

  private loadNotifications() {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.notifications = JSON.parse(raw);
        return;
      } catch (err) {
        console.error('Failed to parse notifications.json, resetting.', err);
      }
    }

    // Seed mock notifications matching wireframe S14
    this.notifications = [
      {
        id: 'p1',
        recipient_role: 'PLANNER',
        kind: 'feedback',
        title: '이서연 강사가 새 버전을 제출했어요',
        desc: '직장 내 괴롭힘 예방 · 3차시 역할극 시나리오 v2 — 검수를 기다리고 있어요.',
        time: '3시간 전',
        cta: '검수하러 가기',
        href: '/courses',
        unread: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'p2',
        recipient_role: 'PLANNER',
        kind: 'inquiry',
        title: '새 문의가 도착했어요',
        desc: '이서연 강사 — “3차시 역할극 촬영 일정 문의” 답변을 기다리고 있어요.',
        time: '1시간 전',
        cta: '답변하기',
        href: '/inbox',
        unread: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'p3',
        recipient_role: 'PLANNER',
        kind: 'deadline',
        title: '마감이 초과됐어요',
        desc: '성희롱 예방 교육 · 2차시 원고가 7.6 마감을 초과했어요.',
        time: '오늘 09:00',
        cta: '과정 보기',
        href: '/courses',
        unread: true,
        created_at: new Date().toISOString()
      },
      {
        id: 's1',
        recipient_role: 'SME',
        kind: 'feedback',
        title: '기획자가 피드백을 남겼어요',
        desc: '3차시 역할극 시나리오 v2 — “인트로 톤을 조금 더 부드럽게” 수정 요청이 있어요.',
        time: '1시간 전',
        cta: '확인하기',
        href: '/courses',
        unread: true,
        created_at: new Date().toISOString()
      },
      {
        id: 's2',
        recipient_role: 'SME',
        kind: 'inquiry',
        title: '문의 답변이 도착했어요',
        desc: '“Google Docs 링크 제출 방법” 에 대한 기획자 답변을 확인해 보세요.',
        time: '어제',
        cta: '답변 보기',
        href: '/inbox',
        unread: true,
        created_at: new Date().toISOString()
      },
      {
        id: 's3',
        recipient_role: 'SME',
        kind: 'deadline',
        title: '제출 마감이 임박했어요',
        desc: '직장 내 괴롭힘 예방 · 3차시 원고 마감이 오늘까지예요.',
        time: '오늘 08:00',
        cta: '작업 열기',
        href: '/my-tasks',
        unread: true,
        created_at: new Date().toISOString()
      }
    ];

    this.saveNotifications();
  }

  private saveNotifications() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.notifications, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save notifications.json', err);
    }
  }

  async findAll(user: any) {
    const role = user.global_role === 'SME' ? 'SME' : 'PLANNER';
    return this.notifications.filter((n) => n.recipient_role === role);
  }

  async markAllRead(user: any) {
    const role = user.global_role === 'SME' ? 'SME' : 'PLANNER';
    this.notifications.forEach((n) => {
      if (n.recipient_role === role) {
        n.unread = false;
      }
    });
    this.saveNotifications();
    return { success: true };
  }

  async createNotification(item: Omit<NotificationItem, 'id' | 'unread' | 'created_at'>) {
    const newNoti: NotificationItem = {
      ...item,
      id: `noti-${Date.now()}`,
      unread: true,
      created_at: new Date().toISOString()
    };
    this.notifications.unshift(newNoti);
    this.saveNotifications();
    return newNoti;
  }
}
