import React from 'react';

interface Props {
  onCancel: () => void;
  onConfirm: () => void;
  /** 저작권 동의 체크 여부. 체크해야 제출 버튼이 열린다. */
  acknowledged: boolean;
  onAcknowledgedChange: (next: boolean) => void;
  /** 함께 올라가는 파일 이름 (링크 제출이면 비워 둔다) */
  fileName?: string;
}

/** 제출 직전에 되돌릴 수 없음을 알리고 저작권 동의를 받는 모달. */
const SubmitConfirmModal: React.FC<Props> = ({ onCancel, onConfirm, acknowledged, onAcknowledgedChange, fileName }) => (
  <div
    onClick={onCancel}
    style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 1000,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label="원고 제출 확인"
      style={{
        background: 'var(--bg-card)',
        padding: '24px 32px',
        borderRadius: 'var(--r-lg)',
        width: 'min(400px, 100%)',
        maxHeight: '100%',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: 'var(--fg-1)' }}>원고 제출 확인</h3>

      {fileName && (
        <div style={{
          marginBottom: '14px', padding: '9px 12px', borderRadius: 'var(--r-md)',
          backgroundColor: 'var(--primary-tint)', fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-1)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {fileName}
        </div>
      )}

      <p style={{ margin: '0 0 24px', fontSize: '14px', color: 'var(--fg-2)', lineHeight: '1.5' }}>
        제출 후에는 기획자가 반려하기 전까지 원고를 직접 수정할 수 없습니다.<br />
        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>정말로 제출하시겠습니까?</span>
      </p>

      <div style={{ marginBottom: '24px', padding: '12px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => onAcknowledgedChange(e.target.checked)}
            style={{ marginTop: '2px', flex: 'none' }}
          />
          <span style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.4' }}>
            <b style={{ display: 'block', marginBottom: '4px', color: 'var(--fg-1)' }}>저작권·초상권을 확인했습니다 (필수)</b>
            원고와 부속 자료에 들어간 타인의 이미지·영상·글에 대해 사용 허가를 받았으며, 문제가 생기면 제출자에게 책임이 있음에 동의합니다.
          </span>
        </label>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button
          onClick={onCancel}
          style={{ padding: '10px 16px', border: '1px solid var(--border)', background: 'var(--bg-card)', borderRadius: 'var(--r-md)', cursor: 'pointer' }}
        >
          취소
        </button>
        <button
          onClick={onConfirm}
          disabled={!acknowledged}
          style={{
            padding: '10px 16px', border: 'none',
            background: acknowledged ? 'var(--primary)' : 'var(--fg-4)',
            color: '#fff', borderRadius: 'var(--r-md)',
            cursor: acknowledged ? 'pointer' : 'not-allowed', fontWeight: 700,
          }}
        >
          확인 및 제출
        </button>
      </div>
    </div>
  </div>
);

export default SubmitConfirmModal;
