import type { ParsedCityEntry } from '@/domain/entities/parser';

interface ParsedCitiesTableProps {
  entries: ParsedCityEntry[];
}

export function ParsedCitiesTable({ entries }: ParsedCitiesTableProps) {
  return (
    <div>
      <h2>Уже спарсено</h2>

      {entries.length === 0 ? (
        <p className="muted">Данных пока нет</p>
      ) : (
        <div className="chips">
          {entries.map((entry) => (
            <span
              key={`${entry.source}/${entry.city}`}
              className="chip"
            >
              {entry.source}/{entry.city}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
