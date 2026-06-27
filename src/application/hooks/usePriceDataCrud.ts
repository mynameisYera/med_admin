import { useCallback, useEffect, useState } from 'react';
import { priceDataService } from '@/application/services/priceDataService';
import { parserService } from '@/application/services/parserService';
import { ApiError } from '@/infrastructure/http/apiError';
import type {
  AdminPrice,
  CreatePriceData,
  UpdatePriceData,
} from '@/domain/entities/priceData';
import {
  PARSER_SOURCES,
  SOURCE_LABELS,
  type ParserSource,
} from '@/domain/entities/parser';

const PAGE_SIZE = 50;

export type PriceFormMode = 'create' | 'edit';

interface AppliedFilters {
  source: string;
  city: string;
  query: string;
  includeInactive: boolean;
}

const EMPTY_FILTERS: AppliedFilters = {
  source: '',
  city: '',
  query: '',
  includeInactive: false,
};

export function usePriceDataCrud() {
  const [items, setItems] = useState<AdminPrice[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [source, setSource] = useState('');
  const [city, setCity] = useState('');
  const [query, setQuery] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [appliedFilters, setAppliedFilters] =
    useState<AppliedFilters>(EMPTY_FILTERS);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<PriceFormMode>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreatePriceData>({
    source: 'kdl',
    city: '',
    clinic_name: '',
    service_name_raw: '',
    price_kzt: 0,
    currency: 'KZT',
    is_active: true,
  });

  const loadCities = useCallback(async (nextSource: string) => {
    if (!nextSource) {
      setCities([]);
      return;
    }
    try {
      const list = await parserService.loadCities(nextSource as ParserSource);
      setCities(list);
    } catch {
      setCities([]);
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await priceDataService.list({
        source: appliedFilters.source || undefined,
        city: appliedFilters.city || undefined,
        q: appliedFilters.query || undefined,
        includeInactive: appliedFilters.includeInactive,
        limit: PAGE_SIZE,
        offset,
      });
      setItems(result.items);
      setTotal(result.total);
      setForbidden(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setForbidden(true);
        setItems([]);
        setTotal(0);
      } else {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      }
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, offset]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    const citySource = formOpen ? String(formData.source) : source;
    if (citySource) {
      void loadCities(citySource);
    } else {
      setCities([]);
    }
  }, [formOpen, formData.source, source, loadCities]);

  const applyFilters = useCallback(() => {
    setAppliedFilters({
      source,
      city,
      query,
      includeInactive,
    });
    setOffset(0);
  }, [source, city, query, includeInactive]);

  const resetFilters = useCallback(() => {
    setSource('');
    setCity('');
    setQuery('');
    setIncludeInactive(false);
    setAppliedFilters(EMPTY_FILTERS);
    setOffset(0);
  }, []);

  const hasNext = offset + items.length < total;
  const hasPrev = offset > 0;

  const goNext = useCallback(() => {
    if (hasNext) setOffset((prev) => prev + PAGE_SIZE);
  }, [hasNext]);

  const goPrev = useCallback(() => {
    if (hasPrev) setOffset((prev) => Math.max(0, prev - PAGE_SIZE));
  }, [hasPrev]);

  const openCreate = useCallback(() => {
    setFormMode('create');
    setEditingId(null);
    setFormData({
      source: (source as ParserSource) || 'kdl',
      city: city || '',
      clinic_name: '',
      service_name_raw: '',
      price_kzt: 0,
      currency: 'KZT',
      is_active: true,
    });
    setFormOpen(true);
    setError(null);
  }, [source, city]);

  const openEdit = useCallback(async (id: number) => {
    setActionLoading(true);
    setError(null);

    try {
      const record = await priceDataService.getById(id);
      setFormMode('edit');
      setEditingId(id);
      setFormData({
        source: record.source,
        city: record.city,
        clinic_name: record.clinic_name,
        service_name_raw: record.service_name_raw,
        price_kzt: record.price_kzt,
        currency: record.currency,
        source_url: record.source_url ?? undefined,
        is_active: record.is_active,
      });
      setFormOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки записи');
    } finally {
      setActionLoading(false);
    }
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditingId(null);
  }, []);

  const submitForm = useCallback(async () => {
    setActionLoading(true);
    setError(null);

    try {
      if (formMode === 'create') {
        await priceDataService.create(formData);
      } else if (editingId != null) {
        const patch: UpdatePriceData = { ...formData };
        await priceDataService.update(editingId, patch);
      }
      closeForm();
      await loadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setActionLoading(false);
    }
  }, [closeForm, editingId, formData, formMode, loadList]);

  const hideRecord = useCallback(
    async (id: number) => {
      if (!window.confirm('Скрыть запись? (is_active=false)')) return;

      setActionLoading(true);
      setError(null);
      try {
        await priceDataService.hide(id);
        await loadList();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка скрытия');
      } finally {
        setActionLoading(false);
      }
    },
    [loadList],
  );

  const deleteHard = useCallback(
    async (id: number) => {
      if (
        !window.confirm(
          'Удалить запись навсегда? Это действие необратимо.',
        )
      ) {
        return;
      }

      setActionLoading(true);
      setError(null);
      try {
        await priceDataService.deleteHard(id);
        await loadList();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка удаления');
      } finally {
        setActionLoading(false);
      }
    },
    [loadList],
  );

  const updateFormField = useCallback(
    <K extends keyof CreatePriceData>(key: K, value: CreatePriceData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  return {
    sources: PARSER_SOURCES,
    sourceLabels: SOURCE_LABELS,
    items,
    total,
    offset,
    pageSize: PAGE_SIZE,
    source,
    setSource,
    city,
    setCity,
    query,
    setQuery,
    includeInactive,
    setIncludeInactive,
    cities,
    loading,
    actionLoading,
    error,
    forbidden,
    setError,
    applyFilters,
    resetFilters,
    hasNext,
    hasPrev,
    goNext,
    goPrev,
    formOpen,
    formMode,
    formData,
    updateFormField,
    openCreate,
    openEdit,
    closeForm,
    submitForm,
    hideRecord,
    deleteHard,
    reload: loadList,
  };
}
