import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronRight, 
  UserPlus, 
  Trash2, 
  Mail
} from 'lucide-react';

interface Member {
  id: string;
  user_id: string;
  role_in_course: string;
  invited_at: string;
  user: {
    name: string;
    email: string;
    global_role: string;
  };
}

const Members: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const { apiFetch } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [roleInCourse, setRoleInCourse] = useState('SME');
  const [submitting, setSubmitting] = useState(false);

  const loadMembers = async () => {
    if (!courseId) return;
    try {
      const result = await apiFetch(`/courses/${courseId}/members`);
      setMembers(result);
    } catch (err: any) {
      console.error(err.message || '참여자 목록을 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [courseId]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !courseId) return;

    setSubmitting(true);
    try {
      await apiFetch(`/courses/${courseId}/members`, {
        method: 'POST',
        body: JSON.stringify({
          email,
          role_in_course: roleInCourse
        })
      });
      setEmail('');
      loadMembers();
      alert('참여자가 정상적으로 추가되었습니다.');
    } catch (err: any) {
      alert(err.message || '참여자를 추가하는 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeMember = async (userId: string) => {
    if (!courseId) return;
    const confirm = window.confirm('해당 유저의 과정 접근 권한을 회수하시겠습니까?');
    if (!confirm) return;

    try {
      await apiFetch(`/courses/${courseId}/members/${userId}/revoke`, {
        method: 'POST',
        body: JSON.stringify({ reason: '기획자 요청에 의한 권한 회수' })
      });
      loadMembers();
    } catch (err: any) {
      alert(err.message || '권한 회수 처리 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fg-3)' }}>
        참여자 목록 로딩 중...
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
        gap: '12px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--fg-4)' }}>
          <Link to="/courses" style={{ color: 'var(--fg-4)' }}>과정 관리</Link>
          <ChevronRight size={13} />
          <Link to={`/courses/${courseId}`} style={{ color: 'var(--fg-4)' }}>과정 상세</Link>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--fg-2)', fontWeight: 700 }}>참여자 관리</span>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '26px 32px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '22px' }}>
          
          {/* Left Pane: Members Table */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            boxShadow: 'var(--shadow-sm)',
            padding: '22px 24px'
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
              배정된 참여자 리스트
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border)', color: 'var(--fg-3)', fontWeight: 700 }}>
                    <th style={{ padding: '12px 8px' }}>이름</th>
                    <th style={{ padding: '12px 8px' }}>이메일</th>
                    <th style={{ padding: '12px 8px' }}>과정 내 역할</th>
                    <th style={{ padding: '12px 8px' }}>배정일</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--border)', color: 'var(--fg-1)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 700 }}>{m.user.name}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--fg-3)' }}>{m.user.email}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: m.role_in_course === 'PLANNER' ? '#FFF1EC' : '#E8F1FB',
                          color: m.role_in_course === 'PLANNER' ? '#B7521F' : '#245C92'
                        }}>
                          {m.role_in_course}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--fg-4)' }}>
                        {new Date(m.invited_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        {m.role_in_course !== 'PLANNER' && (
                          <button 
                            onClick={() => handleRevokeMember(m.user_id)}
                            style={{ color: 'var(--error-fg)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12.5px' }}
                          >
                            <Trash2 size={14} /> 권한 회수
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Pane: Add Member Form */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            boxShadow: 'var(--shadow-sm)',
            padding: '22px 24px',
            alignSelf: 'start'
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '4px' }}>
              새 참여자 초대/배정
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--fg-3)', marginBottom: '18px' }}>
              이메일 주소로 강사 또는 PM을 추가 배정할 수 있습니다.
            </div>

            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--fg-3)', display: 'block', marginBottom: '6px' }}>
                  이메일 주소
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0 12px',
                  height: '42px',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--r-md)'
                }}>
                  <Mail size={16} style={{ color: 'var(--fg-4)' }} />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@test.com"
                    style={{ flex: 1, border: 'none', outline: 'none', background: 'none', fontSize: '13.5px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--fg-3)', display: 'block', marginBottom: '6px' }}>
                  역할 지정
                </label>
                <select 
                  value={roleInCourse}
                  onChange={(e) => setRoleInCourse(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 12px',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--r-md)',
                    outline: 'none',
                    fontSize: '13.5px',
                    background: 'var(--bg-card)'
                  }}
                >
                  <option value="SME">SME (원고 작성 강사)</option>
                  <option value="PM">PM (제작 프로젝트 매니저)</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  height: '42px',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1
                }}
              >
                <UserPlus size={16} /> 참여자 추가
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Members;
