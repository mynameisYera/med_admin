import { useParserDashboard } from '@/application/hooks/useParserDashboard';
import { useAuth } from '@/application/hooks/useAuthContext';
import { ParserForm } from '../components/ParserForm';
import { ParserStatusPanel } from '../components/ParserStatusPanel';
import { ParsedCitiesTable } from '../components/ParsedCitiesTable';
import { PricesPreview } from '../components/PricesPreview';
import type { ParserSource } from '@/domain/entities/parser';

export function ParserDashboardPage() {
  const { user, logout } = useAuth();
  const dashboard = useParserDashboard('kdl');

  return (
    <div className="layout">
      <header className="topbar">
        <div>
          <h1>Парсинг цен</h1>
          <p className="muted">
            {user?.phone ? `Аккаунт: ${user.phone}` : 'Админ-панель'}
            {user?.role ? ` · ${user.role}` : ''}
          </p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={logout}>
          Выйти
        </button>
      </header>

      <main className="content">
        {dashboard.error && (
          <div className="alert alert-error">{dashboard.error}</div>
        )}

        {dashboard.loading ? (
          <div className="panel loading-panel">
            <div className="spinner" aria-label="Загрузка" />
            <span>Загрузка данных…</span>
          </div>
        ) : (
          <>
            <section className="panel">
              <ParserForm
                sources={dashboard.sources}
                sourceLabels={dashboard.sourceLabels}
                source={dashboard.source}
                onSourceChange={(value) =>
                  void dashboard.changeSource(value as ParserSource)
                }
                cities={dashboard.cities}
                city={dashboard.city}
                onCityChange={dashboard.setCity}
                limit={dashboard.limit}
                onLimitChange={dashboard.setLimit}
                isRunning={dashboard.isRunning}
                actionLoading={dashboard.actionLoading}
                onStart={() => void dashboard.startParse()}
                onRefreshStatus={() => void dashboard.refreshStatus()}
              />
            </section>

            <section className="panel">
              <ParserStatusPanel
                status={dashboard.status}
                startInfo={dashboard.startInfo}
                onCopyError={dashboard.setError}
              />
            </section>

            <section className="panel">
              <ParsedCitiesTable entries={dashboard.parsedCities} />
            </section>

            <section className="panel">
              <PricesPreview
                prices={dashboard.prices}
                source={dashboard.source}
                city={dashboard.city}
                onRefresh={() => void dashboard.refreshPrices()}
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
