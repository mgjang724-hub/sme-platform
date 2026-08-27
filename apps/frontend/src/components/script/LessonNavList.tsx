import React from 'react';
import { getScriptStatus, resolveLessonStatus } from '../../lib/status';
import { MOBILE_BAR_HEIGHT } from '../AppSidebar';

export interface LessonNavItem {
  lesson_id: string;
  lesson_no: number;
  title: string;
  deliverables?: any[];
}

interface Props {
  lessons: LessonNavItem[];
  /** 지금 보고 있는 차시 */
  currentLessonId?: string;
  onSelect: (lessonId: string) => void;
  /** 휴대폰에서는 본문 위에 겹쳐 띄우고, 넓은 화면에서는 왼쪽에 붙인다. */
  isMobile: boolean;
  onDismiss: () => void;
}

/** 같은 과정의 다른 차시로 옮겨 다니는 목록. */
const LessonNavList: React.FC<Props> = ({ lessons, currentLessonId, onSelect, isMobile, onDismiss }) => (
  <>
    {isMobile && (
      <div
        onClick={onDismiss}
        style={{ position: 'fixed', inset: 0, zIndex: 800, backgroundColor: 'rgba(17, 24, 39, 0.42)' }}
        aria-hidden="true"
      />
    )}
    <nav
      aria-label="차시 목록"
      style={{
        width: isMobile ? 'min(260px, 80vw)' : '236px',
        flexShrink: 0,
        borderRight: '1px solid var(--border)',
        background: 'var(--bg-card)',
        overflowY: 'auto',
        padding: '16px 12px',
        ...(isMobile ? {
          position: 'fixed', top: MOBILE_BAR_HEIGHT, bottom: 0, left: 0, zIndex: 810,
          boxShadow: 'var(--shadow-lg)',
        } : {}),
      }}
    >
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--fg-4)', padding: '0 8px 8px' }}>
        차시 리스트 · {lessons.length}
      </div>

      {lessons.map((ch) => {
        const isCur = ch.lesson_id === currentLessonId;
        const status = getScriptStatus(resolveLessonStatus(ch));
        return (
          <button
            key={ch.lesson_id}
            type="button"
            onClick={() => onSelect(ch.lesson_id)}
            aria-current={isCur ? 'page' : undefined}
            className="chap"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '11px 10px',
              borderRadius: 'var(--r-md)',
              cursor: 'pointer',
              backgroundColor: isCur ? 'var(--primary-tint)' : 'transparent',
              marginBottom: '2px',
              textAlign: 'left',
            }}
          >
            <span
              aria-hidden="true"
              style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, backgroundColor: status.dot }}
            />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: isCur ? 700 : 500,
                color: isCur ? 'var(--primary-hover)' : 'var(--fg-1)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {ch.lesson_no}차시 — {ch.title}
              </span>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--fg-4)', marginTop: '2px' }}>
                {status.label}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  </>
);

export default LessonNavList;
