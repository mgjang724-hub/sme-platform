import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  BookMarked, 
  SquareCheckBig,
  LogOut,
  ChevronDown,
  ClipboardCheck,
  MessageSquare,
  Bell,
  Calendar as CalendarIcon,
  Settings as SettingsIcon
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  href: string;
}

const AppSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  if (!user) return null;

  const role = user.global_role;

  // Supported links
  const plannerMenu: SidebarItem[] = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard, href: '/home' },
    { id: 'courses', label: '과정 관리', icon: BookOpen, href: '/courses' },
    { id: 'review', label: '검수 목록', icon: ClipboardCheck, href: '/review' },
    { id: 'guide', label: '안내센터', icon: BookMarked, href: '/guide' },
    { id: 'inbox', label: '문의함', icon: MessageSquare, href: '/inbox' },
    { id: 'notifications', label: '알림', icon: Bell, href: '/notifications' },
    { id: 'calendar', label: '일정 캘린더', icon: CalendarIcon, href: '/calendar' },
    { id: 'settings', label: '설정', icon: SettingsIcon, href: '/settings' },
  ];

  const smeMenu: SidebarItem[] = [
    { id: 'tasks', label: '내 작업', icon: SquareCheckBig, href: '/my-tasks' },
    { id: 'courses', label: '과정 목록', icon: BookOpen, href: '/courses' },
    { id: 'guide', label: '안내센터', icon: BookMarked, href: '/guide' },
    { id: 'inbox', label: '문의함', icon: MessageSquare, href: '/inbox' },
    { id: 'notifications', label: '알림', icon: Bell, href: '/notifications' },
    { id: 'calendar', label: '일정 캘린더', icon: CalendarIcon, href: '/calendar' },
    { id: 'settings', label: '설정', icon: SettingsIcon, href: '/settings' },
  ];

  const items = role === 'PLANNER' || role === 'ADMIN' ? plannerMenu : smeMenu;

  const getAvatarColors = () => {
    const isPlanner = role === 'PLANNER' || role === 'ADMIN';
    return {
      bg: isPlanner ? '#FFD8C9' : '#D5E3F2',
      fg: isPlanner ? '#B7521F' : '#245C92',
      roleBg: isPlanner ? '#FFF1EC' : '#E8F1FB',
    };
  };

  const colors = getAvatarColors();
  const initial = user.name ? user.name.charAt(0) : 'U';

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{
      width: '240px',
      flex: 'none',
      height: '100vh',
      boxSizing: 'border-box',
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-sans)',
      position: 'sticky',
      top: 0,
    }}>
      {/* Sidebar Header */}
      <div style={{
        padding: '22px 20px 16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--brand-orange)',
            letterSpacing: '-0.5px'
          }}>i-Scream</span>
          <span style={{
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--fg-3)',
            marginTop: '4px'
          }}>연수원</span>
        </div>
        <div style={{
          marginTop: '10px',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '.02em',
          color: 'var(--primary)',
        }}>SME Script Platform</div>
        <div style={{
          fontSize: '11px',
          color: 'var(--fg-4)',
          marginTop: '2px',
        }}>강사 원고 소통 플랫폼</div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          marginTop: '10px',
          fontSize: '10px',
          fontWeight: 800,
          color: '#D97706',
          backgroundColor: '#FEF3C7',
          padding: '2px 7px',
          borderRadius: '4px',
          border: '1px solid #FDE68A'
        }}>
          시범 데모 버전
        </div>
      </div>

      {/* Navigation menu */}
      <nav style={{
        flex: 1,
        padding: '14px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        overflowY: 'auto',
      }}>
        {items.map((it) => (
          <NavLink
            key={it.id}
            to={it.href}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '11px',
              padding: '10px 12px',
              borderRadius: 'var(--r-md)',
              position: 'relative',
              background: isActive ? 'var(--primary-tint)' : 'transparent',
              color: isActive ? 'var(--primary-hover)' : 'var(--fg-2)',
              fontSize: '14px',
              fontWeight: isActive ? 700 : 500,
            })}
            className="sidebar-item"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span style={{
                    width: '3px',
                    height: '18px',
                    borderRadius: '2px',
                    position: 'absolute',
                    left: 0,
                    background: 'var(--primary)',
                  }}></span>
                )}
                <it.icon size={19} className={isActive ? 'text-primary' : 'text-fg-3'} />
                {it.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile Card */}
      <div style={{ position: 'relative' }}>
        {showLogout && (
          <button
            onClick={handleLogoutClick}
            style={{
              position: 'absolute',
              bottom: '60px',
              left: '14px',
              right: '14px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              fontSize: '13px',
              color: 'var(--error)',
              fontWeight: 700,
              zIndex: 10,
              width: '212px',
            }}
          >
            <LogOut size={16} />
            로그아웃
          </button>
        )}
        <div 
          onClick={() => setShowLogout(!showLogout)}
          style={{
            padding: '14px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
        >
          <span style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            flex: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '14px',
            background: colors.bg,
            color: colors.fg,
          }}>{initial}</span>
          
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--fg-1)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>{user.name}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '.04em',
                padding: '1px 5px',
                borderRadius: '4px',
                background: colors.roleBg,
                color: colors.fg,
              }}>{role}</span>
            </div>
          </div>
          <ChevronDown size={16} style={{ color: 'var(--fg-4)', transform: showLogout ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
