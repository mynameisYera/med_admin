import type {
  ParsedCityEntry,
  ParserSource,
  ParserStatus,
  PriceRecord,
  StartParseRequest,
  StartParseResponse,
} from '../entities/parser';

export interface ParserRepository {
  getCities(source: ParserSource): Promise<string[]>;
  getStatus(): Promise<ParserStatus>;
  startParse(
    source: ParserSource,
    request: StartParseRequest,
  ): Promise<StartParseResponse>;
  getParsedCities(): Promise<ParsedCityEntry[]>;
  getPrices(
    source: ParserSource,
    city: string,
    limit: number,
  ): Promise<PriceRecord[]>;
}
