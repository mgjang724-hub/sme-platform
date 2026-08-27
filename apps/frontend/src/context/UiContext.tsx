import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import ToastStack, { type ToastItem, type ToastKind } from '../components/ToastStack';
import ConfirmDialog, { type ConfirmOptions } from '../components/ConfirmDialog';

type ToastFn = (message: string, detail?: string) => void;

interface UiContextType {
  toast: {
    success: ToastFn;
    error: ToastFn;
    info: ToastFn;
  };
  /** window.confirm 대체. 사용자가 확인을 누르면 true를 반환한다. */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const UiContext = createContext<UiContextType | undefined>(undefined);

const DURATION: Record<ToastKind, number> = {
  success: 3500,
  info: 4000,
  error: 6000,
};

export const UiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<{ options: ConfirmOptions; resolve: (ok: boolean) => void } | null>(null);
  const nextId = useRef(1);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((kind: ToastKind, message: string, detail?: string) => {
    const id = nextId.current++;
    setToasts((prev) => {
      const next = [...prev, { id, kind, message, detail }];
      // 화면을 가리지 않도록 최근 4개만 유지한다.
      return next.slice(-4);
    });
    timers.current.set(id, setTimeout(() => dismiss(id), DURATION[kind]));
  }, [dismiss]);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ options, resolve });
    });
  }, []);

  const handleConfirmResolve = useCallback((ok: boolean) => {
    setConfirmState((prev) => {
      prev?.resolve(ok);
      return null;
    });
  }, []);

  const value = useMemo<UiContextType>(() => ({
    toast: {
      success: (message, detail) => push('success', message, detail),
      error: (message, detail) => push('error', message, detail),
      info: (message, detail) => push('info', message, detail),
    },
    confirm,
  }), [push, confirm]);

  return (
    <UiContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
      {confirmState && <ConfirmDialog options={confirmState.options} onResolve={handleConfirmResolve} />}
    </UiContext.Provider>
  );
};

export const useUi = () => {
  const context = useContext(UiContext);
  if (context === undefined) {
    throw new Error('useUi must be used within a UiProvider');
  }
  return context;
};
