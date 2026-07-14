import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Plus, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface Course {
  course_id: string;
  course_name: string;
  courseCode: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  current_stage: string;
  lesson_count: number;
  progress_rate: number;
  delayed_lessons: number;
  vendor?: string;
  dev_type?: string;
  overview?: string;
  planner?: {
    name: string;
    email: string;
  };
}

const CourseList: React.FC = () => {
  const { apiFetch, user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DELAYED' | 'DONE'>('ALL');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const result = await apiFetch('/courses');
        
        // Enhance results with mock progress data if not fully calculated by backend
        const enhanced = result.map((c: any) => {
          // If progress_rate is not provided or 0, let's calculate a mock/realistic rate for seed data
          let rate = c.progress_rate || 0;
          let delayed = c.delayed_lessons || 0;
          
          if (c.course_name.includes('학교자율시간')) {
            // For seed course, let's start with 20% progress
            rate = 20;
          }

          return {
            ...c,
            progress_rate: rate,
            delayed_lessons: delayed,
          };
        });

        setCourses(enhanced);
      } catch (err: any) {
        setError(err.message || '과정 목록을 가져오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fg-3)' }}>
        과정 목록 로딩 중...
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

  // Filter logic
  const filtered = courses.filter((c) => {
    const matchesSearch = c.course_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.courseCode && c.courseCode.toLowerCase().includes(search.toLowerCase())) ||
      (c.vendor && c.vendor.toLowerCase().includes(search.toLowerCase()));

    const isDelayed = c.delayed_lessons > 0;
    const isDone = c.progress_rate === 100;
    const isActive = c.status === 'ACTIVE' && !isDelayed && !isDone;

    if (statusFilter === 'ACTIVE') return matchesSearch && isActive;
    if (statusFilter === 'DELAYED') return matchesSearch && isDelayed;
    if (statusFilter === 'DONE') return matchesSearch && isDone;

    return matchesSearch;
  });

  const counts = {
    all: courses.length,
    active: courses.filter(c => c.status === 'ACTIVE' && c.progress_rate < 100 && c.delayed_lessons === 0).length,
    delayed: courses.filter(c => c.delayed_lessons > 0).length,
    done: courses.filter(c => c.progress_rate === 100).length
  };

  const getCourseStatusDetails = (c: Course) => {
    if (c.status === 'DRAFT') {
      return { label: '초안', bg: 'var(--neutral-bg)', fg: 'var(--neutral-fg)', barColor: 'var(--fg-4)' };
    }
    if (c.progress_rate === 100) {
      return { label: '완료', bg: 'var(--success-bg)', fg: 'var(--success-fg)', barColor: 'var(--success)' };
    }
    if (c.delayed_lessons > 0) {
      return { label: '지연', bg: 'var(--error-bg)', fg: 'var(--error-fg)', barColor: 'var(--error)' };
    }
    return { label: '진행중', bg: 'var(--info-bg)', fg: 'var(--info-fg)', barColor: 'var(--primary)' };
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
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>과정 관리</div>
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
            placeholder="과정명·코드 검색" 
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

        {(user?.global_role === 'PLANNER' || user?.global_role === 'ADMIN') && (
          <button 
            onClick={() => navigate('/courses/new')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '10px 16px',
              borderRadius: 'var(--r-md)',
              background: 'var(--primary)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Plus size={17} /> 새 과정 만들기
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '26px 32px 40px' }}>
        
        {/* Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
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
            전체 {counts.all}
          </button>
          <button 
            onClick={() => setStatusFilter('ACTIVE')}
            style={{
              padding: '8px 15px',
              borderRadius: '999px',
              backgroundColor: statusFilter === 'ACTIVE' ? 'var(--fg-1)' : 'var(--bg-card)',
              color: statusFilter === 'ACTIVE' ? '#fff' : 'var(--fg-2)',
              border: statusFilter === 'ACTIVE' ? 'none' : '1px solid var(--border-strong)',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            진행중 {counts.active}
          </button>
          <button 
            onClick={() => setStatusFilter('DELAYED')}
            style={{
              padding: '8px 15px',
              borderRadius: '999px',
              backgroundColor: statusFilter === 'DELAYED' ? 'var(--fg-1)' : 'var(--bg-card)',
              color: statusFilter === 'DELAYED' ? '#fff' : 'var(--fg-2)',
              border: statusFilter === 'DELAYED' ? 'none' : '1px solid var(--border-strong)',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            지연 {counts.delayed}
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
            완료 {counts.done}
          </button>
        </div>

        {/* Course Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '18px'
        }}>
          {filtered.map((c) => {
            const status = getCourseStatusDetails(c);
            return (
              <div
                key={c.course_id}
                style={{
                  display: 'block',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-xl)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '20px 22px',
                  position: 'relative'
                }}
                className="ccard"
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '11px', color: 'var(--fg-4)', fontWeight: 700, letterSpacing: '0.5px' }}>
                      {c.dev_type || '원고 검수'}
                    </div>
                    <div style={{
                      fontSize: '17px',
                      fontWeight: 700,
                      marginTop: '5px',
                      lineHeight: '1.4',
                      color: 'var(--fg-1)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {c.course_name}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 'var(--r-pill)',
                    backgroundColor: status.bg,
                    color: status.fg,
                    flexShrink: 0
                  }}>
                    {status.label}
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--fg-3)' }}>원고 진행률</span>
                    <span style={{ fontFamily: 'var(--font-num)', fontWeight: 700, color: 'var(--fg-1)' }}>{c.progress_rate}%</span>
                  </div>
                  <div style={{ height: '7px', borderRadius: '999px', background: 'var(--bg-sunken)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      borderRadius: '999px',
                      background: status.barColor,
                      width: `${c.progress_rate}%`,
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--fg-4)', marginTop: '6px' }}>
                    전체 {c.lesson_count}차시 · 기획자: {c.planner?.name || '미배정'}
                  </div>
                </div>

                {/* Overdue Warning Chip */}
                {c.delayed_lessons > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    marginTop: '14px',
                    padding: '8px 11px',
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--error-bg)',
                    color: 'var(--error-fg)',
                    fontSize: '12.5px',
                    fontWeight: 700
                  }}>
                    <AlertTriangle size={15} /> 지연된 차시가 존재합니다 ({c.delayed_lessons}개 차시)
                  </div>
                )}

                {/* Card Footer */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '16px',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: '#E7E9ED',
                      color: '#515862',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>S</span>
                    <span style={{ fontSize: '12.5px', color: 'var(--fg-3)' }}>SME 강사 배정됨</span>
                  </div>
                  <button 
                    onClick={() => navigate(`/courses/${c.course_id}`)}
                    style={{
                      fontSize: '12.5px',
                      color: 'var(--primary)',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    상세보기 <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--fg-3)', background: 'var(--bg-card)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)' }}>
            검색 결과에 맞는 개설된 연수 과정이 없습니다.
          </div>
        )}

      </div>
    </div>
  );
};

export default CourseList;
