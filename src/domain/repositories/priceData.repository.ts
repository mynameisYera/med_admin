import type {
  AdminPrice,
  CreatePriceData,
  PriceExportParams,
  PriceExportResult,
  PriceListParams,
  PriceListResult,
  UpdatePriceData,
} from '../entities/priceData';

export interface PriceDataRepository {
  list(params: PriceListParams): Promise<PriceListResult>;
  getById(id: number): Promise<AdminPrice>;
  create(data: CreatePriceData): Promise<AdminPrice>;
  update(id: number, data: UpdatePriceData): Promise<AdminPrice>;
  delete(id: number, hard?: boolean): Promise<void>;
  export(params: PriceExportParams): Promise<PriceExportResult>;
}
