import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ClipboardCheck, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  ArrowRight,
  FileText
} from 'lucide-react';

interface ReviewItem {
  deliverable_id: string;
  current_status: string;
  updated_at: string;
  lesson: {
    lesson_id: string;
    lesson_no: number;
    title: string;
    course: {
      course_id: string;
      course_name: string;
      milestones: any;
      members: any[];
    };
  };
}

const ReviewQueue: React.FC = () => {
  const { apiFetch } = useAuth();
  const navigate = useNavigate();

  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('전체');

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const result = await apiFetch('/review-queue');
        setQueue(result);
      } catch (err) {
        console.error('Failed to load review queue', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fg-3)' }}>
        검수 대기 목록 로딩 중...
      </div>
    );
  }

  // Get unique course names in queue for filter chips
  const courses = ['전체', ...Array.from(new Set(queue.map(item => item.lesson.course.course_name)))];

  // Filtering
  const filtered = queue.filter(item => {
    const matchSearch = item.lesson.title.toLowerCase().includes(search.toLowerCase()) ||
      item.lesson.course.course_name.toLowerCase().includes(search.toLowerCase());
    
    if (selectedCourse === '전체') return matchSearch;
    return matchSearch && item.lesson.course.course_name === selectedCourse;
  });



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
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>검수 목록</div>
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
            placeholder="원고·과정·강사 검색" 
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
      </header>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '26px 32px 40px' }}>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700 }}>
            검수 대기 원고 <span style={{ color: 'var(--primary)' }}>{filtered.length}건</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--fg-3)', marginTop: '4px' }}>
            강사가 제출한 새 버전을 과정과 상관없이 한 곳에서 검수해요
          </div>
        </div>

        {/* 3-KPI Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning-fg)' }}>
              <ClipboardCheck size={17} />
              <span style={{ fontSize: '12.5px', fontWeight: 700 }}>검수 대기</span>
            </div>
            <div style={{ fontFamily: 'var(--font-num)', fontSize: '30px', fontWeight: 700, marginTop: '8px' }}>
              {queue.filter(q => q.current_status !== 'REVISION_REQUESTED').length}
              <span style={{ fontSize: '14px', color: 'var(--fg-3)', fontWeight: 600, marginLeft: '3px' }}>건</span>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error-fg)' }}>
              <AlertTriangle size={17} />
              <span style={{ fontSize: '12.5px', fontWeight: 700 }}>수정 요청중</span>
            </div>
            <div style={{ fontFamily: 'var(--font-num)', fontSize: '30px', fontWeight: 700, marginTop: '8px' }}>
              {queue.filter(q => q.current_status === 'REVISION_REQUESTED').length}
              <span style={{ fontSize: '14px', color: 'var(--fg-3)', fontWeight: 600, marginLeft: '3px' }}>건</span>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--fg-3)' }}>
              <Clock size={17} />
              <span style={{ fontSize: '12.5px', fontWeight: 700 }}>평균 대기</span>
            </div>
            <div style={{ fontFamily: 'var(--font-num)', fontSize: '30px', fontWeight: 700, marginTop: '8px' }}>
              1.3
              <span style={{ fontSize: '14px', color: 'var(--fg-3)', fontWeight: 600, marginLeft: '3px' }}>일</span>
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {courses.map(c => {
            const on = selectedCourse === c;
            const count = c === '전체' ? queue.length : queue.filter(item => item.lesson.course.course_name === c).length;
            return (
              <button
                key={c}
                onClick={() => setSelectedCourse(c)}
                style={{
                  padding: '8px 15px',
                  borderRadius: '999px',
                  backgroundColor: on ? 'var(--fg-1)' : 'var(--bg-card)',
                  color: on ? '#fff' : 'var(--fg-2)',
                  border: on ? 'none' : '1px solid var(--border-strong)',
                  fontSize: '13px',
                  fontWeight: on ? 700 : 600,
                  cursor: 'pointer'
                }}
              >
                {c} {count}
              </button>
            );
          })}
          <div style={{ flex: 1 }}></div>
          <button style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--border-strong)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--fg-2)',
            fontSize: '13px',
            fontWeight: 700
          }}>
            <Filter size={15} /> 정렬: 마감순
          </button>
        </div>

        {/* Queue Table */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px 22px',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--bg-sunken)',
            fontSize: '11.5px',
            fontWeight: 700,
            color: 'var(--fg-4)'
          }}>
            <span style={{ flex: 1, minWidth: 0 }}>원고 · 과정</span>
            <span style={{ width: '118px' }}>강사</span>
            <span style={{ width: '60px', textAlign: 'center' }}>버전</span>
            <span style={{ width: '120px' }}>제출</span>
            <span style={{ width: '110px', textAlign: 'right' }}>마감</span>
            <span style={{ width: '118px' }}></span>
          </div>

          {filtered.map((item, idx) => {
            const smeMember = item.lesson.course.members.find(m => m.role_in_course === 'SME');
            const smeName = smeMember?.user.name || '미배정';
            const initial = smeName.charAt(0);
            
            return (
              <div
                key={idx}
                onClick={() => navigate(`/courses/${item.lesson.course.course_id}/lessons/${item.lesson.lesson_id}/script`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 22px',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'background 0.12s'
                }}
                className="qrow"
              >
                <span style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--r-md)',
                  backgroundColor: 'var(--primary-tint-2)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-hover)',
                  flexShrink: 0
                }}>
                  <FileText size={19} />
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--fg-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.lesson.lesson_no}차시 — {item.lesson.title}
                    </span>
                    {item.current_status === 'REVISION_REQUESTED' && (
                      <span style={{ fontSize: '10.5px', fontWeight: 800, padding: '2px 7px', borderRadius: '999px', backgroundColor: 'var(--error-bg)', color: 'var(--error-fg)' }}>
                        재검수
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--fg-3)', marginTop: '3px' }}>
                    {item.lesson.course.course_name}
                  </div>
                </div>

                <div style={{ width: '118px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: '#D5E3F2',
                    color: '#245C92',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700
                  }}>
                    {initial}
                  </span>
                  <span style={{ fontSize: '12.5px', color: 'var(--fg-2)' }}>{smeName}</span>
                </div>

                <span style={{ width: '60px', textAlign: 'center', fontFamily: 'var(--font-num)', fontSize: '13px', fontWeight: 800, color: 'var(--primary-hover)' }}>
                  v1
                </span>

                <span style={{ width: '120px', fontSize: '12.5px', color: 'var(--fg-3)' }}>
                  {new Date(item.updated_at).toLocaleDateString()}
                </span>

                <span style={{ width: '110px', textAlign: 'right', fontSize: '12.5px', color: 'var(--fg-2)' }}>
                  {item.lesson.course.milestones?.script_deadline || '기한 없음'}
                </span>

                <span style={{
                  width: '118px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 0',
                  borderRadius: 'var(--r-md)',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700
                }}>
                  검수 시작 <ArrowRight size={15} />
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default ReviewQueue;
