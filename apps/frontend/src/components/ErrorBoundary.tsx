import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          backgroundColor: '#F8FAFC',
          color: '#0F172A',
          textAlign: 'center',
          fontFamily: 'sans-serif'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>⚠️</div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            화면을 불러오는 중 오류가 발생했습니다.
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px', maxWidth: '500px', lineHeight: 1.6 }}>
            {this.state.error?.message || '데이터 구조 이상 또는 네트워크 통신 문제로 일시적 오류가 발생했습니다.'}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                backgroundColor: '#0F172A',
                color: '#fff',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              페이지 새로고침
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/courses';
              }}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                backgroundColor: '#F1F5F9',
                color: '#334155',
                fontWeight: 700,
                border: '1px solid #CBD5E1',
                cursor: 'pointer'
              }}
            >
              과정 목록으로 이동
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
