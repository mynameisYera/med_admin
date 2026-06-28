import { useCallback, useEffect, useRef, useState } from 'react';
import { userPriceService } from '@/application/services/userPriceService';
import { useAuth } from '@/application/hooks/useAuthContext';
import { ApiError } from '@/infrastructure/http/apiError';
import type { PricesListParams, UserPrice } from '@/domain/entities/userPrice';

const DEFAULT_LIMIT = 50;

export function usePricesSearch() {
  const { logout } = useAuth();

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

  const fetchList = useCallback(
    async (nextOffset: number) => {
      setLoading(true);
      setError(null);

      try {
        const result = await userPriceService.list(buildParams(nextOffset));

        setItems(result.items);
        setTotal(result.total);
        setOffset(result.offset);
        setLimit(result.limit);
        setSummaryCities(result.summary.cities);
        setSummarySources(result.summary.sources);
        setTotalPrices(result.summary.total_prices);
        setListRequested(true);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof Error ? err.message : 'Ошибка загрузки цен');
      } finally {
        setLoading(false);
      }
    },
    [buildParams, logout],
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
  }, []);

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
    void fetchList(0);
  }, [fetchList]);

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
