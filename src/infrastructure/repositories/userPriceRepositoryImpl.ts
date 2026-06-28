import type { UserPriceRepository } from '@/domain/repositories/userPrice.repository';
import type {
  PricesListParams,
  PricesListResult,
  UserPrice,
} from '@/domain/entities/userPrice';
import { httpClient } from '../http/httpClient';

function buildPricesQuery(params: PricesListParams): string {
  const search = new URLSearchParams();

  if (params.city) search.set('city', params.city);
  if (params.source) search.set('source', params.source);
  if (params.q && params.q.trim().length >= 2) {
    search.set('q', params.q.trim());
  }
  if (params.min_price != null && params.min_price >= 0) {
    search.set('min_price', String(params.min_price));
  }
  if (params.max_price != null && params.max_price >= 0) {
    search.set('max_price', String(params.max_price));
  }

  const limit = Math.min(200, Math.max(1, params.limit ?? 50));
  const offset = Math.max(0, params.offset ?? 0);
  search.set('limit', String(limit));
  search.set('offset', String(offset));

  return search.toString();
}

interface RawUserPrice {
  id?: number;
  source?: string;
  city?: string;
  clinic_name?: string;
  service_name_raw?: string;
  price_kzt?: number;
  currency?: string;
  source_url?: string | null;
}

interface RawPricesResponse {
  summary?: {
    total_prices?: number;
    cities?: string[];
    sources?: string[];
  };
  items?: RawUserPrice[];
  results?: RawUserPrice[];
  data?: RawUserPrice[];
  prices?: RawUserPrice[];
  limit?: number;
  offset?: number;
  total?: number;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function mapRawPrice(raw: RawUserPrice, index: number): UserPrice {
  return {
    id: raw.id ?? index,
    source: asString(raw.source, 'unknown'),
    city: asString(raw.city, 'unknown'),
    clinic_name: asString(raw.clinic_name, '—'),
    service_name_raw: asString(raw.service_name_raw, 'Без названия'),
    price_kzt: asNumber(raw.price_kzt),
    currency: asString(raw.currency, 'KZT'),
    source_url: raw.source_url ?? null,
  };
}

function extractItems(raw: RawPricesResponse | RawUserPrice[]): RawUserPrice[] {
  if (Array.isArray(raw)) return raw;
  return raw.items ?? raw.results ?? raw.data ?? raw.prices ?? [];
}

function extractSummary(raw: RawPricesResponse | RawUserPrice[]) {
  if (Array.isArray(raw)) {
    return { total_prices: raw.length, cities: [], sources: [] };
  }

  return {
    total_prices: raw.summary?.total_prices ?? 0,
    cities: (raw.summary?.cities ?? []).filter(
      (item): item is string => typeof item === 'string' && item.length > 0,
    ),
    sources: (raw.summary?.sources ?? []).filter(
      (item): item is string => typeof item === 'string' && item.length > 0,
    ),
  };
}

export class UserPriceRepositoryImpl implements UserPriceRepository {
  async list(params: PricesListParams): Promise<PricesListResult> {
    const query = buildPricesQuery(params);
    const raw = await httpClient<RawPricesResponse | RawUserPrice[]>(
      `/prices?${query}`,
    );

    const items = extractItems(raw).map(mapRawPrice);

    if (Array.isArray(raw)) {
      return {
        summary: extractSummary(raw),
        items,
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
        total: items.length,
      };
    }

    return {
      summary: extractSummary(raw),
      items,
      limit: raw.limit ?? params.limit ?? 50,
      offset: raw.offset ?? params.offset ?? 0,
      total: raw.total ?? items.length,
    };
  }
}

export const userPriceRepository = new UserPriceRepositoryImpl();
