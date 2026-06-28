import type { PricesListParams, PricesListResult } from '../entities/userPrice';

export interface UserPriceRepository {
  list(params: PricesListParams): Promise<PricesListResult>;
}
