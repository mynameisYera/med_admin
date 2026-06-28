import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userPriceService } from '@/application/services/userPriceService';
import { ApiError } from '@/infrastructure/http/apiError';
import type { PricesListParams, UserPrice } from '@/domain/entities/userPrice';

const DEFAULT_LIMIT = 50;

export function usePricesSearch() {
  const navigate = useNavigate();

  const [city, setCity] = useState('');
  const [source, setSource] = useState('');
  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [offset, setOffset] = useState(0);

  const [items, setItems] = useState<UserPrice[]>([]);
  const [total, setTotal] = useState(0);
  const [summaryCities, setSummaryCities] = useState<string[]>([]);
  const [summarySources, setSummarySources] = useState<string[]>([]);
  const [totalPrices, setTotalPrices] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listRequested, setListRequested] = useState(false);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const buildParams = useCallback(
    (nextOffset: number): PricesListParams => {
      const params: PricesListParams = {
        limit,
        offset: nextOffset,
      };

      if (city) params.city = city;
      if (source) params.source = source;

      const trimmedQuery = query.trim();
      if (trimmedQuery.length >= 2) {
        params.q = trimmedQuery;
      }

      const min = minPrice.trim() ? Number(minPrice) : undefined;
      const max = maxPrice.trim() ? Number(maxPrice) : undefined;
      if (min != null && !Number.isNaN(min) && min >= 0) {
        params.min_price = min;
      }
      if (max != null && !Number.isNaN(max) && max >= 0) {
        params.max_price = max;
      }

      return params;
    },
    [city, source, query, minPrice, maxPrice, limit],
  );

  const fetchWithParams = useCallback(
    async (params: PricesListParams) => {
      if (!mountedRef.current) return;

      setLoading(true);
      setError(null);

      try {
        const result = await userPriceService.list(params);

        if (!mountedRef.current) return;

        setItems(result.items);
        setTotal(result.total);
        setOffset(result.offset);
        setLimit(result.limit);
        setSummaryCities(result.summary.cities);
        setSummarySources(result.summary.sources);
        setTotalPrices(result.summary.total_prices);
        setListRequested(true);
      } catch (err) {
        if (!mountedRef.current) return;

        if (err instanceof ApiError && err.status === 401) {
          navigate('/admin/login', { replace: true });
          return;
        }

        setError(err instanceof Error ? err.message : 'Ошибка загрузки цен');
        setListRequested(true);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [navigate],
  );

  const fetchList = useCallback(
    (nextOffset: number) => fetchWithParams(buildParams(nextOffset)),
    [fetchWithParams, buildParams],
  );

  const applyFilters = useCallback(() => {
    void fetchList(0);
  }, [fetchList]);

  const resetFilters = useCallback(() => {
    setCity('');
    setSource('');
    setQuery('');
    setMinPrice('');
    setMaxPrice('');
    setLimit(DEFAULT_LIMIT);
    setOffset(0);
    setItems([]);
    setTotal(0);
    setListRequested(false);
    setError(null);

    void fetchWithParams({ limit: DEFAULT_LIMIT, offset: 0 });
  }, [fetchWithParams]);

  const reload = useCallback(() => {
    void fetchList(offset);
  }, [fetchList, offset]);

  const hasNext = offset + items.length < total;
  const hasPrev = offset > 0;

  const goNext = useCallback(() => {
    if (!hasNext) return;
    void fetchList(offset + limit);
  }, [fetchList, hasNext, offset, limit]);

  const goPrev = useCallback(() => {
    if (!hasPrev) return;
    void fetchList(Math.max(0, offset - limit));
  }, [fetchList, hasPrev, offset, limit]);

  const queryTooShort = query.trim().length > 0 && query.trim().length < 2;

  const initialLoadDone = useRef(false);
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    void fetchWithParams({ limit: DEFAULT_LIMIT, offset: 0 });
  }, [fetchWithParams]);

  return {
    city,
    setCity,
    source,
    setSource,
    query,
    setQuery,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    limit,
    setLimit,
    offset,
    items,
    total,
    summaryCities,
    summarySources,
    totalPrices,
    loading,
    error,
    listRequested,
    queryTooShort,
    hasNext,
    hasPrev,
    applyFilters,
    resetFilters,
    reload,
    goNext,
    goPrev,
  };
}
