import { useState, type FormEvent } from 'react';
import { useAuth } from '@/application/hooks/useAuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login({ phone, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" aria-hidden="true">
        <div className="login-bg-orb login-bg-orb-1" />
        <div className="login-bg-orb login-bg-orb-2" />
        <div className="login-bg-grid" />
      </div>

      <div className="login-layout">
        <section className="login-hero">
          <div className="login-hero-badge">Med Admin</div>
          <h1>Управление ценами лабораторий</h1>
          <p>
            Парсинг, мониторинг и редактирование данных о стоимости медицинских
            услуг в одном месте.
          </p>
          <ul className="login-features">
            <li>Запуск парсеров KDL и других источников</li>
            <li>Фильтрация и ручное редактирование записей</li>
            <li>Контроль статуса и ошибок в реальном времени</li>
          </ul>
        </section>

        <div className="card login-card">
          <div className="card-header">
            <h2>Вход в систему</h2>
            <p className="muted">Введите данные аккаунта администратора</p>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Телефон</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+77001234567"
                autoComplete="username"
                required
              />
            </label>

            <label className="field">
              <span>Пароль</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            {error && <div className="alert alert-error">{error}</div>}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Вход…' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
