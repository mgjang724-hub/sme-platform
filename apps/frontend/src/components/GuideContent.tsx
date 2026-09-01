import React from 'react';

/**
 * 안내 글 본문을 읽기 좋게 그린다.
 *
 * 기획자가 안내 관리에서 쓰는 표기만 지원한다.
 *   ### 제목   #### 소제목   - 목록   **강조**
 * 그 밖의 줄은 문단으로 그대로 둔다. 표기를 지원하지 않으면 화면에
 * "###" 같은 기호가 그대로 보이기 때문에 최소한만 해석한다.
 */

/** **강조** 만 굵게 바꾼다. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) => {
    if (chunk.startsWith('**') && chunk.endsWith('**') && chunk.length > 4) {
      return (
        <strong key={`${keyPrefix}-b${i}`} style={{ fontWeight: 700, color: 'var(--fg-1)' }}>
          {chunk.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={`${keyPrefix}-t${i}`}>{chunk}</React.Fragment>;
  });
}

const GuideContent: React.FC<{ content: string }> = ({ content }) => {
  const lines = (content || '').split('\n');
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = () => {
    if (bullets.length === 0) return;
    const items = bullets;
    bullets = [];
    blocks.push(
      <ul key={`ul-${blocks.length}`} style={{ margin: '0 0 14px', paddingLeft: '20px' }}>
        {items.map((item, i) => (
          <li key={i} style={{ margin: '0 0 6px', lineHeight: 1.8 }}>
            {renderInline(item, `li-${blocks.length}-${i}`)}
          </li>
        ))}
      </ul>,
    );
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();

    if (line.startsWith('#### ')) {
      flushBullets();
      blocks.push(
        <h3 key={idx} style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg-1)', margin: '22px 0 8px' }}>
          {line.slice(5)}
        </h3>,
      );
      return;
    }

    if (line.startsWith('### ')) {
      flushBullets();
      blocks.push(
        <h2
          key={idx}
          style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--fg-1)', margin: '28px 0 12px' }}
        >
          {line.slice(4)}
        </h2>,
      );
      return;
    }

    if (line.startsWith('- ')) {
      bullets.push(line.slice(2));
      return;
    }

    flushBullets();
    if (line.trim() === '') return;

    blocks.push(
      <p key={idx} style={{ margin: '0 0 12px', lineHeight: 1.85 }}>
        {renderInline(line, `p-${idx}`)}
      </p>,
    );
  });

  flushBullets();

  if (blocks.length === 0) {
    return (
      <p style={{ margin: 0, color: 'var(--fg-4)', fontSize: '13.5px' }}>
        아직 내용이 작성되지 않았습니다.
      </p>
    );
  }

  return <>{blocks}</>;
};

export default GuideContent;
