import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronRight, 
  Eye, 
  FileText, 
  Check, 
  Pencil, 
  ClipboardCheck, 
  Flag, 
  Clapperboard,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  UserPlus
} from 'lucide-react';

interface Lesson {
  lesson_id: string;
  lesson_no: number;
  title: string;
  subtitle: string | null;
  derived_status: string;
  deliverables: any[];
}

interface CourseDetailData {
  course_id: string;
  course_name: string;
  courseCode: string;
  status: string;
  current_stage: string;
  vendor: string;
  dev_type: string;
  overview: string | null;
  milestones: any;
  lessons: Lesson[];
  members: any[];
  lesson_count: number;
}

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { apiFetch, user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<'scripts' | 'issues'>('scripts');
  const [viewRole, setViewRole] = useState<'PLANNER' | 'SME'>('PLANNER');

  useEffect(() => {
    if (user) {
      setViewRole(user.global_role === 'SME' ? 'SME' : 'PLANNER');
    }
  }, [user]);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const result = await apiFetch(`/courses/${id}`);
        setCourse(result);
      } catch (err: any) {
        setError(err.message || '과정 정보를 가져오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCourseDetail();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fg-3)' }}>
        과정 상세 정보 로딩 중...
      </div>
    );
  }

  if (error || !course) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--error-fg)' }}>
        {error || '데이터가 없습니다.'}
      </div>
    );
  }

  const milestones = course.milestones || {};
  const instructorNames = course.members
    .filter((m: any) => m.role_in_course === 'SME')
    .map((m: any) => m.user.name)
    .join(', ') || '미배정';

  // Roadmap Milestones Mapping
  const roadmapSteps = [
    { label: '기획 · 킥오프', date: milestones.kickoff || '완료', icon: Check, st: 'done' },
    { label: '원고 작성', date: milestones.script_deadline || '진행중', icon: Pencil, st: 'cur' },
    { label: '원고 검수', date: milestones.review_complete || '대기', icon: ClipboardCheck, st: 'todo' },
    { label: '최종 확정', date: milestones.confirm_complete || '대기', icon: Flag, st: 'todo' },
    { label: '촬영 예정', date: milestones.shoot || '협의중', icon: Clapperboard, st: 'todo' },
  ];

  const getStatusChipColors = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { label: '승인완료', bg: 'var(--success-bg)', fg: 'var(--success-fg)' };
      case 'SUBMITTED':
      case 'IN_REVIEW':
        return { label: '검수중', bg: 'var(--info-bg)', fg: 'var(--info-fg)' };
      case 'REVISION_REQUESTED':
        return { label: '수정요청', bg: 'var(--error-bg)', fg: 'var(--error-fg)' };
      default:
        return { label: '작성중', bg: 'var(--primary-tint-2)', fg: 'var(--primary-hover)' };
    }
  };

  const getRoadmapStyle = (st: string) => {
    if (st === 'done') {
      return {
        dotBg: 'var(--success)',
        dotFg: '#fff',
        dotBorder: 'var(--success)',
        labelFg: 'var(--fg-2)',
        lineBg: 'var(--success)'
      };
    }
    if (st === 'cur') {
      return {
        dotBg: 'var(--primary)',
        dotFg: '#fff',
        dotBorder: 'var(--primary)',
        labelFg: 'var(--primary-hover)',
        lineBg: 'var(--success)'
      };
    }
    return {
      dotBg: 'var(--bg-card)',
      dotFg: 'var(--fg-4)',
      dotBorder: 'var(--border-strong)',
      labelFg: 'var(--fg-3)',
      lineBg: 'var(--border-strong)'
    };
  };

  // Mock Issues matching S06
  const issues = [
    { icon: AlertTriangle, accent: '#EF4444', title: '3차시 원고 마감 2일 지연', desc: '역할극 지문 수정으로 재제출 진행 중. 강사 일정 재확인 필요.' },
    { icon: MessageSquare, accent: '#F59E0B', title: '2차시 검수 답변 대기', desc: '박도현 강사 답변 대기 · 2일 경과' },
    { icon: Clapperboard, accent: '#9C3A6B', title: '촬영 일정 미확정', desc: '3차시 역할극 별도 촬영 — 출연 2인 일정 조율 필요' },
  ];

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        padding: '14px 32px 0',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0
      }}>
        {/* Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--fg-4)' }}>
          <Link to="/courses" style={{ color: 'var(--fg-4)' }}>과정 관리</Link>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--fg-2)', fontWeight: 700 }}>{course.course_name}</span>
        </div>

        {/* Course Info & View Switcher */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginTop: '10px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, margin: 0 }}>
                {course.course_name}
              </h1>
              <span style={{
                fontSize: '11.5px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 'var(--r-pill)',
                backgroundColor: 'var(--info-bg)',
                color: 'var(--info-fg)'
              }}>
                {course.status}
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11.5px',
                fontWeight: 700,
                color: 'var(--fg-4)',
                padding: '4px 10px',
                border: '1px solid var(--border)',
                borderRadius: '999px'
              }}>
                <Eye size={13} /> 보기 전용
              </span>
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--fg-3)', marginTop: '5px' }}>
              {course.dev_type} · 전체 {course.lesson_count}차시 · 담당 강사: {instructorNames} · 제출 마감: {milestones.script_deadline || '미지정'}
            </div>
          </div>

          {/* Role view toggle pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px', borderRadius: '999px', background: 'var(--bg-sunken)' }}>
            <button 
              onClick={() => setViewRole('PLANNER')}
              style={{
                padding: '6px 13px',
                borderRadius: '999px',
                fontSize: '12.5px',
                fontWeight: 700,
                backgroundColor: viewRole === 'PLANNER' ? 'var(--bg-card)' : 'transparent',
                color: viewRole === 'PLANNER' ? 'var(--primary-hover)' : 'var(--fg-3)'
              }}
            >
              기획자
            </button>
            <button 
              onClick={() => setViewRole('SME')}
              style={{
                padding: '6px 13px',
                borderRadius: '999px',
                fontSize: '12.5px',
                fontWeight: 700,
                backgroundColor: viewRole === 'SME' ? 'var(--bg-card)' : 'transparent',
                color: viewRole === 'SME' ? 'var(--primary-hover)' : 'var(--fg-3)'
              }}
            >
              강사
            </button>
          </div>

          {(user?.global_role === 'PLANNER' || user?.global_role === 'ADMIN') && (
            <button 
              onClick={() => navigate(`/courses/${course.course_id}/members`)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '10px 16px',
                borderRadius: 'var(--r-md)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-strong)',
                color: 'var(--fg-2)',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <UserPlus size={16} /> 강사 초대 · 배정
            </button>
          )}

          <button 
            onClick={() => navigate(`/courses/${course.course_id}/lessons/${course.lessons[0]?.lesson_id}/script`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '10px 16px',
              borderRadius: 'var(--r-md)',
              background: 'var(--primary)',
              color: '#fff',
              fontSize: '13.5px',
              fontWeight: 700
            }}
          >
            <FileText size={16} /> 원고 상세관리 열기
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginTop: '14px' }}>
          <button 
            onClick={() => setTab('scripts')}
            style={{
              padding: '11px 16px',
              fontSize: '14px',
              fontWeight: 700,
              color: tab === 'scripts' ? 'var(--fg-1)' : 'var(--fg-4)',
              borderBottom: `2.5px solid ${tab === 'scripts' ? 'var(--primary)' : 'transparent'}`
            }}
          >
            원고 진행상황
          </button>
          <button 
            onClick={() => setTab('issues')}
            style={{
              padding: '11px 16px',
              fontSize: '14px',
              fontWeight: 700,
              color: tab === 'issues' ? 'var(--fg-1)' : 'var(--fg-4)',
              borderBottom: `2.5px solid ${tab === 'issues' ? 'var(--primary)' : 'transparent'}`
            }}
          >
            이슈 · 특징사항
          </button>
        </div>
      </header>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px 44px' }}>
        
        {/* Roadmap Roadmap Timeline */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow-sm)',
          padding: '22px 24px',
          marginBottom: '22px'
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, marginBottom: '18px' }}>
            진행 로드맵
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            {roadmapSteps.map((m, i) => {
              const rStyle = getRoadmapStyle(m.st);
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  {i > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      left: '-50%',
                      right: '50%',
                      height: '2px',
                      background: rStyle.lineBg,
                      zIndex: 1
                    }}></div>
                  )}
                  <div style={{
                    position: 'relative',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: rStyle.dotBg,
                    color: rStyle.dotFg,
                    border: `2px solid ${rStyle.dotBorder}`,
                    zIndex: 2
                  }}>
                    <m.icon size={16} />
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: rStyle.labelFg, marginTop: '8px', textAlign: 'center' }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--fg-4)', marginTop: '2px' }}>
                    {m.date}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Scripts List */}
        {tab === 'scripts' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700 }}>차시별 원고 진행상황</div>
              <div style={{ fontSize: '12px', color: 'var(--fg-4)' }}>차시 항목을 누르면 원고 상세관리 3-Pane 뷰로 이동해요</div>
            </div>
            
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px 22px',
                borderBottom: '1px solid var(--border)',
                fontSize: '11.5px',
                fontWeight: 700,
                color: 'var(--fg-4)'
              }}>
                <span style={{ flex: 1 }}>차시 / 원고 제목</span>
                <span style={{ width: '96px' }}>상태</span>
                <span style={{ width: '60px' }}>버전</span>
                <span style={{ width: '110px' }}>담당 강사</span>
                <span style={{ width: '110px', textAlign: 'right' }}>제출 기한</span>
              </div>
              
              {course.lessons.map((lesson) => {
                const scriptDeliv = lesson.deliverables.find((d) => d.deliverable_type === 'SCRIPT');
                const statusInfo = getStatusChipColors(scriptDeliv ? scriptDeliv.current_status : 'NOT_SUBMITTED');
                
                return (
                  <div
                    key={lesson.lesson_id}
                    onClick={() => navigate(`/courses/${course.course_id}/lessons/${lesson.lesson_id}/script`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '15px 22px',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}
                    className="row"
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--fg-1)' }}>
                        {lesson.lesson_no}차시 — {lesson.title}
                      </div>
                    </div>
                    <div style={{ width: '96px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 'var(--r-pill)',
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.fg,
                      }}>{statusInfo.label}</span>
                    </div>
                    <div style={{ width: '60px', fontFamily: 'var(--font-num)', fontSize: '13px', color: 'var(--fg-2)' }}>
                      v1
                    </div>
                    <div style={{ width: '110px', fontSize: '12.5px', color: 'var(--fg-3)' }}>
                      {instructorNames.split(',')[0]}
                    </div>
                    <div style={{ width: '110px', textAlign: 'right', fontSize: '12.5px', color: 'var(--fg-3)' }}>
                      {milestones.script_deadline || '기한 없음'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Issues and guides */}
        {tab === 'issues' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '18px' }}>
            
            {/* Left Pane: Issues List */}
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
                이슈사항
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {issues.map((i, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '16px 18px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderLeft: `4px solid ${i.accent}`,
                      borderRadius: 'var(--r-lg)',
                      boxShadow: 'var(--shadow-xs)'
                    }}
                  >
                    <i.icon size={18} style={{ color: i.accent, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--fg-1)' }}>{i.title}</div>
                      <div style={{ fontSize: '12.5px', color: 'var(--fg-3)', marginTop: '3px', lineHeight: 1.6 }}>{i.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Pane: Guidelines links */}
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
                특징사항 & 관련 안내
              </div>
              <div style={{ padding: '18px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ fontSize: '13px', color: 'var(--fg-2)', lineHeight: 1.75 }}>
                  이 과정은 <b>차시별 맞춤 스크립트 작성 가이드</b>를 제공합니다. 촬영을 시작하기 전에 집필 템플릿과 준수 수칙을 확인하여 주세요.
                </div>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--fg-4)', margin: '16px 0 8px' }}>
                  관련 안내 바로가기
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button 
                    onClick={() => navigate('/guide')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: 'var(--r-md)',
                      background: 'var(--primary-tint)',
                      color: 'var(--primary-hover)',
                      fontSize: '13px',
                      fontWeight: 700,
                      textAlign: 'left',
                      width: '100%'
                    }}
                  >
                    <Clapperboard size={16} /> 촬영 안내 가이드 보기 <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
                  </button>
                  <button 
                    onClick={() => navigate('/guide')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: 'var(--r-md)',
                      background: 'var(--bg-sunken)',
                      color: 'var(--fg-2)',
                      fontSize: '13px',
                      fontWeight: 700,
                      textAlign: 'left',
                      width: '100%'
                    }}
                  >
                    <FileText size={16} /> 원고 작성 서식 보기 <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default CourseDetail;
