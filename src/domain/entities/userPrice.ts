import type { ParserSource } from './parser';

export interface UserPrice {
  id: number;
  source: string;
  city: string;
  clinic_name: string;
  service_name_raw: string;
  price_kzt: number;
  currency: string;
  source_url?: string | null;
}

export interface PricesSummary {
  total_prices: number;
  cities: string[];
  sources: string[];
}

export interface PricesListParams {
  city?: string;
  source?: string;
  q?: string;
  min_price?: number;
  max_price?: number;
  limit?: number;
  offset?: number;
}

export interface PricesListResult {
  summary: PricesSummary;
  items: UserPrice[];
  limit: number;
  offset: number;
  total: number;
}

export function isParserSourceValue(
  value: string,
): value is ParserSource {
  return ['kdl', 'helix', 'invitro', 'olymp'].includes(value);
}
