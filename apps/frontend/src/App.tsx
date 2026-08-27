import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UiProvider } from './context/UiContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppSidebar, { MOBILE_BAR_HEIGHT } from './components/AppSidebar';
import { useIsMobile } from './hooks/useMediaQuery';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CourseList from './pages/CourseList';
import CourseWizard from './pages/CourseWizard';
import MyTasks from './pages/MyTasks';
import CourseDetail from './pages/CourseDetail';
import ScriptManage from './pages/ScriptManage';
import Members from './pages/Members';
import GuideCenter from './pages/GuideCenter';
import ReviewQueue from './pages/ReviewQueue';
import Inbox from './pages/Inbox';
import Notifications from './pages/Notifications';
import Calendar from './pages/Calendar';
import SmeDetail from './pages/SmeDetail';
import MyCourses from './pages/MyCourses';
import Settings from './pages/Settings';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {user && <AppSidebar />}
      <main style={{
        flex: 1,
        // flex 자식은 기본값이 min-width:auto라 내용이 넓으면 화면 밖으로 밀린다.
        minWidth: 0,
        backgroundColor: 'var(--bg-page)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        // 휴대폰에서는 사이드바가 상단 고정 바로 바뀌므로 그만큼 비워 준다.
        paddingTop: user && isMobile ? MOBILE_BAR_HEIGHT + 'px' : 0,
      }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/home" element={
            <ProtectedRoute allowedRoles={['PLANNER', 'ADMIN']}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/courses" element={
            <ProtectedRoute>
              <CourseList />
            </ProtectedRoute>
          } />

          <Route path="/courses/new" element={
            <ProtectedRoute allowedRoles={['PLANNER', 'ADMIN']}>
              <CourseWizard />
            </ProtectedRoute>
          } />

          <Route path="/courses/:id" element={
            <ProtectedRoute>
              <CourseDetail />
            </ProtectedRoute>
          } />

          <Route path="/courses/:id/lessons/:lessonId/script" element={
            <ProtectedRoute>
              <ScriptManage />
            </ProtectedRoute>
          } />

          <Route path="/courses/:id/members" element={
            <ProtectedRoute allowedRoles={['PLANNER', 'ADMIN']}>
              <Members />
            </ProtectedRoute>
          } />

          <Route path="/my-tasks" element={
            <ProtectedRoute allowedRoles={['PM', 'SME', 'ADMIN']}>
              <MyTasks />
            </ProtectedRoute>
          } />

          <Route path="/guide" element={
            <ProtectedRoute>
              <GuideCenter />
            </ProtectedRoute>
          } />

          <Route path="/review" element={
            <ProtectedRoute allowedRoles={['PLANNER', 'ADMIN']}>
              <ReviewQueue />
            </ProtectedRoute>
          } />

          <Route path="/inbox" element={
            <ProtectedRoute>
              <Inbox />
            </ProtectedRoute>
          } />

          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />

          <Route path="/calendar" element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          } />

          <Route path="/sme-detail" element={
            <ProtectedRoute allowedRoles={['PLANNER', 'ADMIN']}>
              <SmeDetail />
            </ProtectedRoute>
          } />

          <Route path="/my-courses" element={
            <ProtectedRoute allowedRoles={['PM', 'SME', 'ADMIN']}>
              <MyCourses />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

          <Route path="*" element={
            user ? (
              user.global_role === 'PLANNER' || user.global_role === 'ADMIN' ? (
                <Navigate to="/home" replace />
              ) : (
                <Navigate to="/my-tasks" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <UiProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </UiProvider>
    </BrowserRouter>
  );
};

export default App;
