import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface Guide {
  guide_id: string;
  title: string;
  category: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class GuidesService {
  private filePath = path.join(process.cwd(), 'guides.json');
  private guides: Guide[] = [];

  constructor() {
    this.loadGuides();
  }

  private loadGuides() {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.guides = JSON.parse(raw);
        return;
      } catch (err) {
        console.error('Failed to parse guides.json, resetting.', err);
      }
    }

    // Initialize with seed guides matching wireframe S09
    this.guides = [
      {
        guide_id: 'guide-1',
        title: '차시별 원고 집필 서식 가이드라인',
        category: '원고 작성 안내',
        content: `### 원고 작성 표준 가이드
이 가이드는 교사 연수 원고 작성의 양식 통일을 위한 문서입니다.

#### 1. 기본 규격
- 분량: 1개 차시당 A4 용지 8~10쪽 내외
- 서체: 맑은고딕 10pt (줄간격 160%)
- 제출 포맷: Microsoft Word (.docx) 또는 구글 문서 링크

#### 2. 작성 팁
- 연수 대상을 고려하여 어조는 존댓말로 서술해 주세요 (예: "~입니다", "~해 보세요").
- 복잡한 도해나 그림이 필요할 경우 지문에 구체적인 연출 묘사를 추가해 주세요.`,
        author: '김정수 기획자',
        created_at: new Date('2026-06-15').toISOString(),
        updated_at: new Date('2026-06-15').toISOString(),
      },
      {
        guide_id: 'guide-2',
        title: '3차시 역할극 시나리오 촬영 지침 및 일정',
        category: '촬영 안내',
        content: `### 3차시 역할극 촬영 안내
3차시 원고의 역할극 시나리오 촬영에 필요한 기본 공지 사항입니다.

#### 1. 촬영 일정
- 촬영 예정일: 2026년 7월 28일 (화) 오전 10:00 ~ 오후 1:00
- 장소: 본사 4층 스마트 크로마키 스튜디오

#### 2. 출연진 및 의상
- 출연: 이서연 강사, 박도현 강사 (총 2인)
- 의상: 비즈니스 캐주얼 (원색 계열 및 크로마키 보라/초록색 배경과 겹치지 않는 색상)`,
        author: '김정수 기획자',
        created_at: new Date('2026-06-20').toISOString(),
        updated_at: new Date('2026-06-20').toISOString(),
      },
      {
        guide_id: 'guide-3',
        title: '개정 교육과정 연수 강사 필수 수칙',
        category: '연수 공지',
        content: `### 필수 준수 사항
교육과정 개정에 따라 연수 콘텐츠 개발 시 반드시 준수해야 하는 교육부 고시 지침 요약본입니다.`,
        author: '이하은 기획자',
        created_at: new Date('2026-06-25').toISOString(),
        updated_at: new Date('2026-06-25').toISOString(),
      }
    ];

    this.saveGuides();
  }

  private saveGuides() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.guides, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save guides.json', err);
    }
  }

  async findAll(search?: string, category?: string) {
    let list = [...this.guides];

    if (category && category !== '전체') {
      list = list.filter((g) => g.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((g) => g.title.toLowerCase().includes(q) || g.content.toLowerCase().includes(q));
    }

    return list;
  }

  async findOne(id: string) {
    const guide = this.guides.find((g) => g.guide_id === id);
    if (!guide) {
      throw new NotFoundException('해당 가이드 글을 찾을 수 없습니다.');
    }
    return guide;
  }

  async create(user: any, dto: any) {
    if (user.global_role !== 'PLANNER' && user.global_role !== 'ADMIN') {
      throw new ForbiddenException('기획자 또는 관리자만 가이드를 작성할 수 있습니다.');
    }

    const { title, category, content } = dto;
    const nextId = `guide-${Date.now()}`;

    const newGuide: Guide = {
      guide_id: nextId,
      title,
      category: category || '원고 작성 안내',
      content: content || '',
      author: user.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.guides.push(newGuide);
    this.saveGuides();
    return newGuide;
  }

  async update(id: string, user: any, dto: any) {
    if (user.global_role !== 'PLANNER' && user.global_role !== 'ADMIN') {
      throw new ForbiddenException('기획자 또는 관리자만 가이드를 수정할 수 있습니다.');
    }

    const index = this.guides.findIndex((g) => g.guide_id === id);
    if (index === -1) {
      throw new NotFoundException('해당 가이드 글을 찾을 수 없습니다.');
    }

    const { title, category, content } = dto;
    const existing = this.guides[index];

    this.guides[index] = {
      ...existing,
      title: title !== undefined ? title : existing.title,
      category: category !== undefined ? category : existing.category,
      content: content !== undefined ? content : existing.content,
      updated_at: new Date().toISOString(),
    };

    this.saveGuides();
    return this.guides[index];
  }

  async remove(id: string, user: any) {
    if (user.global_role !== 'PLANNER' && user.global_role !== 'ADMIN') {
      throw new ForbiddenException('기획자 또는 관리자만 가이드를 삭제할 수 있습니다.');
    }

    const index = this.guides.findIndex((g) => g.guide_id === id);
    if (index === -1) {
      throw new NotFoundException('해당 가이드 글을 찾을 수 없습니다.');
    }

    this.guides.splice(index, 1);
    this.saveGuides();
    return { success: true };
  }
}
