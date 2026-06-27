import {
  PARSER_SOURCES,
  SOURCE_LABELS,
  type ParserSource,
} from '@/domain/entities/parser';

interface PriceDataFiltersProps {
  source: string;
  onSourceChange: (value: string) => void;
  city: string;
  onCityChange: (value: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
  includeInactive: boolean;
  onIncludeInactiveChange: (value: boolean) => void;
  cities: string[];
  onApply: () => void;
  onReset: () => void;
  disabled?: boolean;
}

export function PriceDataFilters({
  source,
  onSourceChange,
  city,
  onCityChange,
  query,
  onQueryChange,
  includeInactive,
  onIncludeInactiveChange,
  cities,
  onApply,
  onReset,
  disabled,
}: PriceDataFiltersProps) {
  return (
    <div className="filters">
      <div className="form-grid">
        <label className="field">
          <span>Лаборатория</span>
          <select
            value={source}
            onChange={(e) => onSourceChange(e.target.value)}
            disabled={disabled}
          >
            <option value="">Все</option>
            {PARSER_SOURCES.map((item) => (
              <option key={item} value={item}>
                {SOURCE_LABELS[item]} ({item})
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Город</span>
          <select
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            disabled={disabled || (!city && cities.length === 0 && !source)}
          >
            <option value="">Все</option>
            {cities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Поиск по названию</span>
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="ОАК, кровь…"
            disabled={disabled}
          />
        </label>

        <label className="field checkbox-field">
          <span>Показать скрытые</span>
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => onIncludeInactiveChange(e.target.checked)}
            disabled={disabled}
          />
        </label>
      </div>

      <div className="actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onApply}
          disabled={disabled}
        >
          Применить фильтры
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onReset}
          disabled={disabled}
        >
          Сбросить
        </button>
      </div>
    </div>
  );
}

export function isParserSource(value: string): value is ParserSource {
  return (PARSER_SOURCES as readonly string[]).includes(value);
}
