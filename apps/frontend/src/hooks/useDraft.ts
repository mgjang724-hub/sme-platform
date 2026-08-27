import { useCallback, useEffect, useRef, useState } from 'react';

const PREFIX = 'sme_draft:';

/**
 * 입력 내용을 localStorage에 자동 저장한다.
 * 세션 만료·새로고침·실수로 창을 닫아도 작성 중이던 글이 남는다.
 *
 * @param key   화면·필드를 구분하는 고유 키 (예: `feedback:${deliverableId}`)
 * @param delay 마지막 입력 후 저장까지 대기 시간(ms)
 */
export function useDraft(key: string | null, delay = 400) {
  const storageKey = key ? `${PREFIX}${key}` : null;
  const [value, setValue] = useState('');
  /** 이전에 저장해 둔 초안을 복원했는지 여부 (안내 문구 노출용) */
  const [restored, setRestored] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 키가 정해지면 저장된 초안을 불러온다.
  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setValue(saved);
        setRestored(true);
        return;
      }
    } catch {
      // 브라우저가 저장소를 막아둔 경우 초안 기능만 비활성화된다.
    }
    setValue('');
    setRestored(false);
  }, [storageKey]);

  // 입력이 멈추면 저장한다.
  useEffect(() => {
    if (!storageKey) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        if (value.trim()) {
          localStorage.setItem(storageKey, value);
        } else {
          localStorage.removeItem(storageKey);
        }
      } catch {
        // 저장 실패는 조용히 무시한다. 입력 자체를 막지는 않는다.
      }
    }, delay);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, storageKey, delay]);

  /** 전송에 성공했을 때 호출한다. 저장된 초안까지 함께 지운다. */
  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setValue('');
    setRestored(false);
    if (!storageKey) return;
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // 무시
    }
  }, [storageKey]);

  /** 복원 안내 문구만 감춘다. 내용은 그대로 둔다. */
  const acknowledgeRestore = useCallback(() => setRestored(false), []);

  return { value, setValue, clear, restored, acknowledgeRestore };
}

/** 사용자가 직접 로그아웃할 때 남아 있는 모든 초안을 정리한다. */
export function clearAllDrafts() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // 무시
  }
}
