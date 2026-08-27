import React from 'react';
import { FileText, X } from 'lucide-react';
import ModalOverlay from './ModalOverlay';

interface Props {
  onClose: () => void;
  /** 원본 파일 경로. 제목 줄에 그대로 보여 준다. */
  fileName?: string;
  lessonNo: number;
  lessonTitle: string;
  loading: boolean;
  /** 추출한 본문. null이면 예시 본문을 대신 보여 준다. */
  text: string | null;
  onQuote: (quote: string) => void;
}

/** 제출된 원고 본문을 크게 펼쳐 읽는 모달. */
const PreviewModal: React.FC<Props> = ({ onClose, fileName, lessonNo, lessonTitle, loading, text, onQuote }) => {
  const handleMouseUp = () => {
    const selected = window.getSelection()?.toString().trim();
    if (selected && selected.length > 2) onQuote(selected);
  };

  return (
    <ModalOverlay onClose={onClose} zIndex={50} padding="40px" width="min(720px, 100%)" maxHeight="100%" label="원고 본문 미리보기">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
        <span style={{
          width: '38px', height: '38px', borderRadius: 'var(--r-md)',
          backgroundColor: 'var(--primary-tint-2)', display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center', color: 'var(--primary-hover)',
        }}>
          <FileText size={19} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14.5px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</div>
          <div style={{ fontSize: '12px', color: 'var(--fg-3)' }}>본문 실시간 미리보기 · 읽기 전용</div>
        </div>
        <button
          onClick={onClose}
          aria-label="미리보기 닫기"
          style={{
            width: '34px', height: '34px', flex: 'none',
            border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)',
          }}
        >
          <X size={17} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', backgroundColor: 'var(--bg-page)' }}>
        <div style={{
          maxWidth: 'min(600px, 100%)', margin: '0 auto',
          backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)', padding: '36px 40px', boxShadow: 'var(--shadow-xs)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '19px', fontWeight: 700, margin: '0 0 16px', color: 'var(--fg-1)' }}>
            {lessonNo}차시 — {lessonTitle}
          </h2>
          <div style={{ fontSize: '14px', lineHeight: '1.95', color: 'var(--fg-2)', whiteSpace: 'pre-wrap' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--fg-3)' }}>
                문서 본문을 실시간 추출하여 로딩 중입니다...
              </div>
            ) : text !== null ? (
              <div onMouseUp={handleMouseUp} style={{ cursor: 'text' }}>
                {text}
                <p style={{ margin: '20px 0 0', color: 'var(--fg-4)' }}>— 본문 미리보기 끝 — (문장을 드래그하여 바로 피드백을 남겨보세요)</p>
              </div>
            ) : (
              <div onMouseUp={handleMouseUp} style={{ cursor: 'text' }}>
                <p style={{ margin: '0 0 14px' }}><b>(도입 질문)</b> “여러분은 오늘 하루 어떤 수업을 설계하셨나요? 학교자율시간을 적극 활용해 본 수업 사례들을 기반으로 교육과정을 기획하고 배정해보겠습니다.”</p>
                <p style={{ margin: '0 0 12px' }}><b>[핵심 개념]</b> 학교자율시간은 교육부가 시도 교육청과 각 학교에 재량권을 주어 자율적으로 신설하는 특화 수업 시수입니다.</p>
                <p style={{ margin: '0 0 12px' }}>이 시간을 활용하여 인공지능, 예술융합, 디지털 리터러시 등 다양한 과목들을 연수 및 수업 설계로 확장할 수 있습니다.</p>
                <p style={{ margin: 0, color: 'var(--fg-4)' }}>— 본문 미리보기 끝 — (문장을 드래그하여 바로 피드백을 남겨보세요)</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button
          onClick={onClose}
          style={{
            padding: '9px 16px', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)',
            backgroundColor: 'var(--bg-card)', color: 'var(--fg-2)', fontSize: '13px', fontWeight: 700,
          }}
        >
          닫기
        </button>
      </div>
    </ModalOverlay>
  );
};

export default PreviewModal;
