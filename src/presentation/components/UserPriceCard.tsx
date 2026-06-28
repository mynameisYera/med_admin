import { SOURCE_LABELS, type ParserSource } from '@/domain/entities/parser';
import type { UserPrice } from '@/domain/entities/userPrice';
import { formatCityLabel, formatPriceKzt } from '@/shared/utils/format';

interface UserPriceCardProps {
  item: UserPrice;
}

function sourceLabel(source: string): string {
  if (source in SOURCE_LABELS) {
    return SOURCE_LABELS[source as ParserSource];
  }
  return source.toUpperCase();
}

export function UserPriceCard({ item }: UserPriceCardProps) {
  return (
    <article className="price-card">
      <div className="price-card-badges">
        <span className="badge badge-lab">{sourceLabel(item.source)}</span>
        <span className="badge badge-city">{formatCityLabel(item.city)}</span>
      </div>

      <h3 className="price-card-title">{item.service_name_raw}</h3>
      <p className="price-card-clinic muted">{item.clinic_name}</p>

      <div className="price-card-footer">
        <span className="price-card-price">
          {formatPriceKzt(item.price_kzt, item.currency || 'KZT')}
        </span>
        {item.source_url ? (
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="price-card-link"
          >
            Подробнее →
          </a>
        ) : null}
      </div>
    </article>
  );
}
