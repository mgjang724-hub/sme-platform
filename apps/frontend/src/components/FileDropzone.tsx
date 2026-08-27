import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';
import { formatFileSize } from '../lib/upload';

interface Props {
  /** 허용 확장자 목록. 점을 포함한 소문자로 넘긴다. 예: ['.docx', '.hwpx'] */
  accept: string[];
  onFileSelected: (file: File) => void;
  /** 업로드 진행 중일 때 0~100. null이면 진행 중이 아니다. */
  progress?: number | null;
  disabled?: boolean;
  /** 영역 안에 함께 노출할 안내 문구 */
  hint?: string;
  onInvalidFile?: (message: string) => void;
}

const FileDropzone: React.FC<Props> = ({ accept, onFileSelected, progress = null, disabled = false, hint, onInvalidFile }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploading = progress !== null;
  const busy = disabled || uploading;

  const handleFile = useCallback((file: File) => {
    const lower = file.name.toLowerCase();
    if (accept.length > 0 && !accept.some((ext) => lower.endsWith(ext))) {
      onInvalidFile?.(`${accept.join(', ')} 파일만 올릴 수 있습니다.`);
      return;
    }
    onFileSelected(file);
  }, [accept, onFileSelected, onInvalidFile]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (busy) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const openPicker = () => {
    if (!busy) inputRef.current?.click();
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!busy) setDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
      onDrop={onDrop}
      onClick={openPicker}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openPicker();
        }
      }}
      role="button"
      tabIndex={busy ? -1 : 0}
      aria-disabled={busy}
      aria-label={`원고 파일 선택. ${accept.join(', ')} 형식을 지원하며 파일을 끌어다 놓을 수도 있습니다.`}
      style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '9px',
        padding: '26px 20px',
        border: `1.5px dashed ${dragging ? 'var(--primary)' : 'var(--border-strong)'}`,
        borderRadius: 'var(--r-lg)',
        backgroundColor: dragging ? 'var(--primary-tint)' : 'var(--bg-page-2)',
        cursor: busy ? 'default' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'border-color .15s ease, background-color .15s ease',
        textAlign: 'center',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept.join(',')}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = ''; // 같은 파일을 다시 골라도 이벤트가 발생하도록 초기화
        }}
        style={{ display: 'none' }}
        tabIndex={-1}
      />

      {uploading ? (
        <>
          <FileText size={22} strokeWidth={1.9} color="var(--primary)" aria-hidden="true" />
          <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: 'var(--fg-1)' }}>
            업로드 중… {progress}%
          </p>
          <div
            role="progressbar"
            aria-valuenow={progress ?? 0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="업로드 진행률"
            style={{ width: '100%', maxWidth: '260px', height: '6px', borderRadius: 'var(--r-pill)', backgroundColor: 'var(--bg-sunken)', overflow: 'hidden' }}
          >
            <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width .2s ease' }} />
          </div>
        </>
      ) : (
        <>
          <UploadCloud size={24} strokeWidth={1.8} color={dragging ? 'var(--primary)' : 'var(--fg-4)'} aria-hidden="true" />
          <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: 'var(--fg-1)', lineHeight: 1.5 }}>
            {dragging ? '여기에 놓으면 업로드됩니다' : '파일을 끌어다 놓거나 클릭해서 선택하세요'}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--fg-3)', lineHeight: 1.5 }}>
            {hint || `${accept.join(', ')} 형식을 지원합니다`}
          </p>
        </>
      )}
    </div>
  );
};

/** 선택된 파일을 확인용으로 보여주는 작은 카드. 업로드 전 취소할 수 있다. */
export const SelectedFileChip: React.FC<{ file: File; onRemove?: () => void }> = ({ file, onRemove }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 12px',
    backgroundColor: 'var(--primary-tint)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)',
  }}>
    <FileText size={15} strokeWidth={2} color="var(--primary-hover)" aria-hidden="true" style={{ flex: 'none' }} />
    <span style={{ flex: 1, minWidth: 0, fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {file.name}
    </span>
    <span style={{ flex: 'none', fontSize: '11.5px', color: 'var(--fg-3)', fontFamily: 'var(--font-num)' }}>
      {formatFileSize(file.size)}
    </span>
    {onRemove && (
      <button type="button" onClick={onRemove} aria-label={`${file.name} 선택 취소`} style={{ flex: 'none', display: 'inline-flex', color: 'var(--fg-3)' }}>
        <X size={14} strokeWidth={2.4} aria-hidden="true" />
      </button>
    )}
  </div>
);

export default FileDropzone;
