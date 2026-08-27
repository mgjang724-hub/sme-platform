/**
 * 원고 본문 미리보기를 만들 수 있는 형식과, 만들지 못했을 때의 안내 문구.
 *
 * 서버는 docx와 hwpx에서만 본문을 뽑아낸다 (document-parser.ts).
 * 나머지 형식과 링크 제출은 파일 전달만 되고, 본문 미리보기·인용 피드백·
 * AI 분석은 쓸 수 없다. 제출한 뒤에 알게 되지 않도록 업로드 시점에 알린다.
 */

/** 업로드 자체를 허용하는 형식 */
export const ACCEPTED_FORMATS = ['.docx', '.hwp', '.hwpx', '.pdf'] as const;

/** 본문을 뽑아낼 수 있어 미리보기·인용 피드백까지 되는 형식 */
export const PREVIEW_FORMATS = ['.docx', '.hwpx'] as const;

/** 올릴 수는 있지만 본문을 읽지 못하는 형식 */
export const NO_PREVIEW_FORMATS = ['.hwp', '.pdf'] as const;

export function supportsPreview(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return PREVIEW_FORMATS.some((ext) => lower.endsWith(ext));
}

interface VersionLike {
  kind?: 'FILE' | 'LINK';
  storage_path?: string;
}

/**
 * 미리보기가 비어 있을 때 이유와 다음 행동을 알려 준다.
 * "형식이 아닙니다"에서 끝내지 않고, 무엇을 하면 되는지까지 적는다.
 */
export function describeMissingPreview(version: VersionLike | undefined): {
  reason: string;
  hint: string;
} {
  if (!version) {
    return {
      reason: '아직 제출된 원고가 없습니다.',
      hint: '원고를 올리면 본문이 여기에 표시됩니다.',
    };
  }

  if (version.kind === 'LINK') {
    return {
      reason: '구글 문서로 제출된 원고입니다.',
      hint: '본문 미리보기와 인용 피드백은 파일(.docx, .hwpx)로 제출할 때만 쓸 수 있습니다. 위의 [바로가기]에서 문서를 열어 확인해 주세요.',
    };
  }

  const path = (version.storage_path || '').toLowerCase();
  if (path.endsWith('.hwp')) {
    return {
      reason: 'hwp 파일은 본문을 읽어올 수 없습니다.',
      hint: '한컴오피스에서 [다른 이름으로 저장] → hwpx 형식으로 저장해 다시 올리면 본문 미리보기와 인용 피드백을 쓸 수 있습니다.',
    };
  }
  if (path.endsWith('.pdf')) {
    return {
      reason: 'pdf 파일은 본문을 읽어올 수 없습니다.',
      hint: '원본 문서를 docx 또는 hwpx로 올리면 본문 미리보기와 인용 피드백을 쓸 수 있습니다.',
    };
  }

  return {
    reason: '본문을 읽어오지 못했습니다.',
    hint: '파일이 손상되었거나 본문이 이미지로만 되어 있을 수 있습니다. 위의 [바로가기]로 원본을 확인해 주세요.',
  };
}
