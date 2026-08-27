import React from 'react';

interface Props {
  onClose: () => void;
  /** 겹쳐 뜨는 모달 사이의 앞뒤 순서 */
  zIndex?: number;
  /** 배경과 패널 사이 여백 */
  padding?: string;
  /** 패널의 최대 폭 */
  width: string;
  /** 패널의 최대 높이 */
  maxHeight?: string;
  label: string;
  children: React.ReactNode;
}

/**
 * 원고 화면 모달들이 공유하는 배경과 패널 껍데기.
 * 배경을 누르면 닫히고, 패널 안쪽 클릭은 전파되지 않는다.
 * (Esc로 닫는 처리는 화면 쪽 useEscapeKey가 맡는다)
 */
const ModalOverlay: React.FC<Props> = ({ onClose, zIndex = 50, padding = '30px', width, maxHeight = '90vh', label, children }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(17, 24, 39, 0.45)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding,
      zIndex,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      style={{
        width,
        maxWidth: '100%',
        maxHeight,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--r-2xl)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  </div>
);

export default ModalOverlay;
