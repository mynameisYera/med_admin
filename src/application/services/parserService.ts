import { parserRepository } from '@/infrastructure/repositories/parserRepositoryImpl';
import type { ParserSource } from '@/domain/entities/parser';

export const parserService = {
  loadDashboard(source: ParserSource) {
    return Promise.all([
      parserRepository.getCities(source),
      parserRepository.getStatus(),
      parserRepository.getParsedCities(),
    ] as const);
  },

  refreshStatus() {
    return parserRepository.getStatus();
  },

  startParse(
    source: ParserSource,
    limit: number,
    city: string,
  ) {
    return parserRepository.startParse(source, {
      limit,
      cities: [city],
    });
  },

  loadParsedCities() {
    return parserRepository.getParsedCities();
  },

  loadCities(source: ParserSource) {
    return parserRepository.getCities(source);
  },
};
