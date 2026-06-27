import type { AdminPrice } from '@/domain/entities/priceData';
import { formatDateTime } from '@/shared/utils/format';

interface PriceDataTableProps {
  items: AdminPrice[];
  loading: boolean;
  listRequested: boolean;
  actionLoading: boolean;
  onEdit: (id: number) => void;
  onHide: (id: number) => void;
  onDeleteHard: (id: number) => void;
}

export function PriceDataTable({
  items,
  loading,
  listRequested,
  actionLoading,
  onEdit,
  onHide,
  onDeleteHard,
}: PriceDataTableProps) {
  if (!listRequested) {
    return (
      <p className="muted">Нажмите «Применить фильтры», чтобы загрузить таблицу</p>
    );
  }

  if (loading) {
    return (
      <div className="loading-panel">
        <div className="spinner" aria-label="Загрузка" />
        <span>Загрузка таблицы…</span>
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="muted">Записей не найдено</p>;
  }

  return (
    <div className="table-wrap">
      <table className="table table-crud">
        <thead>
          <tr>
            <th>ID</th>
            <th>Source</th>
            <th>Город</th>
            <th>Клиника</th>
            <th>Услуга</th>
            <th>Цена</th>
            <th>Активна</th>
            <th>Спарсено</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr
              key={row.id}
              className={row.is_active ? undefined : 'row-inactive'}
            >
              <td>{row.id}</td>
              <td>{row.source}</td>
              <td>{row.city}</td>
              <td>{row.clinic_name}</td>
              <td className="cell-service">{row.service_name_raw}</td>
              <td>
                {row.price_kzt.toLocaleString('ru-RU')} {row.currency}
              </td>
              <td>
                <span
                  className={`badge ${row.is_active ? 'badge-active' : 'badge-inactive'}`}
                >
                  {row.is_active ? 'да' : 'нет'}
                </span>
              </td>
              <td className="cell-date">{formatDateTime(row.parsed_at)}</td>
              <td>
                <div className="row-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => onEdit(row.id)}
                    disabled={actionLoading}
                  >
                    Редакт.
                  </button>
                  {row.is_active && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => onHide(row.id)}
                      disabled={actionLoading}
                    >
                      Скрыть
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => onDeleteHard(row.id)}
                    disabled={actionLoading}
                  >
                    Удалить
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
