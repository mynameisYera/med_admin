import { useCallback, useEffect, useRef, useState } from 'react';
import { parserService } from '@/application/services/parserService';
import { ApiError } from '@/infrastructure/http/apiError';
import {
  PARSER_SOURCES,
  SOURCE_LABELS,
  type ParsedCityEntry,
  type ParserSource,
  type ParserStatus,
  type PriceRecord,
  type StartParseResponse,
} from '@/domain/entities/parser';

const FAST_POLL_MS = 10_000;
const SLOW_POLL_MS = 30_000;
const FAST_POLL_DURATION_MS = 120_000;

export function useParserDashboard(initialSource: ParserSource = 'kdl') {
  const [source, setSource] = useState<ParserSource>(initialSource);
  const [cities, setCities] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<ParserStatus | null>(null);
  const [parsedCities, setParsedCities] = useState<ParsedCityEntry[]>([]);
  const [prices, setPrices] = useState<PriceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startInfo, setStartInfo] = useState<StartParseResponse | null>(null);

  const pollingStartedAt = useRef<number | null>(null);
  const pollTimer = useRef<number | null>(null);

  const clearPollTimer = useCallback(() => {
    if (pollTimer.current !== null) {
      window.clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  const refreshParsedAndPrices = useCallback(
    async (currentSource: ParserSource, currentCity: string) => {
      const parsed = await parserService.loadParsedCities();
      setParsedCities(parsed);

      if (currentCity) {
        const nextPrices = await parserService.loadPrices(
          currentSource,
          currentCity,
          Math.min(limit, 20),
        );
        setPrices(nextPrices);
      }
    },
    [limit],
  );

  const pollStatus = useCallback(async () => {
    try {
      const nextStatus = await parserService.refreshStatus();
      setStatus(nextStatus);

      if (nextStatus.running) {
        const started = pollingStartedAt.current ?? Date.now();
        pollingStartedAt.current = started;
        const elapsed = Date.now() - started;
        const delay =
          elapsed < FAST_POLL_DURATION_MS ? FAST_POLL_MS : SLOW_POLL_MS;

        pollTimer.current = window.setTimeout(() => {
          void pollStatus();
        }, delay);
      } else {
        pollingStartedAt.current = null;
        clearPollTimer();
        await refreshParsedAndPrices(source, city);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка опроса статуса');
      clearPollTimer();
    }
  }, [clearPollTimer, city, refreshParsedAndPrices, source]);

  const startPolling = useCallback(() => {
    clearPollTimer();
    pollingStartedAt.current = Date.now();
    void pollStatus();
  }, [clearPollTimer, pollStatus]);

  const loadInitial = useCallback(async (nextSource: ParserSource) => {
    setLoading(true);
    setError(null);

    try {
      const [nextCities, nextStatus, nextParsed] =
        await parserService.loadDashboard(nextSource);

      setCities(nextCities);
      setCity(nextCities[0] ?? '');
      setStatus(nextStatus);
      setParsedCities(nextParsed);

      if (nextCities[0]) {
        const nextPrices = await parserService.loadPrices(
          nextSource,
          nextCities[0],
          10,
        );
        setPrices(nextPrices);
      } else {
        setPrices([]);
      }

      if (nextStatus.running) {
        startPolling();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [startPolling]);

  useEffect(() => {
    void loadInitial(source);
    return () => clearPollTimer();
  }, [source, loadInitial, clearPollTimer]);

  const changeSource = useCallback(
    async (nextSource: ParserSource) => {
      setSource(nextSource);
    },
    [],
  );

  const refreshStatus = useCallback(async () => {
    setActionLoading(true);
    setError(null);
    try {
      const nextStatus = await parserService.refreshStatus();
      setStatus(nextStatus);
      if (nextStatus.running && !pollTimer.current) {
        startPolling();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка статуса');
    } finally {
      setActionLoading(false);
    }
  }, [startPolling]);

  const startParse = useCallback(async () => {
    if (!city) {
      setError('Выберите город');
      return;
    }

    const safeLimit = Math.min(500, Math.max(1, limit));

    setActionLoading(true);
    setError(null);
    setStartInfo(null);

    try {
      const response = await parserService.startParse(source, safeLimit, city);
      setStartInfo(response);
      setStatus((prev) =>
        prev
          ? { ...prev, running: true, lastError: null }
          : {
              running: true,
              startedAt: new Date().toISOString(),
              elapsedSeconds: 0,
              lastStats: null,
              lastError: null,
            },
      );
      startPolling();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Парсинг уже выполняется. Дождитесь завершения.');
      } else {
        setError(err instanceof Error ? err.message : 'Ошибка запуска');
      }
    } finally {
      setActionLoading(false);
    }
  }, [city, limit, source, startPolling]);

  const refreshPrices = useCallback(async () => {
    if (!city) return;
    try {
      const nextPrices = await parserService.loadPrices(source, city, 10);
      setPrices(nextPrices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки цен');
    }
  }, [city, source]);

  const isRunning = Boolean(status?.running);

  return {
    sources: PARSER_SOURCES,
    sourceLabels: SOURCE_LABELS,
    source,
    changeSource,
    cities,
    city,
    setCity,
    limit,
    setLimit,
    status,
    parsedCities,
    prices,
    loading,
    actionLoading,
    error,
    startInfo,
    isRunning,
    startParse,
    refreshStatus,
    refreshPrices,
    setError,
  };
}
