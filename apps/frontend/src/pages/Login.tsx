import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ClipboardCheck, 
  GraduationCap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn 
} from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [role, setRole] = useState<'PLANNER' | 'SME'>('PLANNER');
  const [email, setEmail] = useState('planner@test.com');
  const [password, setPassword] = useState('test1234');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleRoleChange = (selected: 'PLANNER' | 'SME') => {
    setRole(selected);
    setEmail(selected === 'PLANNER' ? 'planner@test.com' : 'sme@test.com');
    setPassword('test1234');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const user = await login(email, password);
      if (user.global_role === 'PLANNER' || user.global_role === 'ADMIN') {
        navigate('/home');
      } else {
        navigate('/my-tasks');
      }
    } catch (err: any) {
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-page)',
      fontFamily: 'var(--font-sans)',
      color: 'var(--fg-1)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative background bubbles */}
      <div style={{
        position: 'absolute',
        width: '520px',
        height: '520px',
        borderRadius: '50%',
        background: 'var(--primary-tint)',
        top: '-180px',
        right: '-140px',
        opacity: 0.6,
      }}></div>
      <div style={{
        position: 'absolute',
        width: '360px',
        height: '360px',
        borderRadius: '50%',
        background: 'var(--primary-tint-2)',
        bottom: '-160px',
        left: '-120px',
        opacity: 0.7,
      }}></div>

      {/* Login Card */}
      <form onSubmit={handleSubmit} style={{
        position: 'relative',
        width: '400px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-2xl)',
        boxShadow: 'var(--shadow-lg)',
        padding: '40px 36px',
        zIndex: 2,
      }}>
        {/* Demo Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <span style={{
            fontSize: '11.5px',
            fontWeight: 800,
            color: '#D97706',
            backgroundColor: '#FEF3C7',
            padding: '4px 10px',
            borderRadius: 'var(--r-sm)',
            border: '1px solid #FDE68A',
            letterSpacing: '0.3px'
          }}>시범 데모 운영 버전 (Demo Sandbox)</span>
        </div>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '24px', fontWeight: 900, color: 'var(--brand-orange)' }}>i-Scream</span>
          <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--fg-3)', marginTop: '4px' }}>원격교육연수원</span>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '22px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700 }}>강사 원고 소통 플랫폼</div>
          <div style={{ fontSize: '13px', color: 'var(--fg-3)', marginTop: '6px' }}>SME Script Platform 로그인</div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            marginTop: '16px',
            padding: '10px 12px',
            backgroundColor: 'var(--error-bg)',
            color: 'var(--error-fg)',
            borderRadius: 'var(--r-sm)',
            fontSize: '12.5px',
            fontWeight: 700,
            border: '1px solid var(--error)',
          }}>
            {error}
          </div>
        )}

        {/* Role Select Button Grid */}
        <div style={{ marginTop: '26px' }}>
          <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-3)', marginBottom: '8px' }}>역할 선택</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleRoleChange('PLANNER')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '6px',
                padding: '14px',
                border: '1.5px solid ' + (role === 'PLANNER' ? 'var(--primary)' : 'var(--border-strong)'),
                borderRadius: 'var(--r-md)',
                backgroundColor: role === 'PLANNER' ? 'var(--primary-tint)' : 'var(--bg-card)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <ClipboardCheck size={20} style={{ color: role === 'PLANNER' ? 'var(--primary-hover)' : 'var(--fg-3)' }} />
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--fg-1)' }}>기획자</span>
              <span style={{ fontSize: '11px', color: 'var(--fg-3)' }}>PLANNER · 검수·안내</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('SME')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '6px',
                padding: '14px',
                border: '1.5px solid ' + (role === 'SME' ? 'var(--primary)' : 'var(--border-strong)'),
                borderRadius: 'var(--r-md)',
                backgroundColor: role === 'SME' ? 'var(--primary-tint)' : 'var(--bg-card)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <GraduationCap size={20} style={{ color: role === 'SME' ? 'var(--primary-hover)' : 'var(--fg-3)' }} />
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--fg-1)' }}>강사</span>
              <span style={{ fontSize: '11px', color: 'var(--fg-3)' }}>SME · 원고 제출</span>
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'block' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-3)' }}>이메일</span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '6px',
              padding: '0 12px',
              height: '44px',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--r-md)',
              backgroundColor: 'var(--bg-card)',
            }}>
              <Mail size={17} style={{ color: 'var(--fg-4)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@iscream.co.kr"
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'none',
                  fontSize: '14px',
                  color: 'var(--fg-1)',
                }}
              />
            </div>
          </label>

          <label style={{ display: 'block' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-3)' }}>비밀번호</span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '6px',
              padding: '0 12px',
              height: '44px',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--r-md)',
              backgroundColor: 'var(--bg-card)',
            }}>
              <Lock size={17} style={{ color: 'var(--fg-4)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'none',
                  fontSize: '14px',
                  color: 'var(--fg-1)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ color: 'var(--fg-4)', display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>
        </div>

        {/* Remember Login & Find PW */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12.5px', color: 'var(--fg-3)', cursor: 'pointer' }}>
            <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
            로그인 상태 유지
          </label>
          <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: '12.5px', color: 'var(--primary)' }}>비밀번호 찾기</a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '20px',
            height: '46px',
            width: '100%',
            borderRadius: 'var(--r-md)',
            background: 'var(--primary)',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 700,
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {role === 'PLANNER' ? '기획자로 로그인' : '강사로 로그인'}
          <LogIn size={18} />
        </button>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--fg-4)' }}>
          계정 문의는 담당 기획자 또는 <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--primary)' }}>운영팀</a>에게 연락해 주세요.
        </div>
      </form>
    </div>
  );
};

export default Login;
