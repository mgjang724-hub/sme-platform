import React from 'react';
import { GitCompare, X } from 'lucide-react';
import ModalOverlay from './ModalOverlay';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  line_no_v1?: number;
  line_no_v2?: number;
  text: string;
}

export interface DiffResult {
  v1?: { version_id?: string; round_no?: number };
  v2?: { version_id?: string; round_no?: number };
  diff?: DiffLine[];
}

interface Props {
  onClose: () => void;
  loading: boolean;
  data: DiffResult | null;
}

/** 두 원고 버전의 문장 단위 차이를 대조해 보여 주는 모달. */
const DiffModal: React.FC<Props> = ({ onClose, loading, data }) => (
  <ModalOverlay onClose={onClose} zIndex={60} width="min(840px, 100%)" label="원고 버전 비교">
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 24px', borderBottom: '1px solid var(--border)', background: '#F8FAFC' }}>
      <GitCompare size={20} style={{ color: 'var(--primary)', flex: 'none' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--fg-1)' }}>
          🔍 원고 버전 변경점 대조 (v{data?.v1?.round_no || 1} ↔ v{data?.v2?.round_no || 2})
        </div>
        <div style={{ fontSize: '12px', color: 'var(--fg-3)' }}>
          이전 버전 대비 신규 수정/추가된 문장을 대조합니다.
        </div>
      </div>
      <button onClick={onClose} aria-label="버전 비교 닫기" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--fg-3)' }}>
        <X size={20} />
      </button>
    </div>

    <div style={{
      flex: 1, overflowY: 'auto', padding: '20px 24px',
      fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.7',
      backgroundColor: '#0F172A', color: '#E2E8F0',
    }}>
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#94A3B8' }}>
          두 버전 간의 차이점(Diff)을 파싱하여 비교 중입니다...
        </div>
      ) : data?.diff ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {data.diff.map((line, idx) => {
            const isAdded = line.type === 'added';
            const isRemoved = line.type === 'removed';
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  padding: '2px 8px',
                  backgroundColor: isAdded ? 'rgba(16, 185, 129, 0.2)' : isRemoved ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                  color: isAdded ? '#34D399' : isRemoved ? '#F87171' : '#CBD5E1',
                  borderLeft: '3px solid ' + (isAdded ? '#10B981' : isRemoved ? '#EF4444' : 'transparent'),
                }}
              >
                <span style={{ width: '40px', color: '#64748B', userSelect: 'none', flexShrink: 0 }}>
                  {line.line_no_v1 || ''}
                </span>
                <span style={{ width: '40px', color: '#64748B', userSelect: 'none', flexShrink: 0 }}>
                  {line.line_no_v2 || ''}
                </span>
                <span style={{ width: '20px', fontWeight: 800, userSelect: 'none', flexShrink: 0 }}>
                  {isAdded ? '+' : isRemoved ? '-' : ' '}
                </span>
                <span style={{ textDecoration: isRemoved ? 'line-through' : 'none', flex: 1, whiteSpace: 'pre-wrap' }}>
                  {line.text}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>

    <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', background: '#F8FAFC' }}>
      <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
        <span style={{ color: '#059669', fontWeight: 700 }}>+ 추가된 문장</span>
        <span style={{ color: '#DC2626', fontWeight: 700 }}>- 삭제된 문장</span>
      </div>
      <button
        onClick={onClose}
        style={{ padding: '8px 18px', borderRadius: '8px', background: '#1E293B', color: '#fff', fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer' }}
      >
        닫기
      </button>
    </div>
  </ModalOverlay>
);

export default DiffModal;
