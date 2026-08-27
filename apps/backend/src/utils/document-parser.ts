import AdmZip from 'adm-zip';

/** XML 엔티티를 원래 문자로 되돌린다. (&amp;lt; 처럼 두 번 인코딩된 경우까지) */
function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    // &amp; 는 다른 엔티티를 되돌린 뒤에 처리해야 이중 인코딩이 풀린다.
    .replace(/&amp;/g, '&');
}

/**
 * 문서 XML에서 문단 단위로 본문을 뽑는다.
 *
 * 워드와 한글은 한 문장을 여러 텍스트 조각으로 나눠 저장한다.
 * (글꼴이 바뀌거나 맞춤법 검사가 들어간 지점에서 갈라진다)
 * 그래서 조각은 그대로 이어 붙이고, 줄바꿈은 문단 경계에서만 넣는다.
 *
 * @param paragraphTag 문단 태그 (docx: w:p, hwpx: hp:p)
 * @param textTag      텍스트 조각 태그 (docx: w:t, hwpx: hp:t)
 * @param breakTag     문단 안 줄바꿈 태그 (docx: w:br, hwpx: hp:lineBreak)
 */
function extractParagraphs(xml: string, paragraphTag: string, textTag: string, breakTag: string): string {
  const paragraphRe = new RegExp(
    `<${paragraphTag}(?:\\s[^>]*)?(?:/>|>([\\s\\S]*?)</${paragraphTag}>)`,
    'g',
  );
  const textRe = new RegExp(`<${textTag}(?:\\s[^>]*)?>([\\s\\S]*?)</${textTag}>`, 'g');
  const breakRe = new RegExp(`<${breakTag}(?:\\s[^>]*)?/?>`, 'g');

  const paragraphs: string[] = [];
  let paragraph: RegExpExecArray | null;

  while ((paragraph = paragraphRe.exec(xml)) !== null) {
    const inner = paragraph[1];
    if (!inner) {
      // 빈 문단. 문단 사이 간격으로만 의미가 있다.
      paragraphs.push('');
      continue;
    }

    // 문단 안의 줄바꿈은 지켜 준다.
    const withBreaks = inner.replace(breakRe, '\n');

    let line = '';
    let piece: RegExpExecArray | null;
    textRe.lastIndex = 0;
    while ((piece = textRe.exec(withBreaks)) !== null) {
      line += piece[1];
    }

    // 텍스트 조각 사이에 남은 태그(<w:tab/> 등)를 정리한다.
    line = decodeEntities(line.replace(/<[^>]+>/g, ''));
    paragraphs.push(line);
  }

  return paragraphs
    .join('\n')
    // 빈 문단이 세 줄 이상 이어지면 두 줄로 줄인다.
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * 업로드된 원고에서 미리보기용 본문을 뽑는다.
 * 뽑아내지 못하면 빈 문자열을 돌려준다. (호출한 쪽이 미리보기를 만들지 않는다)
 */
export function extractTextFromDoc(filePath: string): string {
  try {
    const zip = new AdmZip(filePath);
    const extension = filePath.split('.').pop()?.toLowerCase();

    if (extension === 'hwpx') {
      // 한글은 본문을 Contents/section0.xml 부터 나눠 담는다. 여러 장이면 이어 붙인다.
      const sections = zip
        .getEntries()
        .filter((e) => /^Contents\/section\d+\.xml$/.test(e.entryName))
        .sort((a, b) => a.entryName.localeCompare(b.entryName, undefined, { numeric: true }));

      if (sections.length === 0) return '';

      return sections
        .map((entry) => extractParagraphs(entry.getData().toString('utf8'), 'hp:p', 'hp:t', 'hp:lineBreak'))
        .filter((text) => text.length > 0)
        .join('\n\n');
    }

    if (extension === 'docx') {
      const entry = zip.getEntry('word/document.xml');
      if (!entry) return '';
      return extractParagraphs(entry.getData().toString('utf8'), 'w:p', 'w:t', 'w:br');
    }
  } catch (err) {
    console.error('Failed to extract text from document', err);
  }
  return '';
}
