import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/application/hooks/useAuthContext';

function IconParse() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6h16M4 12h10M4 18h7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M20 14v-2a2 2 0 0 0-2-2h-2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M20 20l-3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconData() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 7v10M8 11h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AdminLayout() {
  const { user, logout } = useAuth();

  const initials = user?.phone
    ? user.phone.replace(/\D/g, '').slice(-2)
    : 'MA';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">
            <IconLogo />
          </span>
          <div>
            <strong>Med Admin</strong>
            <span className="sidebar-tagline">Парсинг цен</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-nav-label">Разделы</span>
          <NavLink
            to="/admin/parse"
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
          >
            <IconParse />
            Парсинг
          </NavLink>
          <NavLink
            to="/admin/prices"
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
          >
            <IconSearch />
            Поиск цен
          </NavLink>
          <NavLink
            to="/admin/data"
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
          >
            <IconData />
            Данные
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <span className="user-avatar">{initials}</span>
            <div className="user-info">
              <strong>{user?.phone ?? 'Администратор'}</strong>
              <span>{user?.role ?? 'admin'}</span>
            </div>
          </div>
          <button type="button" className="btn btn-sidebar-logout" onClick={logout}>
            <IconLogout />
            Выйти
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="page-header">
          <div>
            <p className="page-header-eyebrow">Панель управления</p>
            <h1 className="page-header-title">Med Admin</h1>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
