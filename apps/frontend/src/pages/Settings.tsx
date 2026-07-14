import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Bell, 
  Lock, 
  Check
} from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState('010-2314-5xxx');
  const [notiMute, setNotiMute] = useState(false);
  const [notiFrequency, setNotiFrequency] = useState('realtime');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('설정이 저장되었습니다.');
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
        flexShrink: 0
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>설정</div>
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '26px 32px 40px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          
          <form onSubmit={handleSave} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            boxShadow: 'var(--shadow-md)',
            padding: '28px 30px'
          }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Profile section */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <User size={18} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg-1)' }}>프로필 설정</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-3)', display: 'block', marginBottom: '6px' }}>이름</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', outline: 'none', fontSize: '13.5px', background: 'var(--bg-card)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-3)', display: 'block', marginBottom: '6px' }}>이메일 (변경 불가)</label>
                    <input 
                      type="text" 
                      disabled
                      value={email}
                      style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', outline: 'none', fontSize: '13.5px', background: 'var(--bg-page)', color: 'var(--fg-4)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-3)', display: 'block', marginBottom: '6px' }}>전화번호</label>
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', outline: 'none', fontSize: '13.5px', background: 'var(--bg-card)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Notification preferences */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <Bell size={18} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg-1)' }}>알림 설정</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                      type="checkbox" 
                      id="mute"
                      checked={notiMute}
                      onChange={(e) => setNotiMute(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="mute" style={{ fontSize: '13.5px', color: 'var(--fg-2)', cursor: 'pointer' }}>모든 소리 및 푸시 알림 끄기 (방해금지)</label>
                  </div>

                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg-3)', display: 'block', marginBottom: '6px' }}>알림 수신 주기</label>
                    <select 
                      value={notiFrequency}
                      onChange={(e) => setNotiFrequency(e.target.value)}
                      style={{ width: '240px', height: '40px', padding: '0 12px', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', fontSize: '13.5px', outline: 'none', background: 'var(--bg-card)' }}
                    >
                      <option value="realtime">실시간 전송</option>
                      <option value="hourly">1시간 주기 모음</option>
                      <option value="daily">매일 아침 요약 메일</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Security Preferences */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <Lock size={18} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fg-1)' }}>보안 설정</span>
                </div>

                <button 
                  type="button"
                  onClick={() => alert('비밀번호 재설정 이메일이 발송되었습니다.')}
                  style={{
                    padding: '9px 14px',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--r-md)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--fg-2)',
                    fontSize: '13px',
                    fontWeight: 700
                  }}
                >
                  비밀번호 재설정 링크 발송
                </button>
              </div>

            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '28px', paddingTop: '18px', borderTop: '1px solid var(--border)' }}>
              <button 
                type="submit"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  borderRadius: 'var(--r-md)',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  fontSize: '13.5px',
                  fontWeight: 700
                }}
              >
                <Check size={16} /> 설정 저장
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
