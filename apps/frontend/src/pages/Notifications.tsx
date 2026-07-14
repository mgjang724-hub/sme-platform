import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Check, 
  MessageSquare, 
  Flag, 
  AlertTriangle, 
  HelpCircle, 
  ArrowRight 
} from 'lucide-react';

interface NotificationItem {
  id: string;
  kind: string;
  title: string;
  desc: string;
  time: string;
  cta: string;
  href: string;
  unread: boolean;
}

const Notifications: React.FC = () => {
  const { apiFetch, user } = useAuth();
  const navigate = useNavigate();

  const [list, setList] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewRole, setViewRole] = useState<'PLANNER' | 'SME'>('PLANNER');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      setViewRole(user.global_role === 'SME' ? 'SME' : 'PLANNER');
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const items = await apiFetch('/notifications');
      setList(items);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [viewRole]);

  const handleMarkAll = async () => {
    try {
      await apiFetch('/notifications/mark-all', { method: 'POST' });
      await loadNotifications();
    } catch (err) {
      alert('오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fg-3)' }}>
        알림 로딩 중...
      </div>
    );
  }

  const unreadCount = list.filter(n => n.unread).length;
  const filtered = list.filter(n => filter === 'all' || n.kind === filter);

  const getIcon = (kind: string) => {
    switch (kind) {
      case 'feedback':
        return { icon: MessageSquare, bg: 'var(--info-bg)', fg: 'var(--info-fg)', label: '피드백' };
      case 'status':
        return { icon: Flag, bg: 'var(--primary-tint)', fg: 'var(--primary-hover)', label: '상태 변경' };
      case 'deadline':
        return { icon: AlertTriangle, bg: 'var(--error-bg)', fg: 'var(--error-fg)', label: '마감' };
      default:
        return { icon: HelpCircle, bg: 'var(--warning-bg)', fg: 'var(--warning-fg)', label: '문의' };
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
        gap: '18px',
        flexShrink: 0
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>알림</div>
          {unreadCount > 0 && (
            <span style={{ fontSize: '11.5px', fontWeight: 800, padding: '2px 9px', borderRadius: '999px', background: 'var(--primary-tint)', color: 'var(--primary-hover)' }}>
              새 알림 {unreadCount}
            </span>
          )}
        </div>

        {/* View Toggler */}
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

        <button 
          onClick={handleMarkAll}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 14px',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--r-md)',
            background: 'var(--bg-card)',
            color: 'var(--fg-2)',
            fontSize: '13px',
            fontWeight: 700
          }}
        >
          <Check size={15} /> 모두 읽음
        </button>
      </header>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px 48px' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          
          {/* Category Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: '전체' },
              { id: 'feedback', label: '피드백' },
              { id: 'status', label: '상태 변경' },
              { id: 'deadline', label: '마감' },
              { id: 'inquiry', label: '문의' }
            ].map(f => {
              const on = filter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '999px',
                    backgroundColor: on ? 'var(--fg-1)' : 'var(--bg-card)',
                    color: on ? '#fff' : 'var(--fg-2)',
                    border: on ? 'none' : '1px solid var(--border-strong)',
                    fontSize: '13px',
                    fontWeight: on ? 700 : 600,
                    cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Group of Notifications */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', marginBottom: '26px' }}>
            {filtered.map(noti => {
              const detail = getIcon(noti.kind);
              return (
                <div
                  key={noti.id}
                  onClick={() => navigate(noti.href)}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    backgroundColor: noti.unread ? 'var(--primary-tint-2)' : 'transparent',
                    transition: 'background 0.12s'
                  }}
                  className="noti"
                >
                  <span style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--r-md)',
                    backgroundColor: detail.bg,
                    color: detail.fg,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <detail.icon size={19} />
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--fg-1)' }}>{noti.title}</span>
                      {noti.unread && <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--primary)', flexShrink: 0 }}></span>}
                      <span style={{ marginLeft: 'auto', fontSize: '11.5px', color: 'var(--fg-4)' }}>{noti.time}</span>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--fg-3)', marginTop: '4px', lineHeight: 1.6 }}>{noti.desc}</div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '9px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: '999px',
                        backgroundColor: detail.bg,
                        color: detail.fg
                      }}>
                        {detail.label}
                      </span>
                      <span className="goto" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-hover)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {noti.cta} <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fg-3)' }}>
                알림 목록이 비어 있습니다.
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', padding: '8px 0', fontSize: '12.5px', color: 'var(--fg-4)' }}>
            지난 알림은 30일간 보관돼요
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
