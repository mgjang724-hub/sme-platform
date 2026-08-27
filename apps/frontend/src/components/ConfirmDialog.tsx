import React, { useEffect, useRef } from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';

export interface ConfirmOptions {
  title: string;
  /** 줄바꿈(\n)으로 구분하면 문단으로 나뉘어 표시된다. */
  message?: string;
  /** 되돌릴 수 없는 작업이면 'danger'. 확인 버튼이 빨간색으로 바뀐다. */
  tone?: 'default' | 'danger';
  confirmLabel?: string;
  cancelLabel?: string;
  /** 체크해야만 확인 버튼이 활성화되는 동의 문구. */
  acknowledgeLabel?: string;
}

interface Props {
  options: ConfirmOptions;
  onResolve: (ok: boolean) => void;
}

const ConfirmDialog: React.FC<Props> = ({ options, onResolve }) => {
  const { title, message, tone = 'default', confirmLabel = '확인', cancelLabel = '취소', acknowledgeLabel } = options;
  const [acknowledged, setAcknowledged] = React.useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const isDanger = tone === 'danger';
  const blocked = Boolean(acknowledgeLabel) && !acknowledged;

  useEffect(() => {
    confirmRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onResolve(false);
      }
      if (e.key === 'Enter' && !blocked && document.activeElement?.tagName !== 'BUTTON') {
        e.preventDefault();
        onResolve(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onResolve, blocked]);

  const paragraphs = (message || '').split('\n').filter((line) => line.trim() !== '');

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onResolve(false);
      }}
    >
      <div className="dialog-panel" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <div style={{ display: 'flex', gap: '13px', alignItems: 'flex-start' }}>
          <span
            aria-hidden="true"
            style={{
              flex: 'none', width: '38px', height: '38px', borderRadius: 'var(--r-md)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: isDanger ? 'var(--error-bg)' : 'var(--primary-tint)',
              color: isDanger ? 'var(--error-fg)' : 'var(--primary-hover)',
            }}
          >
            {isDanger ? <AlertTriangle size={19} strokeWidth={2.2} /> : <HelpCircle size={19} strokeWidth={2.2} />}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 id="confirm-title" style={{ margin: '5px 0 0', fontSize: '17px', fontWeight: 800, color: 'var(--fg-1)', lineHeight: 1.4 }}>
              {title}
            </h2>
            {paragraphs.length > 0 && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {paragraphs.map((line, i) => (
                  <p key={i} style={{ margin: 0, fontSize: '13.5px', color: 'var(--fg-2)', lineHeight: 1.65, wordBreak: 'keep-all' }}>
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {acknowledgeLabel && (
          <label
            style={{
              display: 'flex', alignItems: 'center', gap: '9px', marginTop: '16px', padding: '11px 13px',
              backgroundColor: 'var(--bg-sunken)', borderRadius: 'var(--r-md)', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600, color: 'var(--fg-2)', lineHeight: 1.5,
            }}
          >
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              style={{ width: '15px', height: '15px', accentColor: 'var(--primary)', flex: 'none', cursor: 'pointer' }}
            />
            {acknowledgeLabel}
          </label>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
          <button
            type="button"
            onClick={() => onResolve(false)}
            style={{
              padding: '9px 18px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-strong)',
              backgroundColor: 'var(--bg-card)', color: 'var(--fg-2)', fontSize: '13.5px', fontWeight: 700,
            }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            disabled={blocked}
            onClick={() => onResolve(true)}
            style={{
              padding: '9px 18px', borderRadius: 'var(--r-md)', border: 'none',
              backgroundColor: blocked ? 'var(--border-strong)' : isDanger ? 'var(--error)' : 'var(--primary)',
              color: '#fff', fontSize: '13.5px', fontWeight: 700,
              cursor: blocked ? 'not-allowed' : 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
