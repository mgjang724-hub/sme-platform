import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
  /** 보조 설명. 본문보다 작게 한 줄 더 노출된다. */
  detail?: string;
}

const TONE: Record<ToastKind, { bg: string; fg: string; bar: string; Icon: typeof Info }> = {
  success: { bg: 'var(--success-bg)', fg: 'var(--success-fg)', bar: 'var(--success)', Icon: CheckCircle2 },
  error: { bg: 'var(--error-bg)', fg: 'var(--error-fg)', bar: 'var(--error)', Icon: AlertCircle },
  info: { bg: 'var(--info-bg)', fg: 'var(--info-fg)', bar: 'var(--info)', Icon: Info },
};

interface Props {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

const ToastStack: React.FC<Props> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" aria-live="polite" aria-relevant="additions">
      {toasts.map((t) => {
        const tone = TONE[t.kind];
        const Icon = tone.Icon;
        return (
          <div
            key={t.id}
            className="toast-item"
            role={t.kind === 'error' ? 'alert' : 'status'}
            style={{ backgroundColor: tone.bg, color: tone.fg }}
          >
            <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: tone.bar }} />
            <Icon size={18} strokeWidth={2.2} style={{ flex: 'none', marginTop: '1px' }} aria-hidden="true" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, lineHeight: 1.45, wordBreak: 'break-word' }}>{t.message}</p>
              {t.detail && (
                <p style={{ margin: '3px 0 0', fontSize: '12.5px', fontWeight: 500, opacity: 0.85, lineHeight: 1.45, wordBreak: 'break-word' }}>
                  {t.detail}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              aria-label="알림 닫기"
              style={{ flex: 'none', display: 'inline-flex', padding: '2px', margin: '-2px -2px 0 0', borderRadius: 'var(--r-xs)', color: 'inherit', opacity: 0.6 }}
            >
              <X size={15} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastStack;
