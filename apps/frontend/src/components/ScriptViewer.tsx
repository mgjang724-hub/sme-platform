import React, { useEffect, useRef } from 'react';
import { MessageSquarePlus } from 'lucide-react';

/**
 * 원고 본문에서 인용문의 위치를 찾는다.
 * 공백이 다르게 저장된 경우도 찾을 수 있도록 두 단계로 시도한다.
 */
export function findQuoteRange(text: string, quote: string): [number, number] | null {
  const q = quote.trim();
  if (!q) return null;

  const direct = text.indexOf(q);
  if (direct >= 0) return [direct, direct + q.length];

  const pattern = q
    .split(/\s+/)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('\\s+');
  const m = new RegExp(pattern).exec(text);
  return m ? [m.index, m.index + m[0].length] : null;
}

interface Props {
  text: string | null;
  loading: boolean;
  /** 강조해서 보여줄 인용문. 바뀌면 해당 위치로 자동 스크롤한다. */
  highlight: string | null;
  /** 본문에서 문장을 드래그했을 때 호출된다. */
  onSelectQuote: (quote: string) => void;
  /** 본문을 아직 읽어오지 못했을 때 대신 보여줄 내용 */
  fallback?: React.ReactNode;
}

const ScriptViewer: React.FC<Props> = ({ text, loading, highlight, onSelectQuote, fallback }) => {
  const markRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 인용문이 지정되면 해당 위치로 부드럽게 이동한다.
  useEffect(() => {
    if (highlight && markRef.current) {
      markRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlight, text]);

  const handleMouseUp = () => {
    const selected = window.getSelection()?.toString().trim();
    if (selected && selected.length > 2) onSelectQuote(selected);
  };

  if (loading) {
    return (
      <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--fg-3)', fontSize: '13px' }}>
        원고 본문을 불러오는 중입니다…
      </div>
    );
  }

  if (text === null) {
    return <div onMouseUp={handleMouseUp} style={{ cursor: 'text' }}>{fallback}</div>;
  }

  const range = highlight ? findQuoteRange(text, highlight) : null;

  return (
    <div
      ref={scrollRef}
      onMouseUp={handleMouseUp}
      style={{
        cursor: 'text',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontSize: '13.5px',
        lineHeight: 1.95,
        color: 'var(--fg-2)',
      }}
    >
      {range ? (
        <>
          {text.slice(0, range[0])}
          <mark
            ref={markRef}
            style={{
              backgroundColor: 'var(--warning-bg)',
              color: 'var(--fg-1)',
              boxShadow: 'inset 0 -2px 0 var(--warning)',
              borderRadius: '2px',
              padding: '1px 0',
            }}
          >
            {text.slice(range[0], range[1])}
          </mark>
          {text.slice(range[1])}
        </>
      ) : (
        text
      )}
    </div>
  );
};

/** 드래그한 문장을 피드백으로 남길지 묻는 안내 바. */
export const QuotePrompt: React.FC<{ quote: string; onUse: () => void; onDismiss: () => void }> = ({ quote, onUse, onDismiss }) => (
  <div
    style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '10px 12px', marginBottom: '10px',
      backgroundColor: 'var(--primary-tint)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)',
    }}
  >
    <MessageSquarePlus size={15} strokeWidth={2.1} color="var(--primary-hover)" aria-hidden="true" style={{ flex: 'none' }} />
    <span style={{ flex: 1, minWidth: 0, fontSize: '12px', color: 'var(--fg-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      “{quote}”
    </span>
    <button
      type="button"
      onClick={onUse}
      style={{ flex: 'none', padding: '5px 11px', borderRadius: 'var(--r-sm)', backgroundColor: 'var(--primary)', color: '#fff', fontSize: '11.5px', fontWeight: 800 }}
    >
      이 문장에 피드백
    </button>
    <button
      type="button"
      onClick={onDismiss}
      aria-label="인용 취소"
      style={{ flex: 'none', padding: '5px 8px', fontSize: '11.5px', fontWeight: 700, color: 'var(--fg-3)' }}
    >
      취소
    </button>
  </div>
);

export default ScriptViewer;
