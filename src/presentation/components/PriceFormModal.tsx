import {
  PARSER_SOURCES,
  SOURCE_LABELS,
  type ParserSource,
} from '@/domain/entities/parser';
import type { CreatePriceData } from '@/domain/entities/priceData';
import type { PriceFormMode } from '@/application/hooks/usePriceDataCrud';

interface PriceFormModalProps {
  open: boolean;
  mode: PriceFormMode;
  data: CreatePriceData;
  cities: string[];
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChange: <K extends keyof CreatePriceData>(
    key: K,
    value: CreatePriceData[K],
  ) => void;
}

export function PriceFormModal({
  open,
  mode,
  data,
  cities,
  loading,
  onClose,
  onSubmit,
  onChange,
}: PriceFormModalProps) {
  if (!open) return null;

  const handleSourceChange = (value: string) => {
    onChange('source', value);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="price-form-title"
      >
        <div className="section-header">
          <h2 id="price-form-title">
            {mode === 'create' ? 'Добавить цену' : 'Редактировать цену'}
          </h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <div className="form-grid">
            <label className="field">
              <span>Лаборатория</span>
              <select
                value={data.source}
                onChange={(e) => handleSourceChange(e.target.value)}
                required
              >
                {PARSER_SOURCES.map((item) => (
                  <option key={item} value={item}>
                    {SOURCE_LABELS[item as ParserSource]} ({item})
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Город</span>
              {cities.length > 0 ? (
                <select
                  value={data.city}
                  onChange={(e) => onChange('city', e.target.value)}
                  required
                >
                  <option value="">Выберите</option>
                  {cities.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={data.city}
                  onChange={(e) => onChange('city', e.target.value)}
                  placeholder="almaty"
                  required
                />
              )}
            </label>

            <label className="field">
              <span>Клиника</span>
              <input
                type="text"
                value={data.clinic_name}
                onChange={(e) => onChange('clinic_name', e.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Название услуги</span>
              <input
                type="text"
                value={data.service_name_raw}
                onChange={(e) => onChange('service_name_raw', e.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Цена (KZT)</span>
              <input
                type="number"
                min={0}
                value={data.price_kzt || ''}
                onChange={(e) => onChange('price_kzt', Number(e.target.value))}
                required
              />
            </label>

            <label className="field">
              <span>Валюта</span>
              <input
                type="text"
                value={data.currency ?? 'KZT'}
                onChange={(e) => onChange('currency', e.target.value)}
              />
            </label>

            <label className="field field-wide">
              <span>URL источника</span>
              <input
                type="url"
                value={data.source_url ?? ''}
                onChange={(e) => onChange('source_url', e.target.value)}
                placeholder="https://..."
              />
            </label>

            <label className="field checkbox-field">
              <span>Активна (видна на сайте)</span>
              <input
                type="checkbox"
                checked={data.is_active ?? true}
                onChange={(e) => onChange('is_active', e.target.checked)}
              />
            </label>
          </div>

          <div className="actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Сохранение…' : 'Сохранить'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
