import { priceDataRepository } from '@/infrastructure/repositories/priceDataRepositoryImpl';
import type {
  CreatePriceData,
  PriceExportParams,
  PriceListParams,
  UpdatePriceData,
} from '@/domain/entities/priceData';

export const priceDataService = {
  list(params: PriceListParams) {
    return priceDataRepository.list(params);
  },

  getById(id: number) {
    return priceDataRepository.getById(id);
  },

  create(data: CreatePriceData) {
    return priceDataRepository.create(data);
  },

  update(id: number, data: UpdatePriceData) {
    return priceDataRepository.update(id, data);
  },

  hide(id: number) {
    return priceDataRepository.delete(id, false);
  },

  deleteHard(id: number) {
    return priceDataRepository.delete(id, true);
  },

  export(params: PriceExportParams) {
    return priceDataRepository.export(params);
  },
};
