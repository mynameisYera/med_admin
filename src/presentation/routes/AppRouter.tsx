import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/application/hooks/useAuthContext';
import { GuestRoute, ProtectedRoute } from './ProtectedRoute';
import { AdminLayout } from '../layouts/AdminLayout';
import { LoginPage } from '../pages/LoginPage';
import { ParsePage } from '../pages/ParsePage';
import { PriceDataPage } from '../pages/PriceDataPage';
import { PricesSearchPage } from '../pages/PricesSearchPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/parse" replace />} />

          <Route element={<GuestRoute />}>
            <Route path="/admin/login" element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="parse" replace />} />
              <Route path="parse" element={<ParsePage />} />
              <Route path="prices" element={<PricesSearchPage />} />
              <Route path="data" element={<PriceDataPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/admin/parse" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
