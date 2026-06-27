import type {
  AdminPrice,
  CreatePriceData,
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
}
