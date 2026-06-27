import type { PriceDataRepository } from '@/domain/repositories/priceData.repository';
import type {
  AdminPrice,
  CreatePriceData,
  PriceListParams,
  PriceListResult,
  UpdatePriceData,
} from '@/domain/entities/priceData';
import { ApiError } from '../http/apiError';
import { httpClient } from '../http/httpClient';

interface RawAdminPrice {
  id: number;
  source: string;
  city: string;
  clinic_name: string;
  service_name_raw: string;
  price_kzt: number;
  currency: string;
  parsed_at?: string | null;
  source_url?: string | null;
  is_active: boolean;
}

interface RawListResponse {
  items?: RawAdminPrice[];
  results?: RawAdminPrice[];
  data?: RawAdminPrice[];
  prices?: RawAdminPrice[];
  total?: number;
  count?: number;
  total_count?: number;
}

function mapPrice(raw: RawAdminPrice): AdminPrice {
  return {
    id: raw.id,
    source: raw.source,
    city: raw.city,
    clinic_name: raw.clinic_name,
    service_name_raw: raw.service_name_raw,
    price_kzt: raw.price_kzt,
    currency: raw.currency,
    parsed_at: raw.parsed_at ?? null,
    source_url: raw.source_url ?? null,
    is_active: raw.is_active,
  };
}

function buildQuery(params: PriceListParams): string {
  const search = new URLSearchParams();

  if (params.source) search.set('source', params.source);
  if (params.city) search.set('city', params.city);
  if (params.q) search.set('q', params.q);
  if (params.includeInactive) search.set('include_inactive', 'true');
  search.set('limit', String(params.limit ?? 50));
  search.set('offset', String(params.offset ?? 0));

  return search.toString();
}

function normalizeList(data: unknown): PriceListResult {
  if (Array.isArray(data)) {
    return {
      items: data.map((item) => mapPrice(item as RawAdminPrice)),
      total: data.length,
    };
  }

  if (data && typeof data === 'object') {
    const payload = data as RawListResponse;
    const rawItems =
      payload.items ??
      payload.results ??
      payload.data ??
      payload.prices ??
      [];

    const items = rawItems.map(mapPrice);
    const total =
      payload.total ??
      payload.count ??
      payload.total_count ??
      items.length;

    return { items, total };
  }

  return { items: [], total: 0 };
}

function handleAdminError(status: number, detail: string): never {
  if (status === 403) {
    throw new ApiError('Нет прав администратора', 403, detail);
  }
  if (status === 401) {
    throw new ApiError('Сессия истекла. Войдите снова.', 401, detail);
  }
  if (status === 409) {
    throw new ApiError('Дубликат записи (source + city + clinic + услуга)', 409, detail);
  }
  if (status === 0) {
    throw new ApiError(detail, 0, detail);
  }
  throw new ApiError(detail, status, detail);
}

export class PriceDataRepositoryImpl implements PriceDataRepository {
  async list(params: PriceListParams): Promise<PriceListResult> {
    try {
      const data = await httpClient<unknown>(
        `/parser/data/prices?${buildQuery(params)}`,
      );
      return normalizeList(data);
    } catch (err) {
      if (err instanceof ApiError) handleAdminError(err.status, err.message);
      throw err;
    }
  }

  async getById(id: number): Promise<AdminPrice> {
    try {
      const data = await httpClient<RawAdminPrice>(`/parser/data/prices/${id}`);
      return mapPrice(data);
    } catch (err) {
      if (err instanceof ApiError) handleAdminError(err.status, err.message);
      throw err;
    }
  }

  async create(data: CreatePriceData): Promise<AdminPrice> {
    try {
      const result = await httpClient<RawAdminPrice>('/parser/data/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return mapPrice(result);
    } catch (err) {
      if (err instanceof ApiError) handleAdminError(err.status, err.message);
      throw err;
    }
  }

  async update(id: number, data: UpdatePriceData): Promise<AdminPrice> {
    try {
      const result = await httpClient<RawAdminPrice>(`/parser/data/prices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return mapPrice(result);
    } catch (err) {
      if (err instanceof ApiError) handleAdminError(err.status, err.message);
      throw err;
    }
  }

  async delete(id: number, hard = false): Promise<void> {
    try {
      await httpClient<void>(
        `/parser/data/prices/${id}?hard=${hard ? 'true' : 'false'}`,
        { method: 'DELETE' },
      );
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          throw new ApiError('Запись не найдена', 404, err.detail);
        }
        handleAdminError(err.status, err.message);
      }
      throw err;
    }
  }
}

export const priceDataRepository = new PriceDataRepositoryImpl();
