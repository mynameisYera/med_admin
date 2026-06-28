import type { ParserSource } from './parser';

export interface AdminPrice {
  id: number;
  source: string;
  city: string;
  clinic_name: string;
  service_name_raw: string;
  price_kzt: number;
  currency: string;
  parsed_at: string | null;
  source_url: string | null;
  is_active: boolean;
}

export interface CreatePriceData {
  source: ParserSource | string;
  city: string;
  clinic_name: string;
  service_name_raw: string;
  price_kzt: number;
  currency?: string;
  source_url?: string;
  is_active?: boolean;
}

export type UpdatePriceData = Partial<CreatePriceData>;

export interface PriceListParams {
  source?: string;
  city?: string;
  q?: string;
  includeInactive?: boolean;
  limit?: number;
  offset?: number;
}

export interface PriceListResult {
  items: AdminPrice[];
  total: number;
}

export type PriceExportFormat = 'xlsx' | 'json';

export interface PriceExportParams {
  format?: PriceExportFormat;
  source?: string;
  city?: string;
  q?: string;
  includeInactive?: boolean;
}

export interface PriceExportResult {
  blob: Blob;
  filename: string;
}
