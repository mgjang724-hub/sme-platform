import AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 시연용 원고를 실제 .docx 파일로 만든다.
 *
 * 바이너리를 저장소에 넣지 않고 시드가 직접 만든다. 덕분에 배포할 때마다
 * 같은 원고가 생기고, 파일 자체가 진짜 docx라 업로드 경로와 본문 추출기를
 * 그대로 통과한다.
 */

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="xml" ContentType="application/xml"/>
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

const RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

/**
 * 문단 목록으로 docx 바이트를 만든다.
 * 워드가 실제로 저장하는 모양에 가깝도록 한 문단의 텍스트를 여러 <w:r>로 나눈다.
 * (본문 추출기가 조각을 제대로 이어 붙이는지 확인하는 역할도 겸한다)
 */
export function buildDocx(paragraphs: string[]): Buffer {
  const body = paragraphs
    .map((text) => {
      if (!text) return '<w:p/>';

      // 문장 단위로 잘라 여러 런으로 나눈다. 마지막 조각까지 공백을 보존한다.
      const pieces = text.match(/[^.!?]+[.!?]*\s*/g) || [text];
      const runs = pieces
        .map((piece) => `<w:r><w:t xml:space="preserve">${escapeXml(piece)}</w:t></w:r>`)
        .join('');
      return `<w:p>${runs}</w:p>`;
    })
    .join('');

  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}</w:body></w:document>`;

  const zip = new AdmZip();
  zip.addFile('[Content_Types].xml', Buffer.from(CONTENT_TYPES, 'utf8'));
  zip.addFile('_rels/.rels', Buffer.from(RELS, 'utf8'));
  zip.addFile('word/document.xml', Buffer.from(document, 'utf8'));
  return zip.toBuffer();
}

/**
 * uploads 폴더에 원고 파일과 미리보기 본문을 함께 쓴다.
 * 실제 업로드가 남기는 것과 같은 형태여서, 화면에서 미리보기와
 * 문장 인용 피드백이 그대로 동작한다.
 *
 * @returns FileVersion에 넣을 storage_path / preview_path
 */
export function writeScriptFiles(
  fileName: string,
  paragraphs: string[],
  roundNo: number,
  seq: number,
): { storagePath: string; previewPath: string } {
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // 실제 업로드와 같은 규칙으로 이름을 만든다. 시드는 매번 같은 이름을 쓴다.
  const safeName = `r_${roundNo}_seed${seq}_${fileName}`;
  fs.writeFileSync(path.join(uploadDir, safeName), buildDocx(paragraphs));

  const previewName = `preview_${roundNo}_seed${seq}.txt`;
  const previewText = paragraphs.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  fs.writeFileSync(path.join(uploadDir, previewName), previewText, 'utf8');

  return {
    storagePath: `/uploads/${safeName}`,
    previewPath: `/uploads/${previewName}`,
  };
}
