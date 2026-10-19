import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store';

interface Props {
  roles?: Array<'learner' | 'mentor' | 'tvet_admin' | 'super_admin'>;
}

export default function ProtectedRoute({ roles }: Props) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Not authenticated → send to login, preserving the intended destination
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but wrong role → back to dashboard
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
