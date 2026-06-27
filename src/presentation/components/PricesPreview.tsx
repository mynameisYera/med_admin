import type { ParserSource, PriceRecord } from '@/domain/entities/parser';

interface PricesPreviewProps {
  prices: PriceRecord[];
  source: ParserSource;
  city: string;
  onRefresh: () => void;
}

export function PricesPreview({
  prices,
  source,
  city,
  onRefresh,
}: PricesPreviewProps) {
  return (
    <div>
      <div className="section-header">
        <h2>Превью цен</h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onRefresh}>
          Обновить
        </button>
      </div>

      <p className="muted">
        {source}/{city || '—'} · до 10 записей
      </p>

      {prices.length === 0 ? (
        <p className="muted">Цены не найдены</p>
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
