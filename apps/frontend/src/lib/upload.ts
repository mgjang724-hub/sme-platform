const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export interface UploadResult {
  ok: boolean;
  status: number;
  data: any;
}

/**
 * 진행률을 알 수 있는 파일 업로드.
 * fetch는 업로드 진행률을 제공하지 않기 때문에 XHR을 사용한다.
 *
 * @param onProgress 0~100 사이의 진행률. 서버가 길이를 알려주지 않으면 호출되지 않는다.
 */
export function uploadWithProgress(
  path: string,
  formData: FormData,
  token: string | null,
  onProgress?: (percent: number) => void,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

    xhr.open('POST', url, true);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      let data: any = null;
      try {
        data = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        data = null;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve(data);
      } else if (xhr.status === 401) {
        reject(new Error('인증이 만료되었습니다. 다시 로그인해주세요.'));
      } else {
        reject(new Error(data?.message || '업로드에 실패했습니다.'));
      }
    };

    xhr.onerror = () => reject(new Error('네트워크 연결을 확인해 주세요.'));
    xhr.ontimeout = () => reject(new Error('업로드 시간이 초과되었습니다. 다시 시도해 주세요.'));

    xhr.send(formData);
  });
}

/** 1024 단위로 사람이 읽기 쉬운 파일 크기 문자열을 만든다. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
