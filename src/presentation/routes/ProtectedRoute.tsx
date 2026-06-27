import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/application/hooks/useAuthContext';

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" aria-label="Загрузка" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" aria-label="Загрузка" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin/parse" replace />;
  }

  return <Outlet />;
}
