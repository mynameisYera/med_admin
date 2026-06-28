import { userPriceRepository } from '@/infrastructure/repositories/userPriceRepositoryImpl';
import type { PricesListParams } from '@/domain/entities/userPrice';

export const userPriceService = {
  list(params: PricesListParams) {
    return userPriceRepository.list(params);
  },
};
