import type { ParserStatus, StartParseResponse } from '@/domain/entities/parser';
import { copyToClipboard, formatDateTime, formatElapsed } from '@/shared/utils/format';

interface ParserStatusPanelProps {
  status: ParserStatus | null;
  startInfo: StartParseResponse | null;
  onCopyError: (message: string | null) => void;
}

export function ParserStatusPanel({
  status,
  startInfo,
  onCopyError,
}: ParserStatusPanelProps) {
  const handleCopyError = async () => {
    if (!status?.lastError) return;
    try {
      await copyToClipboard(status.lastError);
      onCopyError(null);
    } catch {
      onCopyError('Не удалось скопировать ошибку');
    }
  };

  return (
    <div className="status-panel">
      <h2>Статус</h2>

      {startInfo?.estimated_minutes != null && status?.running && (
        <p className="hint">
          Ориентировочное время: ~{startInfo.estimated_minutes} мин
        </p>
      )}

      {!status ? (
        <p className="muted">Статус не загружен</p>
      ) : status.running ? (
        <div className="status status-running">
          <span className="status-dot running" />
          <div>
            <strong>Выполняется…</strong>
            <p className="muted">
              {formatElapsed(status.elapsedSeconds)}
              {status.startedAt
                ? ` · старт ${formatDateTime(status.startedAt)}`
                : ''}
            </p>
          </div>
        </div>
      ) : status.lastError ? (
        <div className="status status-error">
          <span className="status-dot error" />
          <div className="status-body">
            <strong>Ошибка</strong>
            <pre className="error-text">{status.lastError}</pre>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => void handleCopyError()}
            >
              Копировать ошибку
            </button>
          </div>
        </div>
      ) : status.lastStats ? (
        <div className="status status-success">
          <span className="status-dot success" />
          <div>
            <strong>
              Завершено
              {status.lastStats.finished_at
                ? ` · ${formatDateTime(status.lastStats.finished_at)}`
                : ''}
            </strong>
            <p>
              Источник: {status.lastStats.source ?? '—'} · Записей:{' '}
              {status.lastStats.total_records ?? 0} · Ошибок:{' '}
              {status.lastStats.errors ?? 0}
            </p>
            {status.lastStats.cities_ok?.length ? (
              <p className="muted">
                Города: {status.lastStats.cities_ok.join(', ')}
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="status status-idle">
          <span className="status-dot idle" />
          <div>
            <strong>Ожидание</strong>
            <p className="muted">Парсинг не запущен</p>
          </div>
        </div>
      )}
    </div>
  );
}
