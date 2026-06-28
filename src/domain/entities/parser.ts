export const PARSER_SOURCES = ['kdl', 'olymp', 'helix', 'invitro'] as const;

export type ParserSource = (typeof PARSER_SOURCES)[number];

export const SOURCE_LABELS: Record<ParserSource, string> = {
  kdl: 'KDL Олимп',
  olymp: 'Olymp',
  helix: 'Helix',
  invitro: 'Invitro',
};

export interface ParsedCityEntry {
  source: string;
  city: string;
}

export interface ParserStatus {
  running: boolean;
  startedAt: string | null;
  elapsedSeconds: number | null;
  lastStats: ParserLastStats | null;
  lastError: string | null;
}

export interface ParserLastStats {
  source?: string;
  total_records?: number;
  errors?: number;
  cities_ok?: string[];
  finished_at?: string;
}

export interface StartParseRequest {
  limit: number;
  cities: string[];
}

export interface StartParseResponse {
  status: string;
  source: string;
  limit: number;
  cities: string[];
  estimated_minutes?: number;
  message?: string;
}
