import { useEffect, useState } from 'react';

/** 화면 폭 기준점. 인라인 스타일에서도 쓸 수 있도록 값으로 둔다. */
export const BREAKPOINT = {
  /** 이 아래는 휴대폰 */
  mobile: 768,
  /** 이 아래는 3열을 나란히 놓기 어렵다 */
  wide: 1100,
} as const;

/**
 * CSS 미디어 쿼리를 구독한다.
 * 이 프로젝트는 대부분 인라인 스타일을 쓰기 때문에, 레이아웃 자체가 바뀌는
 * 지점은 CSS가 아니라 이 훅으로 판단한다.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const sync = () => setMatches(mql.matches);

    sync();

    // addEventListener를 지원하지 않는 구형 사파리(14 미만)도 함께 처리한다.
    if (mql.addEventListener) {
      mql.addEventListener('change', sync);
    } else {
      (mql as any).addListener(sync);
    }
    // 일부 환경(임베디드 미리보기 등)은 미디어 쿼리 변경 이벤트를 주지 않는다.
    window.addEventListener('resize', sync);
    window.addEventListener('orientationchange', sync);

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', sync);
      } else {
        (mql as any).removeListener(sync);
      }
      window.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', sync);
    };
  }, [query]);

  return matches;
}

/** 휴대폰 폭(768px 미만) 여부 */
export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${BREAKPOINT.mobile - 1}px)`);
}

/** 3열을 나란히 두기 어려운 폭(1100px 미만) 여부 — 태블릿과 휴대폰을 모두 포함한다 */
export function useIsNarrow(): boolean {
  return useMediaQuery(`(max-width: ${BREAKPOINT.wide - 1}px)`);
}
