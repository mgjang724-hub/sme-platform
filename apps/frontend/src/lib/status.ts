/**
 * 원고(산출물) 상태를 화면에 보여줄 한글 라벨로 바꾼다.
 * 과정 상세·내 작업 화면에서 쓰던 어휘를 그대로 따른다.
 * 괄호 안은 "지금 공을 쥔 사람"이다.
 */
export interface StatusChip {
  label: string;
  short: string;
  bg: string;
  fg: string;
  dot: string;
}

export function getScriptStatus(status: string | undefined | null): StatusChip {
  switch (status) {
    case 'APPROVED':
      return { label: '최종확정 (완료)', short: '최종확정', bg: 'var(--success-bg)', fg: 'var(--success-fg)', dot: 'var(--success)' };
    case 'SUBMITTED':
    case 'IN_REVIEW':
      return { label: '검수대기 (기획자)', short: '검수대기', bg: 'var(--info-bg)', fg: 'var(--info-fg)', dot: 'var(--info)' };
    case 'REVISION_REQUESTED':
      return { label: '수정요청 (강사)', short: '수정요청', bg: 'var(--error-bg)', fg: 'var(--error-fg)', dot: 'var(--error)' };
    default:
      return { label: '작성대기 (강사)', short: '작성대기', bg: 'var(--primary-tint-2)', fg: 'var(--primary-hover)', dot: 'var(--fg-4)' };
  }
}

/**
 * 차시에 딸린 산출물에서 실제 원고 상태를 계산한다.
 * Lesson.derived_status 컬럼은 차시 생성 시점 값에서 갱신되지 않으므로 신뢰할 수 없다.
 */
export function resolveLessonStatus(lesson: { deliverables?: any[]; derived_status?: string } | null | undefined): string {
  const script = lesson?.deliverables?.find((d: any) => d.deliverable_type === 'SCRIPT');
  return script?.current_status || 'NOT_SUBMITTED';
}
