import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Bell, 
  CheckCircle, 
  MessageSquare, 
  Clapperboard, 
  GitBranch, 
  Clock, 
  ArrowRight 
} from 'lucide-react';

interface Task {
  courseId: string;
  courseName: string;
  lessonId: string;
  lessonNo: number;
  title: string;
  deliverableId: string;
  status: string; // SUBMITTED, REVISION_REQUESTED, APPROVED, etc.
  version: string;
  dueText: string;
  dueColor: string;
  updatedAt: string;
  feedbackCount: number;
}

const MyTasks: React.FC = () => {
  const { user, apiFetch } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PROGRESS' | 'REVISE' | 'REVIEW' | 'DONE'>('ALL');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const courses = await apiFetch('/courses');
        const allTasks: Task[] = [];

        for (const c of courses) {
          const courseDetail = await apiFetch(`/courses/${c.course_id}`);
          const milestones = courseDetail.milestones || {};
          
          for (const lesson of courseDetail.lessons) {
            const scriptDeliv = lesson.deliverables.find((d: any) => d.deliverable_type === 'SCRIPT');
            if (scriptDeliv) {
              // Fetch versions to get latest version round and update date
              const versions = await apiFetch(`/deliverables/${scriptDeliv.deliverable_id}/files`);
              const feedbacks = await apiFetch(`/deliverables/${scriptDeliv.deliverable_id}/feedbacks`);
              
              const latestVer = versions[0];
              const round = latestVer ? `v${latestVer.round_no}` : '작성 중';
              const lastUpdated = latestVer 
                ? new Date(latestVer.created_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
                : '업데이트 없음';

              // Map status from backend to display status
              let displayStatus = 'PROGRESS'; // 진행중/작성중
              if (scriptDeliv.current_status === 'SUBMITTED' || scriptDeliv.current_status === 'IN_REVIEW') {
                displayStatus = 'REVIEW'; // 검수중
              } else if (scriptDeliv.current_status === 'REVISION_REQUESTED') {
                displayStatus = 'REVISE'; // 수정요청
              } else if (scriptDeliv.current_status === 'APPROVED') {
                displayStatus = 'DONE'; // 완료/승인
              }

              // Filter unresolved feedbacks
              const openFeedbacksCount = feedbacks.filter((f: any) => f.status === 'OPEN' || f.status === 'REOPENED').length;

              allTasks.push({
                courseId: c.course_id,
                courseName: c.course_name,
                lessonId: lesson.lesson_id,
                lessonNo: lesson.lesson_no,
                title: `${lesson.lesson_no}차시 — ${lesson.title}`,
                deliverableId: scriptDeliv.deliverable_id,
                status: displayStatus,
                version: round,
                dueText: milestones.script_deadline 
                  ? new Date(milestones.script_deadline).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }) + ' 마감' 
                  : '기한 없음',
                dueColor: displayStatus === 'REVISE' ? 'var(--error-fg)' : 'var(--fg-3)',
                updatedAt: lastUpdated,
                feedbackCount: openFeedbacksCount,
              });
            }
          }
        }

        setTasks(allTasks);
      } catch (err: any) {
        setError(err.message || '작업 목록을 가져오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fg-3)' }}>
        내 작업 목록 로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--error-fg)' }}>
        {error}
      </div>
    );
  }

  // Filters logic
  const filtered = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
      t.courseName.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === 'PROGRESS') return matchesSearch && t.status === 'PROGRESS';
    if (statusFilter === 'REVISE') return matchesSearch && t.status === 'REVISE';
    if (statusFilter === 'REVIEW') return matchesSearch && t.status === 'REVIEW';
    if (statusFilter === 'DONE') return matchesSearch && t.status === 'DONE';

    return matchesSearch;
  });

  // KPI Calculations
  const totalCount = tasks.length;
  const doneCount = tasks.filter(t => t.status === 'DONE').length;
  const reviseCount = tasks.filter(t => t.status === 'REVISE').length;
  const reviewCount = tasks.filter(t => t.status === 'REVIEW').length;
  const feedbackTasksCount = tasks.filter(t => t.feedbackCount > 0).length;

  const getStatusChipColors = (status: string) => {
    switch (status) {
      case 'DONE':
        return { label: '승인', bg: 'var(--success-bg)', fg: 'var(--success-fg)', accent: '#10B981' };
      case 'REVIEW':
        return { label: '검수중', bg: 'var(--info-bg)', fg: 'var(--info-fg)', accent: '#F59E0B' };
      case 'REVISE':
        return { label: '수정요청', bg: 'var(--error-bg)', fg: 'var(--error-fg)', accent: '#EF4444' };
      default:
        return { label: '진행중', bg: 'var(--primary-tint-2)', fg: 'var(--primary-hover)', accent: '#3B82F6' };
    }
  };

  const getCardCtaDetails = (t: Task) => {
    switch (t.status) {
      case 'REVISE':
        return { label: '수정본 제출', bg: 'var(--primary)', fg: '#fff' };
      case 'PROGRESS':
        return { label: '이어서 작성', bg: 'var(--primary)', fg: '#fff' };
      case 'REVIEW':
        return { label: '진행 보기', bg: 'var(--bg-sunken)', fg: 'var(--fg-2)' };
      default:
        return { label: '원고 보기', bg: 'var(--bg-sunken)', fg: 'var(--fg-2)' };
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
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>내 작업</div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: '40px',
          padding: '0 12px',
          width: '260px',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--r-md)',
          background: 'var(--bg-card)'
        }}>
          <Search size={17} style={{ color: 'var(--fg-4)' }} />
          <input 
            placeholder="원고 검색" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
          {feedbackTasksCount > 0 && (
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

      {/* Main tasks list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '26px 32px 40px' }}>
        
        {/* Greetings */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '23px', fontWeight: 700 }}>
            {user?.name.split(' ')[0]}님, <span style={{ color: 'var(--primary)' }}>{feedbackTasksCount}건</span>의 원고에 새 피드백이 있어요
          </div>
          <div style={{ fontSize: '13px', color: 'var(--fg-3)', marginTop: '4px' }}>
            배정된 원고 {totalCount}개 · 수정요청 {reviseCount} · 검수중 {reviewCount}
          </div>
        </div>

        {/* 3-KPI Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '24px'
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
            <span style={{ position: 'absolute', right: '-24px', top: '-24px', width: '96px', height: '96px', borderRadius: '50%', background: 'var(--success-bg)' }}></span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success-fg)' }}>
              <CheckCircle size={18} />
              <span style={{ fontSize: '13px', fontWeight: 700 }}>작성 완료 차시</span>
            </div>
            <div style={{ position: 'relative', fontFamily: 'var(--font-num)', fontSize: '38px', fontWeight: 700, marginTop: '10px', color: 'var(--fg-1)' }}>
              {doneCount}
              <span style={{ fontSize: '15px', color: 'var(--fg-3)', fontWeight: 600, marginLeft: '3px' }}>차시</span>
            </div>
            <div style={{ position: 'relative', fontSize: '12.5px', color: 'var(--fg-3)', marginTop: '2px' }}>전체 {totalCount}차시 중 최종 승인 완료</div>
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
            <span style={{ position: 'absolute', right: '-24px', top: '-24px', width: '96px', height: '96px', borderRadius: '50%', background: 'var(--info-bg)' }}></span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--info-fg)' }}>
              <MessageSquare size={18} />
              <span style={{ fontSize: '13px', fontWeight: 700 }}>피드백 확인 원고</span>
            </div>
            <div style={{ position: 'relative', fontFamily: 'var(--font-num)', fontSize: '38px', fontWeight: 700, marginTop: '10px', color: 'var(--fg-1)' }}>
              {feedbackTasksCount}
              <span style={{ fontSize: '15px', color: 'var(--fg-3)', fontWeight: 600, marginLeft: '3px' }}>건</span>
            </div>
            <div style={{ position: 'relative', fontSize: '12.5px', color: 'var(--fg-3)', marginTop: '2px' }}>새 피드백 또는 수정 요청</div>
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
            <span style={{ position: 'absolute', right: '-24px', top: '-24px', width: '96px', height: '96px', borderRadius: '50%', background: 'var(--stage-film-bg)' }}></span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--stage-film-fg)' }}>
              <Clapperboard size={18} />
              <span style={{ fontSize: '13px', fontWeight: 700 }}>촬영일 예정</span>
            </div>
            <div style={{ position: 'relative', fontFamily: 'var(--font-num)', fontSize: '38px', fontWeight: 700, marginTop: '10px', color: 'var(--fg-1)' }}>
              협의중
            </div>
            <div style={{ position: 'relative', fontSize: '12.5px', color: 'var(--fg-3)', marginTop: '2px' }}>원고 최종 확정 후 촬영 세팅 예정</div>
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setStatusFilter('ALL')}
            style={{
              padding: '8px 15px',
              borderRadius: '999px',
              backgroundColor: statusFilter === 'ALL' ? 'var(--fg-1)' : 'var(--bg-card)',
              color: statusFilter === 'ALL' ? '#fff' : 'var(--fg-2)',
              border: statusFilter === 'ALL' ? 'none' : '1px solid var(--border-strong)',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            전체 {totalCount}
          </button>
          <button 
            onClick={() => setStatusFilter('PROGRESS')}
            style={{
              padding: '8px 15px',
              borderRadius: '999px',
              backgroundColor: statusFilter === 'PROGRESS' ? 'var(--fg-1)' : 'var(--bg-card)',
              color: statusFilter === 'PROGRESS' ? '#fff' : 'var(--fg-2)',
              border: statusFilter === 'PROGRESS' ? 'none' : '1px solid var(--border-strong)',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            진행중 {tasks.filter(t => t.status === 'PROGRESS').length}
          </button>
          <button 
            onClick={() => setStatusFilter('REVISE')}
            style={{
              padding: '8px 15px',
              borderRadius: '999px',
              backgroundColor: statusFilter === 'REVISE' ? 'var(--fg-1)' : 'var(--bg-card)',
              color: statusFilter === 'REVISE' ? '#fff' : 'var(--fg-2)',
              border: statusFilter === 'REVISE' ? 'none' : '1px solid var(--border-strong)',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            수정요청 {tasks.filter(t => t.status === 'REVISE').length}
          </button>
          <button 
            onClick={() => setStatusFilter('REVIEW')}
            style={{
              padding: '8px 15px',
              borderRadius: '999px',
              backgroundColor: statusFilter === 'REVIEW' ? 'var(--fg-1)' : 'var(--bg-card)',
              color: statusFilter === 'REVIEW' ? '#fff' : 'var(--fg-2)',
              border: statusFilter === 'REVIEW' ? 'none' : '1px solid var(--border-strong)',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            검수중 {tasks.filter(t => t.status === 'REVIEW').length}
          </button>
          <button 
            onClick={() => setStatusFilter('DONE')}
            style={{
              padding: '8px 15px',
              borderRadius: '999px',
              backgroundColor: statusFilter === 'DONE' ? 'var(--fg-1)' : 'var(--bg-card)',
              color: statusFilter === 'DONE' ? '#fff' : 'var(--fg-2)',
              border: statusFilter === 'DONE' ? 'none' : '1px solid var(--border-strong)',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            승인 {tasks.filter(t => t.status === 'DONE').length}
          </button>
        </div>

        {/* Task Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {filtered.map((t, idx) => {
            const statusDetail = getStatusChipColors(t.status);
            const ctaDetail = getCardCtaDetails(t);
            return (
              <div
                key={idx}
                style={{
                  display: 'block',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderLeft: `4px solid ${statusDetail.accent}`,
                  borderRadius: 'var(--r-xl)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '18px 20px',
                }}
                className="tcard"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--fg-4)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                    {t.courseName}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 'var(--r-pill)',
                    backgroundColor: statusDetail.bg,
                    color: statusDetail.fg,
                  }}>{statusDetail.label}</span>
                </div>

                <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '10px', lineHeight: '1.4', color: 'var(--fg-1)' }}>
                  {t.title}
                </div>

                {t.feedbackCount > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    marginTop: '12px',
                    padding: '8px 11px',
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--error-bg)',
                    color: 'var(--error-fg)',
                    fontSize: '12.5px',
                    fontWeight: 700
                  }}>
                    <MessageSquare size={14} /> 미반영 피드백 {t.feedbackCount}건
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '14px', fontSize: '12.5px', color: 'var(--fg-3)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <GitBranch size={14} /> {t.version}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: t.dueColor }}>
                    <Clock size={14} /> {t.dueText}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '16px',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--border)'
                }}>
                  <span style={{ fontSize: '12px', color: 'var(--fg-4)' }}>최근 업데이트 {t.updatedAt}</span>
                  <button 
                    onClick={() => navigate(`/courses/${t.courseId}/lessons/${t.lessonId}/script`)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: 'var(--r-md)',
                      background: ctaDetail.bg,
                      color: ctaDetail.fg,
                      fontSize: '13px',
                      fontWeight: 700,
                      boxShadow: ctaDetail.bg !== 'var(--bg-sunken)' ? 'var(--shadow-xs)' : 'none'
                    }}
                  >
                    {ctaDetail.label} <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--fg-3)', background: 'var(--bg-card)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)' }}>
            배정된 원고 작업 내역이 없습니다.
          </div>
        )}

      </div>
    </div>
  );
};

export default MyTasks;
