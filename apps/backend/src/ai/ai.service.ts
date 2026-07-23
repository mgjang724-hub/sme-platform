import { Injectable } from '@nestjs/common';

export interface AiAnalysisResult {
  char_count: number;
  char_count_no_space: number;
  word_count: number;
  estimated_time: string;
  estimated_minutes: number;
  summary: string[];
  proofread_points: {
    type: 'tone' | 'sentence_length' | 'structure' | 'spelling';
    title: string;
    description: string;
    suggestion?: string;
  }[];
  overall_score: number;
}

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  line_no_v1?: number;
  line_no_v2?: number;
  text: string;
}

@Injectable()
export class AiService {
  /**
   * Analyze script text for reading duration, grammar/tone, and summary
   */
  analyzeScript(text: string, lessonTitle?: string): AiAnalysisResult {
    const rawText = text || '';
    const cleanText = rawText.trim();
    const charCount = cleanText.length;
    const charCountNoSpace = cleanText.replace(/\s+/g, '').length;
    const wordCount = cleanText.split(/\s+/).filter(Boolean).length;

    // Korean standard educational speaking pace: 320 characters per minute
    const speakingPacePerMin = 320;
    const totalMinutesExact = charCountNoSpace / speakingPacePerMin;
    const minutes = Math.floor(totalMinutesExact);
    const seconds = Math.round((totalMinutesExact - minutes) * 60);

    const timeFormatted = minutes > 0 
      ? `약 ${minutes}분 ${seconds}초`
      : `약 ${seconds}초`;

    // 1. Proofreading & Tone checks
    const points: AiAnalysisResult['proofread_points'] = [];

    // Check sentence length
    const sentences = cleanText.split(/[.!?]\s+/);
    const longSentences = sentences.filter(s => s.length > 90);
    if (longSentences.length > 0) {
      points.push({
        type: 'sentence_length',
        title: '장문 문장 가독성 개선 필요',
        description: `90자 이상의 장문 문장이 ${longSentences.length}개 감지되었습니다. 호흡이 길어 강사 강의 시 발음이 매끄럽지 않을 수 있으므로 2개로 분할을 권장합니다.`,
        suggestion: `예시 문장: "${longSentences[0].slice(0, 45)}..."`
      });
    }

    // Check tone consistency (~합니다/습니다 vs ~해요)
    const hasFormalEndings = (cleanText.match(/(습니다|합학|입니다|됩니다|하여야 합니다)/g) || []).length;
    const hasInformalEndings = (cleanText.match(/(해요|돼요|이에요|예요|하죠)/g) || []).length;
    
    if (hasFormalEndings > 0 && hasInformalEndings > 0) {
      points.push({
        type: 'tone',
        title: '어조(종결어미) 혼용 감지',
        description: `격식체(~습니다) ${hasFormalEndings}회와 해요체(~해요) ${hasInformalEndings}회가 혼용되고 있습니다. 연수원 표준 정형화를 위해 경어체 종결어미 통일을 권장합니다.`,
        suggestion: '기획 가이드: 연수원 시크립트는 격식체(~습니다) 통일을 표준으로 합니다.'
      });
    } else {
      points.push({
        type: 'tone',
        title: '어조 종결어미 통일성 양호',
        description: '문장 종결 어미가 일관되게 작성되어 수강생 전달력이 우수합니다.'
      });
    }

    // Check structural sections (도입 / 본문 / 정리)
    const hasIntro = /(도입|인트로|안녕|시작|오늘|질문)/.test(cleanText);
    const hasSummary = /(정리|요약|마무리|결론|마치겠습니다)/.test(cleanText);

    if (!hasIntro || !hasSummary) {
      points.push({
        type: 'structure',
        title: '차시 구조 구성 보완 권장',
        description: `원고 내 ${!hasIntro ? '[도입 멘트]' : ''} ${!hasSummary ? '[마무리 정리 멘트]' : ''} 단락 구분이 명확하지 않습니다. 수강 집중도를 극대화할 수 있도록 3단계 구성을 배치해 주세요.`
      });
    } else {
      points.push({
        type: 'structure',
        title: '차시 구조 체계 완비',
        description: '도입 질문 및 마무리 정리 멘트 구성이 표준 가이드에 적합하게 배치되어 있습니다.'
      });
    }

    // 2. Executive 3-line summary generation
    const summaryLines: string[] = [];
    if (lessonTitle) {
      summaryLines.push(`본 원고는 '${lessonTitle}' 주제의 학습 목표 달성을 위한 핵심 내용을 다룹니다.`);
    }

    const nonSubheadingLines = cleanText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 20 && !l.startsWith('#') && !l.startsWith('—'));

    if (nonSubheadingLines.length >= 2) {
      summaryLines.push(nonSubheadingLines[0]);
      summaryLines.push(nonSubheadingLines[Math.floor(nonSubheadingLines.length / 2)]);
    } else {
      summaryLines.push('주요 핵심 개념 및 실무 적용 방안을체계적으로 기술하였습니다.');
      summaryLines.push('차시 마무리를 위한 요약 정리 및 실습 질문이 포함되어 있습니다.');
    }

    // Overall quality score
    const overall_score = Math.min(100, Math.max(70, 95 - points.filter(p => p.type !== 'structure' || p.title.includes('보완')).length * 5));

    return {
      char_count: charCount,
      char_count_no_space: charCountNoSpace,
      word_count: wordCount,
      estimated_time: timeFormatted,
      estimated_minutes: Math.max(1, Math.round(minutes)),
      summary: summaryLines.slice(0, 3),
      proofread_points: points,
      overall_score
    };
  }

  /**
   * Compare two script version texts line-by-line (Diff Viewer)
   */
  compareScriptVersions(textV1: string, textV2: string): DiffLine[] {
    const linesV1 = (textV1 || '').split('\n').map(l => l.trim());
    const linesV2 = (textV2 || '').split('\n').map(l => l.trim());

    const diffResult: DiffLine[] = [];
    let i = 0;
    let j = 0;
    let lineNoV1 = 1;
    let lineNoV2 = 1;

    while (i < linesV1.length || j < linesV2.length) {
      const line1 = linesV1[i];
      const line2 = linesV2[j];

      if (i < linesV1.length && j < linesV2.length) {
        if (line1 === line2) {
          diffResult.push({
            type: 'unchanged',
            line_no_v1: lineNoV1++,
            line_no_v2: lineNoV2++,
            text: line1,
          });
          i++;
          j++;
        } else {
          // Check if line1 exists further in V2 (insertion in V2)
          const indexInV2 = linesV2.indexOf(line1, j);
          // Check if line2 exists further in V1 (deletion in V2)
          const indexInV1 = linesV1.indexOf(line2, i);

          if (indexInV2 !== -1 && (indexInV1 === -1 || indexInV2 - j <= indexInV1 - i)) {
            // Lines inserted in V2
            while (j < indexInV2) {
              diffResult.push({
                type: 'added',
                line_no_v2: lineNoV2++,
                text: linesV2[j],
              });
              j++;
            }
          } else if (indexInV1 !== -1) {
            // Lines deleted from V1
            while (i < indexInV1) {
              diffResult.push({
                type: 'removed',
                line_no_v1: lineNoV1++,
                text: linesV1[i],
              });
              i++;
            }
          } else {
            // Both lines are different (Replace: remove V1, add V2)
            diffResult.push({
              type: 'removed',
              line_no_v1: lineNoV1++,
              text: line1,
            });
            diffResult.push({
              type: 'added',
              line_no_v2: lineNoV2++,
              text: line2,
            });
            i++;
            j++;
          }
        }
      } else if (i < linesV1.length) {
        // Remaining lines in V1 are removed
        diffResult.push({
          type: 'removed',
          line_no_v1: lineNoV1++,
          text: linesV1[i],
        });
        i++;
      } else if (j < linesV2.length) {
        // Remaining lines in V2 are added
        diffResult.push({
          type: 'added',
          line_no_v2: lineNoV2++,
          text: linesV2[j],
        });
        j++;
      }
    }

    return diffResult;
  }
}
