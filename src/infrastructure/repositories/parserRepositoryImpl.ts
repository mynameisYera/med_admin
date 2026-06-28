import type { ParserRepository } from '@/domain/repositories/parser.repository';
import type {
  ParsedCityEntry,
  ParserSource,
  ParserStatus,
  StartParseRequest,
  StartParseResponse,
} from '@/domain/entities/parser';
import { ApiError, parseErrorResponse } from '../http/apiError';
import { httpClient, httpClientRaw } from '../http/httpClient';

interface RawParserStatus {
  running: boolean;
  started_at?: string | null;
  elapsed_seconds?: number | null;
  last_stats?: {
    source?: string;
    total_records?: number;
    errors?: number;
    cities_ok?: string[];
    finished_at?: string;
  } | null;
  last_error?: string | null;
}

function mapStatus(raw: RawParserStatus): ParserStatus {
  return {
    running: raw.running,
    startedAt: raw.started_at ?? null,
    elapsedSeconds: raw.elapsed_seconds ?? null,
    lastStats: raw.last_stats
      ? {
          source: raw.last_stats.source,
          total_records: raw.last_stats.total_records,
          errors: raw.last_stats.errors,
          cities_ok: raw.last_stats.cities_ok,
          finished_at: raw.last_stats.finished_at,
        }
      : null,
    lastError: raw.last_error ?? null,
  };
}

function normalizeParsedCities(data: unknown): ParsedCityEntry[] {
  if (Array.isArray(data)) {
    if (data.length === 0) return [];

    if (typeof data[0] === 'string') {
      return (data as string[]).map((entry) => {
        const [source, city] = entry.split('/');
        return { source: source ?? entry, city: city ?? '' };
      });
    }

    return (data as ParsedCityEntry[]).map((item) => ({
      source: item.source,
      city: item.city,
    }));
  }

  if (data && typeof data === 'object') {
    const entries: ParsedCityEntry[] = [];
    for (const [source, cities] of Object.entries(
      data as Record<string, string[] | string>,
    )) {
      const list = Array.isArray(cities) ? cities : [cities];
      for (const city of list) {
        entries.push({ source, city });
      }
    }
    return entries;
  }

  return [];
}

export class ParserRepositoryImpl implements ParserRepository {
  async getCities(source: ParserSource): Promise<string[]> {
    return httpClient<string[]>(`/parser/${source}/cities`);
  }

  async getStatus(): Promise<ParserStatus> {
    const raw = await httpClient<RawParserStatus>('/parser/status');
    return mapStatus(raw);
  }

  async startParse(
    source: ParserSource,
    request: StartParseRequest,
  ): Promise<StartParseResponse> {
    const response = await httpClientRaw(`/parser/${source}/run`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (response.status === 409) {
      throw new ApiError('Парсинг уже выполняется. Дождитесь завершения.', 409);
    }

    if (!response.ok) {
      const detail = await parseErrorResponse(response);
      throw new ApiError(detail, response.status, detail);
    }

    return response.json() as Promise<StartParseResponse>;
  }

  async getParsedCities(): Promise<ParsedCityEntry[]> {
    const data = await httpClient<unknown>('/parser/cities/parsed');
    return normalizeParsedCities(data);
  }
}

export const parserRepository = new ParserRepositoryImpl();
