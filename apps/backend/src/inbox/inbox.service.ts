import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface InboxMessage {
  message_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  text: string;
  created_at: string;
}

export interface QnaThread {
  thread_id: string;
  subject: string;
  category: string;
  creator_id: string;
  creator_name: string;
  creator_role: string;
  created_at: string;
  updated_at: string;
  status: 'PENDING' | 'ANSWERED';
  tagIcon: string;
  tagBg: string;
  tagFg: string;
  contextFull: string;
  contextHref: string;
  messages: InboxMessage[];
}

@Injectable()
export class InboxService {
  private filePath = path.join(process.cwd(), 'inbox.json');
  private threads: QnaThread[] = [];

  constructor() {
    this.loadThreads();
  }

  private loadThreads() {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.threads = JSON.parse(raw);
        return;
      } catch (err) {
        console.error('Failed to parse inbox.json, resetting.', err);
      }
    }

    // Seed mock data from wireframe S13
    this.threads = [
      {
        thread_id: 'thread-1',
        subject: '3차시 역할극 촬영 일정 문의',
        category: '촬영 안내',
        creator_id: 'sme-user-id', // matches sme seed user ID
        creator_name: '홍길동 강사',
        creator_role: 'SME',
        created_at: new Date('2026-07-08T10:12:00Z').toISOString(),
        updated_at: new Date('2026-07-08T10:12:00Z').toISOString(),
        status: 'PENDING',
        tagIcon: 'clapperboard',
        tagBg: 'var(--stage-film-bg)',
        tagFg: 'var(--stage-film-fg)',
        contextFull: '촬영 안내 문서',
        contextHref: '/guide',
        messages: [
          {
            message_id: 'msg-1-1',
            sender_id: 'sme-user-id',
            sender_name: '홍길동 강사',
            sender_role: 'SME',
            text: '3차시 역할극은 출연자가 2명이라 촬영 일정 조율이 필요할 것 같아요. 스튜디오 B는 언제쯤 예약 가능할까요? 두 강사 모두 화·목 오후가 편합니다.',
            created_at: new Date('2026-07-08T10:12:00Z').toISOString(),
          }
        ]
      },
      {
        thread_id: 'thread-2',
        subject: '원고 분량 기준이 궁금해요',
        category: '원고 작성 가이드',
        creator_id: 'sme-user-id-2',
        creator_name: '박도현 강사',
        creator_role: 'SME',
        created_at: new Date('2026-07-08T08:40:00Z').toISOString(),
        updated_at: new Date('2026-07-08T08:40:00Z').toISOString(),
        status: 'PENDING',
        tagIcon: 'file-text',
        tagBg: 'var(--stage-script-bg)',
        tagFg: 'var(--stage-script-fg)',
        contextFull: '원고 작성 가이드',
        contextHref: '/guide',
        messages: [
          {
            message_id: 'msg-2-1',
            sender_id: 'sme-user-id-2',
            sender_name: '박도현 강사',
            sender_role: 'SME',
            text: '차시당 분량이 8~10분이라고 안내받았는데, 이게 슬라이드 설명 포함 기준인가요, 아니면 순수 발화 기준인가요? 대본 길이 잡는 데 참고하려고요.',
            created_at: new Date('2026-07-08T08:40:00Z').toISOString(),
          }
        ]
      },
      {
        thread_id: 'thread-3',
        subject: 'Google Docs 링크 제출 방법',
        category: '원고 상세관리',
        creator_id: 'sme-user-id',
        creator_name: '홍길동 강사',
        creator_role: 'SME',
        created_at: new Date('2026-07-07T15:20:00Z').toISOString(),
        updated_at: new Date('2026-07-07T16:05:00Z').toISOString(),
        status: 'ANSWERED',
        tagIcon: 'message-square',
        tagBg: 'var(--primary-tint)',
        tagFg: 'var(--primary-hover)',
        contextFull: '3차시 원고',
        contextHref: '/courses',
        messages: [
          {
            message_id: 'msg-3-1',
            sender_id: 'sme-user-id',
            sender_name: '홍길동 강사',
            sender_role: 'SME',
            text: '파일 대신 Google Docs 링크로 제출해도 괜찮을까요? 편집 권한은 어떻게 드리면 될지 궁금해요.',
            created_at: new Date('2026-07-07T15:20:00Z').toISOString(),
          },
          {
            message_id: 'msg-3-2',
            sender_id: 'planner-user-id',
            sender_name: '김기획 기획자',
            sender_role: 'PLANNER',
            text: "네, 링크 제출 환영합니다! 링크에 '뷰어' 권한만 주시면 되고, 원고 상세 화면의 링크 입력칸에 붙여넣어 주세요. 제가 검토본은 별도 파일로 올려드릴게요.",
            created_at: new Date('2026-07-07T16:05:00Z').toISOString(),
          }
        ]
      }
    ];

    this.saveThreads();
  }

  private saveThreads() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.threads, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save inbox.json', err);
    }
  }

  async findAll(user: any) {
    // If SME, filter threads where SME is creator
    if (user.global_role === 'SME') {
      return this.threads.filter((t) => t.creator_id === user.user_id || t.creator_name.includes(user.name));
    }
    return this.threads;
  }

  async createThread(user: any, dto: any) {
    const { subject, category, text, tagIcon, contextFull, contextHref } = dto;
    const threadId = `thread-${Date.now()}`;

    const newThread: QnaThread = {
      thread_id: threadId,
      subject,
      category: category || '원고 작성 가이드',
      creator_id: user.user_id,
      creator_name: user.name,
      creator_role: user.global_role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'PENDING',
      tagIcon: tagIcon || 'file-text',
      tagBg: 'var(--stage-script-bg)',
      tagFg: 'var(--stage-script-fg)',
      contextFull: contextFull || '원고 작성 가이드',
      contextHref: contextHref || '/guide',
      messages: [
        {
          message_id: `msg-${Date.now()}`,
          sender_id: user.user_id,
          sender_name: user.name,
          sender_role: user.global_role,
          text,
          created_at: new Date().toISOString(),
        }
      ]
    };

    this.threads.unshift(newThread);
    this.saveThreads();
    return newThread;
  }

  async replyThread(user: any, threadId: string, text: string) {
    const thread = this.threads.find((t) => t.thread_id === threadId);
    if (!thread) {
      throw new NotFoundException('해당 문의 글을 찾을 수 없습니다.');
    }

    const newMessage: InboxMessage = {
      message_id: `msg-${Date.now()}`,
      sender_id: user.user_id,
      sender_name: user.name,
      sender_role: user.global_role,
      text,
      created_at: new Date().toISOString(),
    };

    thread.messages.push(newMessage);
    thread.updated_at = new Date().toISOString();
    
    if (user.global_role === 'PLANNER' || user.global_role === 'ADMIN') {
      thread.status = 'ANSWERED';
    } else {
      thread.status = 'PENDING';
    }

    this.saveThreads();
    return thread;
  }
}
