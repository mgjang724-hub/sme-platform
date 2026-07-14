import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('PLANNER' | 'PM' | 'SME' | 'ADMIN' | 'MANAGER')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.global_role)) {
    // Redirect unauthorized users to their respective home pages
    if (user.global_role === 'PLANNER') {
      return <Navigate to="/home" replace />;
    } else if (user.global_role === 'PM' || user.global_role === 'SME') {
      return <Navigate to="/my-tasks" replace />;
    } else {
      return <Navigate to="/courses" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
