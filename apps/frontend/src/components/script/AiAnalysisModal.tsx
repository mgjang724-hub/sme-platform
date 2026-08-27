import React from 'react';
import { Sparkles, X, Clock, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import ModalOverlay from './ModalOverlay';

interface ProofreadPoint {
  type: string;
  title: string;
  description: string;
  suggestion?: string;
}

export interface AiAnalysis {
  estimated_time: string;
  char_count?: number;
  char_count_no_space?: number;
  overall_score: number;
  summary?: string[];
  proofread_points?: ProofreadPoint[];
}

interface Props {
  onClose: () => void;
  loading: boolean;
  data: AiAnalysis | null;
  /** 분석 대상 버전 번호 */
  roundNo?: number;
}

/** 지적 유형에 따라 왼쪽 띠 색을 달리한다. */
function pointAccent(type: string): string {
  if (type === 'sentence_length') return '#EF4444';
  if (type === 'tone') return '#F59E0B';
  return '#10B981';
}

/** 원고 분량·가독성·맞춤법 분석 결과 모달. */
const AiAnalysisModal: React.FC<Props> = ({ onClose, loading, data, roundNo }) => (
  <ModalOverlay onClose={onClose} zIndex={60} width="min(760px, 100%)" label="AI 원고 분석 결과">
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 24px',
      borderBottom: '1px solid var(--border)', background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
    }}>
      <span style={{
        width: '40px', height: '40px', flex: 'none', borderRadius: '50%', backgroundColor: '#4F46E5',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
      }}>
        <Sparkles size={20} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#312E81' }}>✨ AI 원고 자동 검수 &amp; 요약 리포트</div>
        <div style={{ fontSize: '12px', color: '#4338CA' }}>v{roundNo} 원고 실시간 AI 가독성 및 시간 측정 분석</div>
      </div>
      <button onClick={onClose} aria-label="분석 결과 닫기" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#4338CA' }}>
        <X size={20} />
      </button>
    </div>

    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', backgroundColor: '#F8FAFC' }}>
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748B' }}>
          AI가 원고 본문의 발화 속도, 맞춤법, 어조 및 요약문을 분석 중입니다...
        </div>
      ) : data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="rgrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Clock size={28} style={{ color: '#4F46E5', flex: 'none' }} />
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>예상 강의 소요 시간</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#1E293B', marginTop: '2px' }}>
                  {data.estimated_time}
                </div>
                <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px' }}>
                  총 {data.char_count?.toLocaleString()}자 (공백 제외 {data.char_count_no_space?.toLocaleString()}자)
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <CheckCircle2 size={28} style={{ color: '#10B981', flex: 'none' }} />
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>원고 품질 정합성 점수</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#047857', marginTop: '2px' }}>
                  {data.overall_score}점 <span style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8' }}>/ 100점</span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px' }}>
                  연수원 표준 원고 가이드 충족
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} style={{ color: '#4F46E5' }} /> AI 3줄 핵심 요약
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.summary?.map((line, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                  <span style={{ color: '#4F46E5', fontWeight: 800 }}>•</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} style={{ color: '#F59E0B' }} /> AI 맞춤법 &amp; 문체 교정 리포트
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.proofread_points?.map((pt, idx) => (
                <div key={idx} style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: '8px', borderLeft: '4px solid ' + pointAccent(pt.type) }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>{pt.title}</div>
                  <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>{pt.description}</div>
                  {pt.suggestion && (
                    <div style={{ fontSize: '12px', color: '#4F46E5', marginTop: '6px', fontWeight: 600, background: '#EEF2FF', padding: '6px 10px', borderRadius: '6px' }}>
                      💡 {pt.suggestion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>

    <div style={{ padding: '14px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
      <button
        onClick={onClose}
        style={{ padding: '8px 18px', borderRadius: '8px', background: '#1E293B', color: '#fff', fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer' }}
      >
        닫기
      </button>
    </div>
  </ModalOverlay>
);

export default AiAnalysisModal;
