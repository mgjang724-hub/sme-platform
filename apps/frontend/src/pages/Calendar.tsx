import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronLeft, 
  ChevronRight, 
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  course_id: string;
  course_name: string;
  label: string;
  date: string;
  kind: 'kickoff' | 'due' | 'review' | 'final' | 'film';
  description?: string;
}

const Calendar: React.FC = () => {
  const { apiFetch, user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewRole, setViewRole] = useState<'PLANNER' | 'SME'>('PLANNER');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLabel, setFormLabel] = useState('');
  const [formDate, setFormDate] = useState('2026-07-13');
  const [formKind, setFormKind] = useState<'kickoff' | 'due' | 'review' | 'final' | 'film'>('film');
  const [formCourseId, setFormCourseId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (user) {
      setViewRole(user.global_role === 'SME' ? 'SME' : 'PLANNER');
    }
  }, [user]);

  useEffect(() => {
    const fetchEventsAndCourses = async () => {
      try {
        const [list, courseList] = await Promise.all([
          apiFetch('/calendar'),
          apiFetch('/courses')
        ]);
        setEvents(list);
        setCourses(courseList || []);
      } catch (err) {
        console.error('Failed to load calendar events', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEventsAndCourses();
  }, [viewRole, refreshTrigger]);

  const handleSubmitEvent = async () => {
    if (!formLabel.trim()) {
      setFormError('일정명을 입력해 주세요.');
      return;
    }
    if (!formDate) {
      setFormError('날짜를 지정해 주세요.');
      return;
    }
    setFormError('');
    try {
      await apiFetch('/calendar', {
        method: 'POST',
        body: JSON.stringify({
          label: formLabel,
          date: formDate,
          kind: formKind,
          course_id: formCourseId || null,
          description: formDescription
        })
      });
      // reset form
      setFormLabel('');
      setFormDate('2026-07-13');
      setFormKind('film');
      setFormCourseId('');
      setFormDescription('');
      setIsModalOpen(false);
      // refresh events
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Failed to create calendar event', err);
      setFormError('일정 등록에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fg-3)' }}>
        캘린더 일정 로딩 중...
      </div>
    );
  }

  const getEventColors = (kind: string) => {
    switch (kind) {
      case 'kickoff':
        return { bg: 'var(--stage-plan-bg)', fg: 'var(--stage-plan-fg)', bar: 'var(--stage-plan-fg)' };
      case 'due':
        return { bg: 'var(--primary-tint)', fg: 'var(--primary-hover)', bar: 'var(--primary)' };
      case 'review':
        return { bg: 'var(--info-bg)', fg: 'var(--info-fg)', bar: 'var(--info)' };
      case 'final':
        return { bg: 'var(--success-bg)', fg: 'var(--success-fg)', bar: 'var(--success)' };
      default:
        return { bg: 'var(--stage-film-bg)', fg: 'var(--stage-film-fg)', bar: 'var(--stage-film-fg)' };
    }
  };

  // We render July 2026 (Wednesday July 1 offset 3)
  // Weeks represent 35 grid cells
  const dows = ['일', '월', '화', '수', '목', '금', '토'];
  const cells: any[] = [];
  const targetMonthStr = '2026-07-';

  for (let i = 0; i < 35; i++) {
    const jd = i - 2; // July 1 is Wed (cell 3 -> jd 1)
    const inMonth = jd >= 1 && jd <= 31;
    const num = inMonth ? jd : (jd < 1 ? 30 + jd : jd - 31);
    const dateStr = inMonth ? `${targetMonthStr}${String(jd).padStart(2, '0')}` : '';
    const cellEvents = events.filter(e => e.date.startsWith(dateStr));
    const isToday = inMonth && jd === 13; // mock today as July 13
    
    cells.push({
      num,
      inMonth,
      isToday,
      events: cellEvents,
      dateStr
    });
  }

  // Group into weeks
  const weeks = [0, 1, 2, 3, 4].map(w => cells.slice(w * 7, w * 7 + 7));

  // Upcoming: events with date in the future sorted
  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date('2026-07-13')) // from mock today
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>일정 · 마감 캘린더</div>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '7px 14px',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--r-md)',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              transition: 'background 0.12s'
            }}
          >
            + 일정 추가
          </button>
        </div>

        {/* Role switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px', borderRadius: '999px', background: 'var(--bg-sunken)' }}>
          <button 
            onClick={() => setViewRole('PLANNER')}
            style={{
              padding: '6px 13px',
              border: 'none',
              borderRadius: '999px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
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
              border: 'none',
              borderRadius: '999px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: viewRole === 'SME' ? 'var(--bg-card)' : 'transparent',
              color: viewRole === 'SME' ? 'var(--primary-hover)' : 'var(--fg-3)'
            }}
          >
            강사
          </button>
        </div>
      </header>

      {/* Split body: Left Calendar, Right Upcoming list */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        
        {/* Left Calendar Grid */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '22px 26px' }}>
          {/* Calendar top controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button style={{ width: '34px', height: '34px', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', background: 'var(--bg-card)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={17} />
              </button>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, minWidth: '118px', textAlign: 'center' }}>
                2026년 7월
              </div>
              <button style={{ width: '34px', height: '34px', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', background: 'var(--bg-card)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={17} />
              </button>
            </div>
            <button style={{ padding: '7px 13px', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', background: 'var(--bg-card)', color: 'var(--fg-2)', fontSize: '12.5px', fontWeight: 700 }}>
              오늘
            </button>
          </div>

          {/* Grid Box */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden'
          }}>
            {/* Days of week header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-sunken)' }}>
              {dows.map((d, i) => (
                <div key={d} style={{ padding: '10px 0', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: i === 0 ? 'var(--error-fg)' : 'var(--fg-3)' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div style={{ flex: 1, display: 'grid', gridTemplateRows: 'repeat(5, 1fr)' }}>
              {weeks.map((week, wIdx) => (
                <div key={wIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
                  {week.map((cell: any, cIdx: number) => {
                    const dow = cIdx;
                    return (
                      <div
                        key={cIdx}
                        style={{
                          borderRight: '1px solid var(--border)',
                          padding: '6px 7px',
                          overflow: 'hidden',
                          backgroundColor: cell.isToday ? 'var(--primary-tint-2)' : (cell.inMonth ? 'var(--bg-card)' : 'var(--bg-page)'),
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            fontFamily: 'var(--font-num)',
                            fontSize: '12px',
                            fontWeight: cell.isToday ? 800 : (cell.inMonth ? 600 : 400),
                            backgroundColor: cell.isToday ? 'var(--primary)' : 'transparent',
                            color: cell.isToday ? '#fff' : (cell.inMonth ? (dow === 0 ? 'var(--error-fg)' : 'var(--fg-2)') : 'var(--fg-4)'),
                          }}>
                            {cell.num}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '3px', overflowY: 'auto', flex: 1 }}>
                          {cell.events.map((e: any) => {
                            const colors = getEventColors(e.kind);
                            return (
                              <div
                                key={e.id}
                                onClick={() => e.course_id && navigate(`/courses/${e.course_id}`)}
                                title={`${e.label}${e.description ? `\n- ${e.description}` : ''}`}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '3px 6px',
                                  borderRadius: '5px',
                                  backgroundColor: colors.bg,
                                  borderLeft: `3px solid ${colors.bar}`,
                                  cursor: 'pointer'
                                }}
                              >
                                <span style={{ fontSize: '10.5px', fontWeight: 700, color: colors.fg, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {e.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Upcoming Side Panel */}
        <div style={{
          width: '320px',
          flexShrink: 0,
          borderLeft: '1px solid var(--border)',
          background: 'var(--bg-card)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}>
          <div style={{ padding: '18px 20px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700 }}>다가오는 일정</div>
            <div style={{ fontSize: '12px', color: 'var(--fg-4)', marginTop: '2px' }}>
              오늘 이후 {upcomingEvents.length}건
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px 20px' }}>
            {upcomingEvents.map(e => {
              const colors = getEventColors(e.kind);
              const eventDate = new Date(e.date);
              const diffTime = eventDate.getTime() - new Date('2026-07-13').getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const dday = diffDays === 0 ? 'D-DAY' : `D-${diffDays}`;

              return (
                <div
                  key={e.id}
                  onClick={() => e.course_id && navigate(`/courses/${e.course_id}`)}
                  title={`${e.label}${e.description ? `\n- ${e.description}` : ''}`}
                  style={{
                    display: 'flex',
                    gap: '13px',
                    padding: '13px 10px',
                    borderRadius: 'var(--r-md)',
                    cursor: 'pointer',
                    transition: 'background 0.12s'
                  }}
                  className="up"
                >
                  <div style={{ width: '46px', flexShrink: 0, textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-num)', fontSize: '19px', fontWeight: 800, color: 'var(--fg-1)', lineHeight: '1.1' }}>
                      {eventDate.getDate()}
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--fg-4)', fontWeight: 700 }}>
                      {dows[eventDate.getDay()]}
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0, borderLeft: '1px solid var(--border)', paddingLeft: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '3px', backgroundColor: colors.bar, flexShrink: 0 }}></span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {e.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--fg-3)', marginTop: '3px' }}>
                      {e.course_name}
                    </div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '7px',
                      fontSize: '10.5px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: 'var(--primary-tint)',
                      color: 'var(--primary-hover)'
                    }}>
                      {dday}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            width: '420px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            boxShadow: 'var(--shadow-xl)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--fg-1)' }}>새 일정 추가</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--fg-3)' }}>일정명</label>
              <input
                type="text"
                value={formLabel}
                onChange={e => setFormLabel(e.target.value)}
                placeholder="예: 원고 검토 회의"
                style={{
                  padding: '10px',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--r-sm)',
                  backgroundColor: 'var(--bg-sunken)',
                  color: 'var(--fg-1)',
                  fontSize: '13px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--fg-3)' }}>날짜</label>
              <input
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                style={{
                  padding: '10px',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--r-sm)',
                  backgroundColor: 'var(--bg-sunken)',
                  color: 'var(--fg-1)',
                  fontSize: '13px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--fg-3)' }}>구분</label>
              <select
                value={formKind}
                onChange={e => setFormKind(e.target.value as any)}
                style={{
                  padding: '10px',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--r-sm)',
                  backgroundColor: 'var(--bg-sunken)',
                  color: 'var(--fg-1)',
                  fontSize: '13px'
                }}
              >
                <option value="kickoff">회의/계획 (파랑)</option>
                <option value="due">마감일 (주황)</option>
                <option value="review">검수일 (하늘)</option>
                <option value="final">최종확정 (초록)</option>
                <option value="film">촬영/기타 (보라)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--fg-3)' }}>연관 과정 (선택)</label>
              <select
                value={formCourseId}
                onChange={e => setFormCourseId(e.target.value)}
                style={{
                  padding: '10px',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--r-sm)',
                  backgroundColor: 'var(--bg-sunken)',
                  color: 'var(--fg-1)',
                  fontSize: '13px'
                }}
              >
                <option value="">공통 일정</option>
                {courses.map(c => (
                  <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--fg-3)' }}>설명</label>
              <textarea
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                placeholder="일정 세부 사항 입력"
                rows={3}
                style={{
                  padding: '10px',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--r-sm)',
                  backgroundColor: 'var(--bg-sunken)',
                  color: 'var(--fg-1)',
                  fontSize: '13px',
                  resize: 'none'
                }}
              />
            </div>

            {formError && (
              <div style={{ fontSize: '12px', color: 'var(--error-fg)', fontWeight: 700 }}>{formError}</div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: '9px 15px',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--bg-card)',
                  color: 'var(--fg-2)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={handleSubmitEvent}
                style={{
                  padding: '9px 18px',
                  border: 'none',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Calendar;
