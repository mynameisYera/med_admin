import type { ParserSource } from '@/domain/entities/parser';

interface ParserFormProps {
  sources: readonly ParserSource[];
  sourceLabels: Record<ParserSource, string>;
  source: ParserSource;
  onSourceChange: (source: ParserSource) => void;
  cities: string[];
  city: string;
  onCityChange: (city: string) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  isRunning: boolean;
  actionLoading: boolean;
  onStart: () => void;
  onRefreshStatus: () => void;
}

export function ParserForm({
  sources,
  sourceLabels,
  source,
  onSourceChange,
  cities,
  city,
  onCityChange,
  limit,
  onLimitChange,
  isRunning,
  actionLoading,
  onStart,
  onRefreshStatus,
}: ParserFormProps) {
  return (
    <div className="parser-form">
      <h2>Запуск парсинга</h2>

      <div className="form-grid">
        <label className="field">
          <span>Лаборатория</span>
          <select
            value={source}
            onChange={(e) => onSourceChange(e.target.value as ParserSource)}
            disabled={isRunning || actionLoading}
          >
            {sources.map((item) => (
              <option key={item} value={item}>
                {sourceLabels[item]} ({item})
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Город</span>
          <select
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            disabled={!cities.length || isRunning || actionLoading}
          >
            {cities.length === 0 ? (
              <option value="">Нет городов</option>
            ) : (
              cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))
            )}
          </select>
        </label>

        <label className="field">
          <span>Лимит услуг (1–500)</span>
          <input
            type="number"
            min={1}
            max={500}
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            disabled={isRunning || actionLoading}
          />
        </label>
      </div>

      <div className="actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onStart}
          disabled={isRunning || actionLoading || !city}
        >
          {actionLoading && !isRunning ? 'Отправка…' : 'Запустить парсинг'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onRefreshStatus}
          disabled={actionLoading}
        >
          Обновить статус
        </button>
      </div>
    </div>
  );
}
