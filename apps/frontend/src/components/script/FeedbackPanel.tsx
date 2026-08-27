import React from 'react';
import { MessageSquare, Target, Clock, CheckCircle2, Send } from 'lucide-react';

export interface Feedback {
  feedback_id: string;
  content: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REOPENED' | 'FORCE_CLOSED';
  created_at: string;
  due_date: string | null;
  /** 'QUOTE'면 location_value에 원고에서 인용한 문장이 들어 있다. */
  location_type?: string | null;
  location_value?: string | null;
  creator: {
    user_id: string;
    name: string;
    global_role: string;
  };
}

interface Props {
  /** 이미 필터가 적용된 목록 */
  feedbacks: Feedback[];
  unresolvedCount: number;
  filterUnresolvedOnly: boolean;
  onToggleFilter: () => void;
  viewRole: 'PLANNER' | 'SME';
  onResolve: (feedbackId: string) => void;
  /** 인용 칩을 눌렀을 때 원고 본문에서 해당 위치를 강조한다. */
  onFocusQuote: (quote: string) => void;

  // 작성 영역
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  /** 이 피드백에 붙여 보낼 인용문 */
  attachedQuote: string | null;
  onDetachQuote: () => void;
  /** 임시저장해 둔 초안을 복원했는지 여부 */
  restored: boolean;
  onAckRestore: () => void;

  // 배치
  hidden: boolean;
  width: string;
  showBorder: boolean;
}

/** 원고에 달린 피드백을 읽고 새로 남기는 오른쪽 패널. */
const FeedbackPanel: React.FC<Props> = ({
  feedbacks, unresolvedCount, filterUnresolvedOnly, onToggleFilter,
  viewRole, onResolve, onFocusQuote,
  value, onChange, onSubmit, submitting,
  attachedQuote, onDetachQuote, restored, onAckRestore,
  hidden, width, showBorder,
}) => {
  const canSend = !submitting && value.trim().length > 0;

  return (
    <div style={{
      width,
      flexShrink: 0,
      borderLeft: showBorder ? '1px solid var(--border)' : 'none',
      background: 'var(--bg-card)',
      display: hidden ? 'none' : 'flex',
      flexDirection: 'column',
      minHeight: 0,
    }}>
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
      }}>
        <MessageSquare size={18} style={{ color: 'var(--primary-hover)', flex: 'none' }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700 }}>피드백 &amp; 대화</span>
        {unresolvedCount > 0 && (
          <span style={{
            fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
            backgroundColor: 'var(--error-bg)', color: 'var(--error-fg)',
          }}>
            미반영 {unresolvedCount}
          </span>
        )}
        <button
          onClick={onToggleFilter}
          aria-pressed={filterUnresolvedOnly}
          style={{
            marginLeft: 'auto', fontSize: '11px', fontWeight: 700,
            color: filterUnresolvedOnly ? 'var(--primary-hover)' : 'var(--fg-3)',
            border: '1px solid ' + (filterUnresolvedOnly ? 'var(--primary)' : 'var(--border-strong)'),
            borderRadius: 'var(--r-pill)', padding: '3px 8px',
            background: filterUnresolvedOnly ? 'var(--primary-tint)' : 'var(--bg-card)',
            cursor: 'pointer',
          }}
        >
          {filterUnresolvedOnly ? '✓ 미반영만 보기' : '미반영만 보기'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {feedbacks.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--fg-4)', fontSize: '12.5px' }}>
            {filterUnresolvedOnly ? '미반영된 피드백이 없습니다. 모든 피드백이 완료되었습니다!' : '등록된 피드백이나 댓글이 없습니다.'}
          </div>
        ) : (
          feedbacks.map((f) => {
            const isCreatorPlanner = f.creator.global_role === 'PLANNER' || f.creator.global_role === 'ADMIN';
            return (
              <div key={f.feedback_id} style={{ display: 'flex', gap: '10px' }}>
                <span style={{
                  width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                  backgroundColor: isCreatorPlanner ? '#FFD8C9' : '#D5E3F2',
                  color: isCreatorPlanner ? '#B7521F' : '#245C92',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700,
                }}>
                  {f.creator.name.charAt(0)}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-1)' }}>{f.creator.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--fg-4)' }}>
                      {new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {f.location_value && (
                    <button
                      type="button"
                      onClick={() => onFocusQuote(f.location_value as string)}
                      title="원고에서 이 부분 보기"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px', width: '100%',
                        marginTop: '6px', padding: '7px 10px',
                        borderLeft: '3px solid var(--warning)',
                        borderRadius: '0 var(--r-sm) var(--r-sm) 0',
                        backgroundColor: 'var(--warning-bg)',
                        textAlign: 'left',
                      }}
                    >
                      <Target size={12} strokeWidth={2.2} color="var(--warning-fg)" aria-hidden="true" style={{ flex: 'none' }} />
                      <span style={{ flex: 1, minWidth: 0, fontSize: '11.5px', color: 'var(--warning-fg)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        “{f.location_value}”
                      </span>
                      <span style={{ flex: 'none', fontSize: '11px', fontWeight: 800, color: 'var(--warning-fg)' }}>원고에서 보기</span>
                    </button>
                  )}

                  <div style={{
                    marginTop: '6px', padding: '10px 12px', borderRadius: 'var(--r-md)',
                    backgroundColor: isCreatorPlanner ? '#FFF7F5' : 'var(--bg-page)',
                    border: '1px solid ' + (isCreatorPlanner ? '#FBD9D0' : 'var(--border)'),
                    fontSize: '13px', color: 'var(--fg-2)', lineHeight: 1.6,
                  }}>
                    {f.content}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                    {f.status === 'RESOLVED' ? (
                      <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '999px', backgroundColor: 'var(--success-bg)', color: 'var(--success-fg)' }}>
                        반영완료
                      </span>
                    ) : (
                      <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '999px', backgroundColor: 'var(--error-bg)', color: 'var(--error-fg)' }}>
                        미반영
                      </span>
                    )}

                    {/* 강사가 수정을 마쳤을 때 스스로 표시한다 */}
                    {viewRole === 'SME' && (f.status === 'OPEN' || f.status === 'REOPENED') && (
                      <button
                        onClick={() => onResolve(f.feedback_id)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '4px 10px', borderRadius: '999px',
                          backgroundColor: 'var(--primary)', color: '#fff',
                          fontSize: '11px', fontWeight: 800, border: 'none', cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(79, 70, 229, 0.2)',
                        }}
                      >
                        <CheckCircle2 size={12} /> 반영 완료
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
        style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}
      >
        {attachedQuote && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px',
            padding: '8px 11px', borderLeft: '3px solid var(--warning)',
            borderRadius: '0 var(--r-sm) var(--r-sm) 0', backgroundColor: 'var(--warning-bg)',
          }}>
            <Target size={13} strokeWidth={2.2} color="var(--warning-fg)" aria-hidden="true" style={{ flex: 'none' }} />
            <span style={{ flex: 1, minWidth: 0, fontSize: '11.5px', fontWeight: 600, color: 'var(--warning-fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              “{attachedQuote}” 부분에 대한 피드백
            </span>
            <button
              type="button"
              onClick={onDetachQuote}
              aria-label="인용 해제"
              style={{ flex: 'none', fontSize: '11px', fontWeight: 800, color: 'var(--warning-fg)' }}
            >
              해제
            </button>
          </div>
        )}

        {restored && (
          <div
            role="status"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px',
              padding: '8px 11px', borderRadius: 'var(--r-sm)',
              backgroundColor: 'var(--info-bg)', color: 'var(--info-fg)', fontSize: '12px', fontWeight: 700,
            }}
          >
            <Clock size={13} strokeWidth={2.2} aria-hidden="true" />
            <span style={{ flex: 1 }}>작성 중이던 내용을 불러왔습니다.</span>
            <button
              type="button"
              onClick={onAckRestore}
              style={{ color: 'inherit', fontSize: '12px', fontWeight: 700, textDecoration: 'underline' }}
            >
              확인
            </button>
          </div>
        )}

        <div style={{ border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', padding: '10px 12px', backgroundColor: 'var(--bg-card)' }}>
          <label htmlFor="feedback-input-area" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
            {viewRole === 'PLANNER' ? '피드백 코멘트' : '기획자에게 보낼 의견'}
          </label>
          <textarea
            id="feedback-input-area"
            placeholder={viewRole === 'PLANNER' ? '피드백 코멘트를 입력하세요...' : '기획자에게 답변이나 의견을 적어보세요...'}
            rows={2}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              // Ctrl(⌘) + Enter 로 바로 전송한다.
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                onSubmit();
              }
            }}
            required
            style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', fontSize: '13px', background: 'none' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <span style={{ marginRight: 'auto', fontSize: '11.5px', color: 'var(--fg-4)' }}>
              Ctrl + Enter 로 전송 · 작성 중인 내용은 자동 저장됩니다
            </span>
            <button
              type="submit"
              disabled={!canSend}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: 'var(--r-sm)',
                background: canSend ? 'var(--primary)' : 'var(--border-strong)',
                color: '#fff', fontSize: '12.5px', fontWeight: 700,
                cursor: canSend ? 'pointer' : 'not-allowed',
              }}
            >
              <Send size={13} /> {submitting ? '전송 중…' : '전송'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FeedbackPanel;
