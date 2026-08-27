import { useEffect } from 'react';

/**
 * 모달이 열려 있는 동안 Esc 키로 닫을 수 있게 한다.
 * @param active 모달이 열려 있는지 여부
 * @param onClose Esc를 눌렀을 때 실행할 닫기 함수
 */
export function useEscapeKey(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onClose]);
}
