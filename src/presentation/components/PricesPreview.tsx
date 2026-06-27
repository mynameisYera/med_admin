import type { ParserSource, PriceRecord } from '@/domain/entities/parser';

interface PricesPreviewProps {
  prices: PriceRecord[];
  source: ParserSource;
  city: string;
  loading: boolean;
  onLoad: () => void;
}

export function PricesPreview({
  prices,
  source,
  city,
  loading,
  onLoad,
}: PricesPreviewProps) {
  return (
    <div>
      <div className="section-header">
        <h2>Превью цен</h2>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onLoad}
          disabled={loading || !city}
        >
          {loading ? 'Загрузка…' : 'Загрузить превью'}
        </button>
      </div>

      <p className="muted">
        {source}/{city || '—'} · до 10 записей · запрос только по кнопке
      </p>

      {loading ? (
        <div className="loading-panel">
          <div className="spinner" aria-label="Загрузка" />
          <span>Загрузка цен…</span>
        </div>
      ) : prices.length === 0 ? (
        <p className="muted">Нажмите «Загрузить превью», чтобы получить цены</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Услуга</th>
                <th>Цена (KZT)</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((row, index) => (
                <tr key={`${row.service_name_raw ?? index}-${index}`}>
                  <td>{row.service_name_raw ?? '—'}</td>
                  <td>
                    {row.price_kzt != null
                      ? row.price_kzt.toLocaleString('ru-RU')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
