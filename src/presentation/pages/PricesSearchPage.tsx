import { usePricesSearch } from '@/application/hooks/usePricesSearch';
import { PricesSearchFilters } from '../components/PricesSearchFilters';
import { UserPriceCard } from '../components/UserPriceCard';

export function PricesSearchPage() {
  const search = usePricesSearch();

  return (
    <main className="content">
      {search.error && <div className="alert alert-error">{search.error}</div>}

      <section className="panel">
        <div className="section-header">
          <div>
            <h2>Поиск цен</h2>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={search.reload}
            disabled={search.loading || !search.listRequested}
          >
            Обновить
          </button>
        </div>

        <PricesSearchFilters
          city={search.city}
          onCityChange={search.setCity}
          source={search.source}
          onSourceChange={search.setSource}
          query={search.query}
          onQueryChange={search.setQuery}
          minPrice={search.minPrice}
          onMinPriceChange={search.setMinPrice}
          maxPrice={search.maxPrice}
          onMaxPriceChange={search.setMaxPrice}
          limit={search.limit}
          onLimitChange={search.setLimit}
          cities={search.summaryCities}
          sources={search.summarySources}
          queryTooShort={search.queryTooShort}
          onApply={search.applyFilters}
          onReset={search.resetFilters}
          disabled={search.loading}
        />

        {search.queryTooShort && (
          <p className="muted hint-block">
            Поиск по названию — минимум 2 символа.
          </p>
        )}
      </section>

      {search.listRequested && (
        <section className="panel">
          <div className="section-header">
            <p className="muted">
              Найдено: {search.total} · показано {search.items.length} · offset{' '}
              {search.offset}
            </p>
          </div>

          {search.loading ? (
            <div className="loading-panel">
              <div className="spinner" aria-label="Загрузка" />
              <span>Загрузка цен…</span>
            </div>
          ) : search.items.length === 0 ? (
            <p className="muted">Ничего не найдено. Измените фильтры.</p>
          ) : (
            <div className="price-cards">
              {search.items.map((item, index) => (
                <UserPriceCard key={item.id ?? `price-${index}`} item={item} />
              ))}
            </div>
          )}

          {search.items.length > 0 && (
            <div className="pagination">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={search.goPrev}
                disabled={!search.hasPrev || search.loading}
              >
                ← Назад
              </button>
              <span className="muted">
                {search.offset + 1}–{search.offset + search.items.length} из{' '}
                {search.total}
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={search.goNext}
                disabled={!search.hasNext || search.loading}
              >
                Вперёд →
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
