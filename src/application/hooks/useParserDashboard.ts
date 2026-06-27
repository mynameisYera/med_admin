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
  const [pricesLoading, setPricesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startInfo, setStartInfo] = useState<StartParseResponse | null>(null);

  const sourceRef = useRef(source);
  const cityRef = useRef(city);
  const limitRef = useRef(limit);
  const pollingStartedAt = useRef<number | null>(null);
  const pollTimer = useRef<number | null>(null);
  const hasLoadedOnce = useRef(false);

  sourceRef.current = source;
  cityRef.current = city;
  limitRef.current = limit;

  const clearPollTimer = useCallback(() => {
    if (pollTimer.current !== null) {
      window.clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  const refreshParsedCities = useCallback(async () => {
    const parsed = await parserService.loadParsedCities();
    setParsedCities(parsed);
  }, []);

  const pollStatusRef = useRef<() => Promise<void>>(async () => {});

  pollStatusRef.current = async () => {
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
          void pollStatusRef.current();
        }, delay);
      } else {
        pollingStartedAt.current = null;
        clearPollTimer();
        await refreshParsedCities();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка опроса статуса');
      clearPollTimer();
    }
  };

  const startPolling = useCallback(() => {
    clearPollTimer();
    pollingStartedAt.current = Date.now();
    void pollStatusRef.current();
  }, [clearPollTimer]);

  useEffect(() => {
    let cancelled = false;

    async function loadForSource(nextSource: ParserSource) {
      if (!hasLoadedOnce.current) {
        setLoading(true);
      }
      setError(null);
      clearPollTimer();

      try {
        const [nextCities, nextStatus, nextParsed] =
          await parserService.loadDashboard(nextSource);

        if (cancelled) return;

        setCities(nextCities);
        setCity(nextCities[0] ?? '');
        setStatus(nextStatus);
        setParsedCities(nextParsed);
        setPrices([]);

        if (nextStatus.running) {
          startPolling();
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Ошибка загрузки');
        }
      } finally {
        if (!cancelled) {
          hasLoadedOnce.current = true;
          setLoading(false);
        }
      }
    }

    void loadForSource(source);

    return () => {
      cancelled = true;
      clearPollTimer();
    };
  }, [source, clearPollTimer, startPolling]);

  const changeSource = useCallback((nextSource: ParserSource) => {
    setSource(nextSource);
  }, []);

  const refreshStatus = useCallback(async () => {
    setActionLoading(true);
    setError(null);
    try {
      const nextStatus = await parserService.refreshStatus();
      setStatus(nextStatus);
      if (nextStatus.running && pollTimer.current === null) {
        startPolling();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка статуса');
    } finally {
      setActionLoading(false);
    }
  }, [startPolling]);

  const startParse = useCallback(async () => {
    if (!cityRef.current) {
      setError('Выберите город');
      return;
    }

    const safeLimit = Math.min(500, Math.max(1, limitRef.current));

    setActionLoading(true);
    setError(null);
    setStartInfo(null);

    try {
      const response = await parserService.startParse(
        sourceRef.current,
        safeLimit,
        cityRef.current,
      );
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
  }, [startPolling]);

  const changeCity = useCallback((nextCity: string) => {
    setCity(nextCity);
    setPrices([]);
  }, []);

  const refreshPrices = useCallback(async () => {
    if (!cityRef.current) {
      setError('Выберите город');
      return;
    }

    setPricesLoading(true);
    setError(null);

    try {
      const nextPrices = await parserService.loadPrices(
        sourceRef.current,
        cityRef.current,
        10,
      );
      setPrices(nextPrices);
    } catch (err) {
      setPrices([]);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки цен');
    } finally {
      setPricesLoading(false);
    }
  }, []);

  const isRunning = Boolean(status?.running);

  return {
    sources: PARSER_SOURCES,
    sourceLabels: SOURCE_LABELS,
    source,
    changeSource,
    cities,
    city,
    setCity: changeCity,
    limit,
    setLimit,
    status,
    parsedCities,
    prices,
    pricesLoading,
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
