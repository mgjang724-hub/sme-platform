import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useEscapeKey } from '../hooks/useEscapeKey';
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
  Settings as SettingsIcon,
  Menu,
  X
} from 'lucide-react';

/** 휴대폰에서 상단에 고정되는 앱 바의 높이. 본문 위쪽 여백과 맞춰야 한다. */
export const MOBILE_BAR_HEIGHT = 56;

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  href: string;
}

const PLANNER_MENU: SidebarItem[] = [
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard, href: '/home' },
  { id: 'courses', label: '과정 관리', icon: BookOpen, href: '/courses' },
  { id: 'review', label: '검수 목록', icon: ClipboardCheck, href: '/review' },
  { id: 'guide', label: '안내센터', icon: BookMarked, href: '/guide' },
  { id: 'inbox', label: '문의함', icon: MessageSquare, href: '/inbox' },
  { id: 'notifications', label: '알림', icon: Bell, href: '/notifications' },
  { id: 'calendar', label: '일정 캘린더', icon: CalendarIcon, href: '/calendar' },
  { id: 'settings', label: '설정', icon: SettingsIcon, href: '/settings' },
];

const SME_MENU: SidebarItem[] = [
  { id: 'tasks', label: '내 작업', icon: SquareCheckBig, href: '/my-tasks' },
  { id: 'courses', label: '과정 목록', icon: BookOpen, href: '/courses' },
  { id: 'guide', label: '안내센터', icon: BookMarked, href: '/guide' },
  { id: 'inbox', label: '문의함', icon: MessageSquare, href: '/inbox' },
  { id: 'notifications', label: '알림', icon: Bell, href: '/notifications' },
  { id: 'calendar', label: '일정 캘린더', icon: CalendarIcon, href: '/calendar' },
  { id: 'settings', label: '설정', icon: SettingsIcon, href: '/settings' },
];

const AppSidebar: React.FC = () => {
  const { user, logout, unreadNotiCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [showLogout, setShowLogout] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEscapeKey(drawerOpen, () => setDrawerOpen(false));

  // 화면을 이동하면 서랍을 닫는다.
  useEffect(() => {
    setDrawerOpen(false);
    setShowLogout(false);
  }, [location.pathname]);

  // 서랍이 열려 있는 동안에는 뒤쪽 본문이 스크롤되지 않게 한다.
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [drawerOpen]);

  if (!user) return null;

  const role = user.global_role;
  const items = role === 'PLANNER' || role === 'ADMIN' ? PLANNER_MENU : SME_MENU;
  const isPlanner = role === 'PLANNER' || role === 'ADMIN';
  const colors = {
    bg: isPlanner ? '#FFD8C9' : '#D5E3F2',
    fg: isPlanner ? '#B7521F' : '#245C92',
    roleBg: isPlanner ? '#FFF1EC' : '#E8F1FB',
  };
  const initial = user.name ? user.name.charAt(0) : 'U';

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  const brandBlock = (
    <div style={{ padding: '22px 20px 16px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-orange)', letterSpacing: '-0.5px' }}>i-Scream</span>
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--fg-3)', marginTop: '4px' }}>연수원</span>
      </div>
      <div style={{ marginTop: '10px', fontSize: '12px', fontWeight: 700, letterSpacing: '.02em', color: 'var(--primary)' }}>SME Script Platform</div>
      <div style={{ fontSize: '11px', color: 'var(--fg-4)', marginTop: '2px' }}>강사 원고 소통 플랫폼</div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '10px',
        fontSize: '10px', fontWeight: 800, color: '#D97706', backgroundColor: '#FEF3C7',
        padding: '2px 7px', borderRadius: '4px', border: '1px solid #FDE68A',
      }}>
        시범 데모 버전
      </div>
    </div>
  );

  const navBlock = (
    <nav style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
      {items.map((it) => (
        <NavLink
          key={it.id}
          to={it.href}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '11px',
            padding: isMobile ? '13px 12px' : '10px 12px',
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
                <span style={{ width: '3px', height: '18px', borderRadius: '2px', position: 'absolute', left: 0, background: 'var(--primary)' }}></span>
              )}
              <it.icon size={19} className={isActive ? 'text-primary' : 'text-fg-3'} />
              {it.label}
              {it.id === 'notifications' && unreadNotiCount > 0 && (
                <span style={{
                  marginLeft: 'auto', minWidth: '18px', height: '18px', padding: '0 5px',
                  borderRadius: 'var(--r-pill)', backgroundColor: 'var(--error)', color: '#fff',
                  fontSize: '10px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {unreadNotiCount}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );

  const profileBlock = (
    <div style={{ position: 'relative' }}>
      {showLogout && (
        <button
          onClick={handleLogoutClick}
          style={{
            position: 'absolute', bottom: '60px', left: '14px', right: '14px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '10px 14px', fontSize: '13px', color: 'var(--error)', fontWeight: 700, zIndex: 10,
          }}
        >
          <LogOut size={16} />
          로그아웃
        </button>
      )}
      <div
        onClick={() => setShowLogout(!showLogout)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowLogout(!showLogout); } }}
        aria-expanded={showLogout}
        style={{ padding: '14px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <span style={{
          width: '34px', height: '34px', borderRadius: '50%', flex: 'none',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '14px', background: colors.bg, color: colors.fg,
        }}>{initial}</span>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
            <span style={{
              fontSize: '10px', fontWeight: 800, letterSpacing: '.04em', padding: '1px 5px',
              borderRadius: '4px', background: colors.roleBg, color: colors.fg,
            }}>{role}</span>
          </div>
        </div>
        <ChevronDown size={16} style={{ color: 'var(--fg-4)', transform: showLogout ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </div>
    </div>
  );

  // 휴대폰: 상단 앱 바 + 서랍 메뉴
  if (isMobile) {
    return (
      <>
        <header style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: MOBILE_BAR_HEIGHT + 'px', zIndex: 900,
          display: 'flex', alignItems: 'center', gap: '10px', padding: '0 14px',
          background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
        }}>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="메뉴 열기"
            aria-expanded={drawerOpen}
            style={{ display: 'inline-flex', padding: '8px', margin: '0 -8px', color: 'var(--fg-1)' }}
          >
            <Menu size={22} strokeWidth={2.1} aria-hidden="true" />
          </button>

          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--brand-orange)', letterSpacing: '-0.4px' }}>i-Scream</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>원고 플랫폼</span>

          <NavLink
            to="/notifications"
            aria-label={unreadNotiCount > 0 ? '알림 ' + unreadNotiCount + '건' : '알림'}
            style={{ marginLeft: 'auto', position: 'relative', display: 'inline-flex', padding: '8px', color: 'var(--fg-2)' }}
          >
            <Bell size={20} strokeWidth={2} aria-hidden="true" />
            {unreadNotiCount > 0 && (
              <span style={{
                position: 'absolute', top: '3px', right: '3px', minWidth: '16px', height: '16px', padding: '0 4px',
                borderRadius: 'var(--r-pill)', backgroundColor: 'var(--error)', color: '#fff',
                fontSize: '9.5px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {unreadNotiCount > 99 ? '99+' : unreadNotiCount}
              </span>
            )}
          </NavLink>

          <span style={{
            width: '30px', height: '30px', borderRadius: '50%', flex: 'none',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '13px', background: colors.bg, color: colors.fg,
          }}>{initial}</span>
        </header>

        {drawerOpen && (
          <div
            className="drawer-backdrop"
            onClick={() => setDrawerOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 950, backgroundColor: 'rgba(17, 24, 39, 0.42)' }}
          >
            <aside
              className="drawer-panel"
              onClick={(e) => e.stopPropagation()}
              aria-label="주 메뉴"
              style={{
                width: 'min(280px, 84vw)', height: '100%',
                background: 'var(--bg-card)', display: 'flex', flexDirection: 'column',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div style={{ position: 'relative' }}>
                {brandBlock}
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="메뉴 닫기"
                  style={{ position: 'absolute', top: '16px', right: '12px', padding: '8px', color: 'var(--fg-3)' }}
                >
                  <X size={19} strokeWidth={2.2} aria-hidden="true" />
                </button>
              </div>
              {navBlock}
              {profileBlock}
            </aside>
          </div>
        )}
      </>
    );
  }

  // 데스크톱·태블릿: 왼쪽 고정 사이드바
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
      {brandBlock}
      {navBlock}
      {profileBlock}
    </aside>
  );
};

export default AppSidebar;
