import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/application/hooks/useAuthContext';

export function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="layout">
      <header className="topbar">
        <div>
          <h1>Med Admin</h1>
          <p className="muted">
            {user?.phone ? `Аккаунт: ${user.phone}` : 'Админ-панель'}
            {user?.role ? ` · ${user.role}` : ''}
          </p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={logout}>
          Выйти
        </button>
      </header>

      <nav className="admin-nav">
        <NavLink
          to="/admin/parse"
          className={({ isActive }) =>
            `admin-nav-link${isActive ? ' active' : ''}`
          }
        >
          Парсинг
        </NavLink>
        <NavLink
          to="/admin/data"
          className={({ isActive }) =>
            `admin-nav-link${isActive ? ' active' : ''}`
          }
        >
          Данные (CRUD)
        </NavLink>
      </nav>

      <Outlet />
    </div>
  );
}
