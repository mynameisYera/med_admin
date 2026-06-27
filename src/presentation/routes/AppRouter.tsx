import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/application/hooks/useAuthContext';
import { GuestRoute, ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { ParserDashboardPage } from '../pages/ParserDashboardPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />

          <Route element={<GuestRoute />}>
            <Route path="/admin/login" element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<ParserDashboardPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
