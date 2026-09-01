import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUi } from '../context/UiContext';
import { 
  User, 
  Bell, 
  Lock, 
  Check
} from 'lucide-react';

const Settings: React.FC = () => {
  const { user, apiFetch } = useAuth();
  const { toast } = useUi();

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [notiMute, setNotiMute] = useState(false);
  const [notiFrequency, setNotiFrequency] = useState('realtime');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 저장해 둔 설정을 불러온다. 예전에는 화면을 열 때마다 기본값이 보였다.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await apiFetch('/auth/me');
        if (cancelled) return;
        setName(me.name || '');
        setPhone(me.phone || '');
        setNotiMute(Boolean(me.noti_muted));
        setNotiFrequency(me.noti_frequency || 'realtime');
      } catch {
        // 못 불러와도 화면은 쓸 수 있게 둔다. 저장할 때 다시 알려 준다.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [apiFetch]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (!name.trim()) {
      toast.error('이름을 입력해 주세요.');
      return;
    }

    setSaving(true);
    try {
      const updated = await apiFetch('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          noti_muted: notiMute,
          noti_frequency: notiFrequency,
        }),
      });

      // 사이드바에 보이는 이름도 함께 맞춘다.
      const saved = localStorage.getItem('sme_user');
      if (saved) {
        localStorage.setItem('sme_user', JSON.stringify({ ...JSON.parse(saved), name: updated.name }));
      }

      toast.success('설정을 저장했습니다.', '이름은 새로고침 후 사이드바에도 반영됩니다.');
    } catch (err: any) {
      toast.error('설정을 저장하지 못했습니다', err.message || '잠시 후 다시 시도해 주세요.');
    } finally {
      setSaving(false);
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
        flexShrink: 0
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>설정</div>
        </div>
      </header>

      {/* Content */}
      <div className="page-pad" style={{ flex: 1, overflowY: 'auto', padding: '26px 32px 40px' }}>
        <div style={{ maxWidth: 'min(640px, 100%)', margin: '0 auto' }}>
          
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
                  onClick={() => toast.info('비밀번호는 운영팀에서 변경해 드립니다', '문의함으로 요청을 남겨 주시면 담당자가 처리합니다.')}
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
                  backgroundColor: (saving || loading) ? 'var(--border-strong)' : 'var(--primary)',
                  color: '#fff',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: (saving || loading) ? 'not-allowed' : 'pointer'
                }}
                disabled={saving || loading}
              >
                <Check size={16} /> {saving ? '저장 중…' : '설정 저장'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
