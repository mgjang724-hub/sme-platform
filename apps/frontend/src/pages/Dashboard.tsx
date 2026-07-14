import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ClipboardCheck, 
  HelpCircle, 
  FileCheck,
  Search,
  Bell,
  ArrowRight,
  BookOpen,
  FileText
} from 'lucide-react';

interface KPIStats {
  feedbackResolved: number;
  pendingApproval: number;
  pendingDecisions: number;
}

interface ActionTask {
  id: string;
  type: 'FEEDBACK' | 'DECISION';
  title: string;
  status: string;
  dueDate: string | null;
  lessonNo: number;
}

interface DashboardData {
  kpis: KPIStats;
  courses: any[];
  actionTasks: ActionTask[];
}

const Dashboard: React.FC = () => {
  const { user, apiFetch } = useAuth();
  const navigate = useNavigate();
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await apiFetch('/dashboard/planner');
        setData(result);
      } catch (err: any) {
        setError(err.message || '대시보드 데이터를 가져오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fg-3)' }}>
        대시보드 로딩 중...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--error-fg)' }}>
        {error || '데이터가 없습니다.'}
      </div>
    );
  }

  const kpis = data.kpis;
  const totalTasksCount = kpis.feedbackResolved + kpis.pendingApproval + kpis.pendingDecisions;
  const activeCoursesCount = data.courses.filter(c => c.status === 'ACTIVE').length;

  const todayStr = new Date().toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    weekday: 'short' 
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return { bg: 'var(--primary-tint)', fg: 'var(--primary-hover)' };
      case 'OPEN':
      case 'REOPENED':
        return { bg: 'var(--error-bg)', fg: 'var(--error-fg)' };
      case 'IN_PROGRESS':
        return { bg: 'var(--info-bg)', fg: 'var(--info-fg)' };
      case 'WAITING':
      case 'ASKED':
        return { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)' };
      default:
        return { bg: 'var(--neutral-bg)', fg: 'var(--neutral-fg)' };
    }
  };

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        height: '66px',
        padding: '0 32px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        flexShrink: 0
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>기획자 홈</div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: '40px',
          padding: '0 12px',
          width: '280px',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--r-md)',
          background: 'var(--bg-card)'
        }}>
          <Search size={17} style={{ color: 'var(--fg-4)' }} />
          <input 
            placeholder="과정·강사·원고 검색" 
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'none',
              fontSize: '13.5px'
            }} 
          />
        </div>
        <button style={{
          position: 'relative',
          width: '40px',
          height: '40px',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)',
          background: 'var(--bg-card)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Bell size={18} style={{ color: 'var(--fg-2)' }} />
          {totalTasksCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '8px',
              right: '9px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: 'var(--primary)'
            }}></span>
          )}
        </button>
      </header>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '26px 32px 40px' }}>
        
        {/* Greeting Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700 }}>
              {user?.name.split(' ')[0]}님, 오늘 처리할 일이 <span style={{ color: 'var(--primary)' }}>{totalTasksCount}건</span> 있어요
            </div>
            <div style={{ fontSize: '13px', color: 'var(--fg-3)', marginTop: '4px' }}>
              {todayStr} · 진행 중 과정 {activeCoursesCount}개
            </div>
          </div>
          <button 
            onClick={() => navigate('/courses')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '10px 16px',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--r-md)',
              background: 'var(--bg-card)',
              color: 'var(--fg-2)',
              fontSize: '14px',
              fontWeight: 700,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <BookOpen size={17} /> 과정 관리로
          </button>
        </div>

        {/* 3-KPI Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '26px'
        }}>
          <div style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            boxShadow: 'var(--shadow-sm)',
            padding: '20px 22px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning-fg)' }}>
              <ClipboardCheck size={18} />
              <span style={{ fontSize: '13px', fontWeight: 700 }}>검수 필요 원고</span>
            </div>
            <div style={{ fontFamily: 'var(--font-num)', fontSize: '32px', fontWeight: 700, marginTop: '10px', color: 'var(--fg-1)' }}>
              {kpis.feedbackResolved}
              <span style={{ fontSize: '14px', color: 'var(--fg-3)', fontWeight: 600, marginLeft: '3px' }}>건</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--fg-4)', marginTop: '4px' }}>강사가 반영 완료한 피드백</div>
          </div>

          <div style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            boxShadow: 'var(--shadow-sm)',
            padding: '20px 22px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
              <FileCheck size={18} />
              <span style={{ fontSize: '13px', fontWeight: 700 }}>승인 대기</span>
            </div>
            <div style={{ fontFamily: 'var(--font-num)', fontSize: '32px', fontWeight: 700, marginTop: '10px', color: 'var(--fg-1)' }}>
              {kpis.pendingApproval}
              <span style={{ fontSize: '14px', color: 'var(--fg-3)', fontWeight: 600, marginLeft: '3px' }}>건</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--fg-4)', marginTop: '4px' }}>최종 승인 대기 중 원고</div>
          </div>

          <div style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            boxShadow: 'var(--shadow-sm)',
            padding: '20px 22px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--info-fg)' }}>
              <HelpCircle size={18} />
              <span style={{ fontSize: '13px', fontWeight: 700 }}>답변 대기</span>
            </div>
            <div style={{ fontFamily: 'var(--font-num)', fontSize: '32px', fontWeight: 700, marginTop: '10px', color: 'var(--fg-1)' }}>
              {kpis.pendingDecisions}
              <span style={{ fontSize: '14px', color: 'var(--fg-3)', fontWeight: 600, marginLeft: '3px' }}>건</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--fg-4)', marginTop: '4px' }}>미해결된 의사결정 요청</div>
          </div>
        </div>

        {/* Priority Tasks list */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>우선 처리할 작업</div>
          <div style={{ fontSize: '12.5px', color: 'var(--fg-4)' }}>마감 및 등록일 기준</div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden'
        }}>
          {data.actionTasks.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fg-3)' }}>
              우선 처리할 작업이 없습니다.
            </div>
          ) : (
            data.actionTasks.map((t) => {
              const statusColors = getStatusStyle(t.status);
              return (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 22px',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.15s',
                  }}
                  className="row"
                >
                  <span style={{
                    width: '40px',
                    height: '40px',
                    flexShrink: 0,
                    borderRadius: 'var(--r-md)',
                    background: t.type === 'FEEDBACK' ? 'var(--primary-tint-2)' : 'var(--info-bg)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: t.type === 'FEEDBACK' ? 'var(--primary-hover)' : 'var(--info-fg)'
                  }}>
                    {t.type === 'FEEDBACK' ? <FileText size={19} /> : <HelpCircle size={19} />}
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '14.5px',
                        fontWeight: 700,
                        color: 'var(--fg-1)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {t.title}
                      </span>
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--fg-3)', marginTop: '3px' }}>
                      {t.type === 'FEEDBACK' ? '피드백 검토 요청' : '의사결정 답변 필요'}
                    </div>
                  </div>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 'var(--r-pill)',
                    backgroundColor: statusColors.bg,
                    color: statusColors.fg
                  }}>
                    {t.status}
                  </span>

                  <div style={{
                    width: '120px',
                    flexShrink: 0,
                    textAlign: 'right',
                    fontSize: '12.5px',
                    color: t.dueDate ? 'var(--error-fg)' : 'var(--fg-3)'
                  }}>
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }) + ' 마감' : '기한 없음'}
                  </div>

                  <button 
                    onClick={() => navigate('/courses')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: 'var(--r-md)',
                      background: 'var(--primary)',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 700,
                      flexShrink: 0
                    }}
                  >
                    이동 <ArrowRight size={15} />
                  </button>
                </div>
              );
            })
          )}
          
          <div style={{ padding: '14px 22px', textAlign: 'center', borderTop: data.actionTasks.length > 0 ? 'none' : '1px solid var(--border)' }}>
            <button 
              onClick={() => navigate('/courses')}
              style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}
            >
              모든 개별 과정 상세 현황 보기 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
