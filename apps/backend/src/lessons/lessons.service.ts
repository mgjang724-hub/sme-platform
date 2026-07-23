import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';
import { extractTextFromDoc } from '../utils/document-parser';

import { AiService } from '../ai/ai.service';

@Injectable()
export class LessonsService {
  private s3Client: S3Client;

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {
    const endpoint = process.env.AWS_ENDPOINT;
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-northeast-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock-key',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock-secret',
      },
      endpoint: endpoint && endpoint.trim() !== '' ? endpoint : undefined,
      forcePathStyle: endpoint ? true : false,
    });
  }

  async getHeatmap(courseId: string) {
    const lessons = await this.prisma.lesson.findMany({
      where: { course_id: courseId },
      orderBy: { lesson_no: 'asc' },
      include: {
        deliverables: true,
      },
    });

    return lessons.map((lesson) => {
      const scriptDeliv = lesson.deliverables.find((d) => d.deliverable_type === 'SCRIPT');
      const derived_status = scriptDeliv ? scriptDeliv.current_status : 'NOT_SUBMITTED';

      return {
        lesson_id: lesson.lesson_id,
        lesson_no: lesson.lesson_no,
        title: lesson.title,
        subtitle: lesson.subtitle,
        derived_status,
        deliverables: lesson.deliverables.map((d) => ({
          deliverable_id: d.deliverable_id,
          deliverable_type: d.deliverable_type,
          current_status: d.current_status,
          blocking_reason: d.blocking_reason,
        })),
      };
    });
  }

  async createPresignedUrl(user: any, deliverableId: string, body: any) {
    const { file_name, kind } = body; // kind: 'FILE' | 'LINK'
    const deliverable = await this.prisma.deliverable.findUnique({
      where: { deliverable_id: deliverableId },
      include: {
        fileVersions: {
          orderBy: { round_no: 'desc' },
          take: 1,
        },
      },
    });

    if (!deliverable) {
      throw new NotFoundException('해당 산출물을 찾을 수 없습니다.');
    }

    const lastRound = deliverable.fileVersions[0]?.round_no || 0;
    const nextRound = lastRound + 1;

    const fileType = kind || 'FILE';

    if (fileType === 'LINK') {
      const { url } = body;
      if (!url) {
        throw new BadRequestException('링크 URL을 제공해야 합니다.');
      }

      // Create new link FileVersion directly
      const fileVersion = await this.prisma.fileVersion.create({
        data: {
          deliverable_id: deliverableId,
          storage_path: url,
          stage: 'DRAFT',
          round_no: nextRound,
          kind: 'LINK',
          uploaded_by: user.user_id,
        },
      });

      // Update deliverable status to SUBMITTED
      await this.prisma.deliverable.update({
        where: { deliverable_id: deliverableId },
        data: { current_status: 'SUBMITTED' },
      });

      return {
        file_version_id: fileVersion.version_id,
        round_no: nextRound,
        storage_path: url,
        kind: 'LINK',
      };
    } else {
      // FILE Upload: Generate S3 storage path and presigned URL
      const bucketName = process.env.AWS_S3_BUCKET || 'sme-script-uploads';
      const key = `deliverables/${deliverableId}/r_${nextRound}_${Date.now()}_${file_name}`;

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

      // Create FileVersion
      const fileVersion = await this.prisma.fileVersion.create({
        data: {
          deliverable_id: deliverableId,
          storage_path: key,
          stage: 'DRAFT',
          round_no: nextRound,
          kind: 'FILE',
          uploaded_by: user.user_id,
        },
      });

      // Update deliverable status to SUBMITTED
      await this.prisma.deliverable.update({
        where: { deliverable_id: deliverableId },
        data: { current_status: 'SUBMITTED' },
      });

      return {
        upload_url: uploadUrl,
        file_version_id: fileVersion.version_id,
        round_no: nextRound,
        storage_path: key,
        kind: 'FILE',
      };
    }
  }

  async getVersions(deliverableId: string) {
    return this.prisma.fileVersion.findMany({
      where: { deliverable_id: deliverableId },
      orderBy: { round_no: 'desc' },
      include: {
        uploader: {
          select: { name: true, email: true },
        },
      },
    });
  }

  async uploadLocalFile(user: any, deliverableId: string, file: any) {
    if (!file) {
      throw new BadRequestException('업로드할 파일을 제공해야 합니다.');
    }

    const deliverable = await this.prisma.deliverable.findUnique({
      where: { deliverable_id: deliverableId },
      include: {
        fileVersions: {
          orderBy: { round_no: 'desc' },
          take: 1,
        },
      },
    });

    if (!deliverable) {
      throw new NotFoundException('해당 산출물을 찾을 수 없습니다.');
    }

    const lastRound = deliverable.fileVersions[0]?.round_no || 0;
    const nextRound = lastRound + 1;

    // Create uploads directory if not exists
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Decode original name to prevent encoding issues
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const safeName = `r_${nextRound}_${Date.now()}_${originalName.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadDir, safeName);

    // Save file locally
    fs.writeFileSync(filePath, file.buffer);

    // Extract text for HWPX or DOCX previews
    let previewPath: string | null = null;
    const ext = originalName.split('.').pop()?.toLowerCase();
    if (ext === 'hwpx' || ext === 'docx') {
      const extractedText = extractTextFromDoc(filePath);
      if (extractedText) {
        const previewFileName = `preview_${nextRound}_${Date.now()}.txt`;
        const previewFilePath = path.join(uploadDir, previewFileName);
        fs.writeFileSync(previewFilePath, extractedText, 'utf8');
        previewPath = `/uploads/${previewFileName}`;
      }
    }

    // Create FileVersion in DB
    const fileVersion = await this.prisma.fileVersion.create({
      data: {
        deliverable_id: deliverableId,
        storage_path: `/uploads/${safeName}`,
        preview_path: previewPath,
        stage: 'DRAFT',
        round_no: nextRound,
        kind: 'FILE',
        uploaded_by: user.user_id,
      },
    });

    // Update deliverable status to SUBMITTED
    await this.prisma.deliverable.update({
      where: { deliverable_id: deliverableId },
      data: { current_status: 'SUBMITTED' },
    });

    return {
      file_version_id: fileVersion.version_id,
      round_no: nextRound,
      storage_path: `/uploads/${safeName}`,
      kind: 'FILE',
    };
  }

  async getAiAnalysis(versionId: string) {
    const version = await this.prisma.fileVersion.findUnique({
      where: { version_id: versionId },
      include: {
        deliverable: {
          include: {
            lesson: true,
          },
        },
      },
    });

    if (!version) {
      throw new NotFoundException('해당 원고 버전을 찾을 수 없습니다.');
    }

    let scriptText = '';
    if (version.preview_path) {
      const fullPath = path.join(process.cwd(), version.preview_path.replace(/^\//, ''));
      if (fs.existsSync(fullPath)) {
        scriptText = fs.readFileSync(fullPath, 'utf8');
      }
    }

    if (!scriptText.trim()) {
      scriptText = `[도입] 안녕하세요. 오늘 수업에서는 ${version.deliverable?.lesson?.title || '본 차시'} 학습 목표와 실무 적용 방안을 다룹니다.\n\n[본문] 학교자율시간 특화 수업 시수와 디지털 교육과정 개정을 바탕으로 주요 핵심 개념을 파악하고 강사 수업 설계를 진행해보겠습니다.\n\n[정리] 이상으로 본 차시 수업 기획 및 원고 작성을 마치겠습니다.`;
    }

    return this.aiService.analyzeScript(scriptText, version.deliverable?.lesson?.title);
  }

  async getDiffComparison(deliverableId: string, v1Id?: string, v2Id?: string) {
    const versions = await this.prisma.fileVersion.findMany({
      where: { deliverable_id: deliverableId },
      orderBy: { round_no: 'asc' },
    });

    if (versions.length === 0) {
      throw new NotFoundException('비교할 원고 버전에 존재하지 않습니다.');
    }

    let version1 = v1Id ? versions.find(v => v.version_id === v1Id) : versions[0];
    let version2 = v2Id ? versions.find(v => v.version_id === v2Id) : versions[versions.length - 1];

    if (!version1) version1 = versions[0];
    if (!version2) version2 = versions[versions.length - 1];

    const getText = (ver: typeof version1) => {
      if (!ver) return '';
      if (ver.preview_path) {
        const fullPath = path.join(process.cwd(), ver.preview_path.replace(/^\//, ''));
        if (fs.existsSync(fullPath)) {
          return fs.readFileSync(fullPath, 'utf8');
        }
      }
      return `[v${ver.round_no} 원고 데이터]\n도입부 질문 및 1차 시안 개요 멘트입니다.\n수업 설계 핵심 내용과 연수원 가이드라인이 명시되어 있습니다.\n감사합니다.`;
    };

    const textV1 = getText(version1);
    const textV2 = getText(version2);

    const diffLines = this.aiService.compareScriptVersions(textV1, textV2);

    return {
      v1: { version_id: version1?.version_id, round_no: version1?.round_no },
      v2: { version_id: version2?.version_id, round_no: version2?.round_no },
      diff: diffLines,
    };
  }
}
