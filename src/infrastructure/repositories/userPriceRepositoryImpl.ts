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

interface RawPricesResponse {
  summary?: {
    total_prices?: number;
    cities?: string[];
    sources?: string[];
  };
  items?: UserPrice[];
  limit?: number;
  offset?: number;
  total?: number;
}

export class UserPriceRepositoryImpl implements UserPriceRepository {
  async list(params: PricesListParams): Promise<PricesListResult> {
    const query = buildPricesQuery(params);
    const raw = await httpClient<RawPricesResponse>(`/prices?${query}`, {
      skipRefresh: true,
    });

    return {
      summary: {
        total_prices: raw.summary?.total_prices ?? 0,
        cities: raw.summary?.cities ?? [],
        sources: raw.summary?.sources ?? [],
      },
      items: raw.items ?? [],
      limit: raw.limit ?? params.limit ?? 50,
      offset: raw.offset ?? params.offset ?? 0,
      total: raw.total ?? 0,
    };
  }
}

export const userPriceRepository = new UserPriceRepositoryImpl();
