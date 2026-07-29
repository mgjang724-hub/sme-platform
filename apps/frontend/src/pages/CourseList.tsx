import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Plus, 
  AlertTriangle,
  ArrowRight,
  X
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
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DELAYED' | 'DONE' | 'ARCHIVED'>('ALL');

  // Edit Course Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    course_name: '',
    courseCode: '',
    vendor: '',
    dev_type: '',
    overview: ''
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const handleOpenEditModal = (c: Course) => {
    setEditingCourseId(c.course_id);
    setEditForm({
      course_name: c.course_name || '',
      courseCode: (c as any).courseCode || '',
      vendor: (c as any).vendor || '',
      dev_type: (c as any).dev_type || '신규 개발',
      overview: (c as any).overview || ''
    });
    setEditModalOpen(true);
  };

  const handleSaveEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourseId || !editForm.course_name.trim()) return;

    setSubmittingEdit(true);
    try {
      const updated = await apiFetch(`/courses/${editingCourseId}`, {
        method: 'PATCH',
        body: JSON.stringify(editForm)
      });

      setCourses(prev => prev.map(c => {
        if (c.course_id === editingCourseId) {
          return {
            ...c,
            course_name: editForm.course_name,
            dev_type: editForm.dev_type,
            ...(updated || {})
          };
        }
        return c;
      }));

      setEditModalOpen(false);
      alert('과정 정보가 성공적으로 수정되었습니다.');
    } catch (err: any) {
      alert(err.message || '과정 정보 수정 실패');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleToggleArchive = async (courseId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED';
    const confirmMsg = nextStatus === 'ARCHIVED' 
      ? '이 과정을 보관함으로 이동하시겠습니까?\n보관된 과정은 [보관됨] 탭에서만 조회됩니다.'
      : '이 과정을 보관함에서 해제(복원)하시겠습니까?';
    
    if (!window.confirm(confirmMsg)) return;

    try {
      await apiFetch(`/courses/${courseId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });
      
      // Update state locally
      setCourses(prev => prev.map(c => {
        if (c.course_id === courseId) {
          return { ...c, status: nextStatus as any };
        }
        return c;
      }));
    } catch (err) {
      alert('상태 업데이트에 실패했습니다.');
    }
  };

  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    if (!window.confirm(`[경고] "${courseName}" 과정을 삭제하시겠습니까?\n과정 삭제 시 관련된 모든 차시, 원고 산출물, 피드백 히스토리가 완전히 영구 삭제되며 복구할 수 없습니다.`)) {
      return;
    }

    try {
      await apiFetch(`/courses/${courseId}`, {
        method: 'DELETE'
      });
      
      // Remove from state locally
      setCourses(prev => prev.filter(c => c.course_id !== courseId));
    } catch (err) {
      alert('과정 삭제에 실패했습니다.');
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const result = await apiFetch('/courses');
        
        const safeList = Array.isArray(result) ? result : [];
        const enhanced = safeList.map((c: any) => {
          let rate = c?.progress_rate || 0;
          let delayed = c?.delayed_lessons || 0;
          let courseName = c?.course_name || '';
          
          if (courseName && courseName.includes('학교자율시간')) {
            rate = 20;
          }

          return {
            ...c,
            course_name: courseName,
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
    if (!c) return false;
    const courseName = (c.course_name || '').toLowerCase();
    const courseCode = (c.courseCode || '').toLowerCase();
    const vendor = (c.vendor || '').toLowerCase();
    const searchLower = (search || '').toLowerCase();

    const matchesSearch = courseName.includes(searchLower) ||
      courseCode.includes(searchLower) ||
      vendor.includes(searchLower);

    if (!matchesSearch) return false;

    // Archived Filter
    if (statusFilter === 'ARCHIVED') {
      return c.status === 'ARCHIVED';
    }

    // Hide archived from main list
    if (c.status === 'ARCHIVED') return false;

    const isDelayed = (c.delayed_lessons || 0) > 0;
    const isDone = (c.progress_rate || 0) === 100;
    const isActive = c.status === 'ACTIVE' && !isDelayed && !isDone;

    if (statusFilter === 'ACTIVE') return isActive;
    if (statusFilter === 'DELAYED') return isDelayed;
    if (statusFilter === 'DONE') return isDone;

    return true; // statusFilter === 'ALL'
  });

  const counts = {
    all: courses.filter(c => c && c.status !== 'ARCHIVED').length,
    active: courses.filter(c => c && c.status === 'ACTIVE' && (c.progress_rate || 0) < 100 && (c.delayed_lessons || 0) === 0).length,
    delayed: courses.filter(c => c && c.status === 'ACTIVE' && (c.delayed_lessons || 0) > 0).length,
    done: courses.filter(c => c && c.status === 'ACTIVE' && c.progress_rate === 100).length,
    archived: courses.filter(c => c && c.status === 'ARCHIVED').length
  };

  const getCourseStatusDetails = (c: Course) => {
    if (c.status === 'ARCHIVED') {
      return { label: '보관됨', bg: '#E2E8F0', fg: '#475569', barColor: '#94A3B8' };
    }
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
          <button 
            onClick={() => setStatusFilter('ARCHIVED')}
            style={{
              padding: '8px 15px',
              borderRadius: '999px',
              backgroundColor: statusFilter === 'ARCHIVED' ? 'var(--fg-1)' : 'var(--bg-card)',
              color: statusFilter === 'ARCHIVED' ? '#fff' : 'var(--fg-2)',
              border: statusFilter === 'ARCHIVED' ? 'none' : '1px solid var(--border-strong)',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            보관됨 {counts.archived}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {(user?.global_role === 'PLANNER' || user?.global_role === 'ADMIN') && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(c);
                          }}
                          style={{
                            border: 'none',
                            background: 'none',
                            fontSize: '12.5px',
                            color: 'var(--fg-2)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          수정
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleArchive(c.course_id, c.status);
                          }}
                          style={{
                            border: 'none',
                            background: 'none',
                            fontSize: '12.5px',
                            color: 'var(--fg-3)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            padding: 0
                          }}
                        >
                          {c.status === 'ARCHIVED' ? '복원' : '보관'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCourse(c.course_id, c.course_name);
                          }}
                          style={{
                            border: 'none',
                            background: 'none',
                            fontSize: '12.5px',
                            color: 'var(--error-fg)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            padding: 0
                          }}
                        >
                          삭제
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => navigate(`/courses/${c.course_id}`)}
                      style={{
                        fontSize: '12.5px',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      상세보기 <ArrowRight size={14} />
                    </button>
                  </div>
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

      {/* Edit Course Modal Overlay */}
      {editModalOpen && (
        <div 
          onClick={() => setEditModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 60
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '520px',
              maxWidth: '100%',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--r-2xl)',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-page)' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--fg-1)' }}>✏️ 과정 정보 수정</div>
              <button 
                onClick={() => setEditModalOpen(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--fg-3)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditCourse} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--fg-2)', marginBottom: '6px' }}>
                    과정명 <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    value={editForm.course_name} 
                    onChange={(e) => setEditForm({ ...editForm, course_name: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--r-md)',
                      fontSize: '13.5px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--fg-2)', marginBottom: '6px' }}>
                      과정 코드
                    </label>
                    <input 
                      type="text" 
                      value={editForm.courseCode} 
                      onChange={(e) => setEditForm({ ...editForm, courseCode: e.target.value })}
                      placeholder="CRS-2026-001"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid var(--border-strong)',
                        borderRadius: 'var(--r-md)',
                        fontSize: '13.5px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--fg-2)', marginBottom: '6px' }}>
                      개발 유형
                    </label>
                    <select 
                      value={editForm.dev_type} 
                      onChange={(e) => setEditForm({ ...editForm, dev_type: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid var(--border-strong)',
                        borderRadius: 'var(--r-md)',
                        fontSize: '13.5px',
                        outline: 'none',
                        backgroundColor: 'var(--bg-card)'
                      }}
                    >
                      <option value="신규 개발">신규 개발</option>
                      <option value="개정 개발">개정 개발</option>
                      <option value="원고 검수">원고 검수</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--fg-2)', marginBottom: '6px' }}>
                    위탁 / 개발사
                  </label>
                  <input 
                    type="text" 
                    value={editForm.vendor} 
                    onChange={(e) => setEditForm({ ...editForm, vendor: e.target.value })}
                    placeholder="i-Scream 연수원 / 자체개발"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--r-md)',
                      fontSize: '13.5px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--fg-2)', marginBottom: '6px' }}>
                    과정 개요
                  </label>
                  <textarea 
                    rows={3}
                    value={editForm.overview} 
                    onChange={(e) => setEditForm({ ...editForm, overview: e.target.value })}
                    placeholder="과정 개발 목표 및 원고 작성 지침 요약 정보"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--r-md)',
                      fontSize: '13.5px',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                <button 
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  style={{
                    padding: '9px 16px',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--r-md)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--fg-2)',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
                <button 
                  type="submit"
                  disabled={submittingEdit}
                  style={{
                    padding: '9px 18px',
                    border: 'none',
                    borderRadius: 'var(--r-md)',
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {submittingEdit ? '저장 중...' : '수정 저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CourseList;
