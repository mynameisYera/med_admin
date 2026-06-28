import {
  PARSER_SOURCES,
  SOURCE_LABELS,
} from '@/domain/entities/parser';
import { formatCityLabel } from '@/shared/utils/format';

interface PricesSearchFiltersProps {
  city: string;
  onCityChange: (value: string) => void;
  source: string;
  onSourceChange: (value: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
  minPrice: string;
  onMinPriceChange: (value: string) => void;
  maxPrice: string;
  onMaxPriceChange: (value: string) => void;
  limit: number;
  onLimitChange: (value: number) => void;
  cities: string[];
  sources: string[];
  queryTooShort: boolean;
  onApply: () => void;
  onReset: () => void;
  disabled?: boolean;
}

export function PricesSearchFilters({
  city,
  onCityChange,
  source,
  onSourceChange,
  query,
  onQueryChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  limit,
  onLimitChange,
  cities,
  sources,
  queryTooShort,
  onApply,
  onReset,
  disabled,
}: PricesSearchFiltersProps) {
  const cityOptions = cities.length > 0 ? cities : [];
  const sourceOptions =
    sources.length > 0 ? sources : [...PARSER_SOURCES];

  return (
    <div className="filters">
      <div className="form-grid">
        <label className="field">
          <span>Город</span>
          <select
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            disabled={disabled}
          >
            <option value="">Все</option>
            {cityOptions.map((item) => (
              <option key={item} value={item}>
                {formatCityLabel(item)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Лаборатория</span>
          <select
            value={source}
            onChange={(e) => onSourceChange(e.target.value)}
            disabled={disabled}
          >
            <option value="">Все</option>
            {sourceOptions.map((item) => (
              <option key={item} value={item}>
                {item in SOURCE_LABELS
                  ? `${SOURCE_LABELS[item as keyof typeof SOURCE_LABELS]} (${item})`
                  : item}
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
            placeholder="анализ крови…"
            disabled={disabled}
            aria-invalid={queryTooShort}
          />
          {queryTooShort ? (
            <span className="field-hint field-hint-error">
              Минимум 2 символа для поиска
            </span>
          ) : null}
        </label>

        <label className="field">
          <span>Цена от (₸)</span>
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            placeholder="500"
            disabled={disabled}
          />
        </label>

        <label className="field">
          <span>Цена до (₸)</span>
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            placeholder="5000"
            disabled={disabled}
          />
        </label>

        <label className="field">
          <span>На странице</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            disabled={disabled}
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </label>
      </div>

      <div className="actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onApply}
          disabled={disabled || queryTooShort}
        >
          Найти
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
