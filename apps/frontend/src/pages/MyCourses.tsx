import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface CourseItem {
  course_id: string;
  course_name: string;
  dev_type: string;
  status: string;
  lesson_count: number;
}

const MyCourses: React.FC = () => {
  const { apiFetch } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const result = await apiFetch('/courses');
        setCourses(result);
      } catch (err) {
        console.error('Failed to load my courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fg-3)' }}>
        참여 과정 목록 로딩 중...
      </div>
    );
  }

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
        flexShrink: 0
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>참여 과정 목록</div>
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '26px 32px 40px' }}>
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700 }}>
            참여 중인 연수 과정 <span style={{ color: 'var(--primary)' }}>{courses.length}개</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--fg-3)', marginTop: '4px' }}>
            원고를 집필하고 기획자와 협의 중인 리스트입니다.
          </div>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '18px'
        }}>
          {courses.map(c => (
            <div 
              key={c.course_id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-xl)',
                boxShadow: 'var(--shadow-sm)',
                padding: '20px 22px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 'var(--r-pill)',
                  backgroundColor: 'var(--primary-tint-2)',
                  color: 'var(--primary-hover)'
                }}>
                  {c.dev_type}
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 'var(--r-pill)',
                  backgroundColor: 'var(--success-bg)',
                  color: 'var(--success-fg)'
                }}>
                  {c.status}
                </span>
              </div>

              <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '12px', color: 'var(--fg-1)', lineHeight: 1.4 }}>
                {c.course_name}
              </div>

              <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--fg-3)' }}>
                <BookOpen size={15} /> 전체 {c.lesson_count}차시 분량
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <button 
                  onClick={() => navigate(`/courses/${c.course_id}`)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 14px',
                    borderRadius: 'var(--r-md)',
                    backgroundColor: 'var(--bg-sunken)',
                    color: 'var(--fg-2)',
                    fontSize: '13px',
                    fontWeight: 700
                  }}
                >
                  과정 상세정보 <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
