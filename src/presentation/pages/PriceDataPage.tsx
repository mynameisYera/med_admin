import { usePriceDataCrud } from '@/application/hooks/usePriceDataCrud';
import { PriceDataFilters } from '../components/PriceDataFilters';
import { PriceDataTable } from '../components/PriceDataTable';
import { PriceFormModal } from '../components/PriceFormModal';

export function PriceDataPage() {
  const crud = usePriceDataCrud();

  return (
    <main className="content">
      {crud.forbidden && (
        <div className="alert alert-error">
          Нет прав администратора. В БД нужно{' '}
          <code>UPDATE &quot;user&quot; SET role = &apos;admin&apos;</code> и
          перелогиниться.
        </div>
      )}

      {crud.error && !crud.forbidden && (
        <div className="alert alert-error">{crud.error}</div>
      )}

      <section className="panel">
        <div className="section-header">
          <h2>Управление ценами</h2>
          <button
            type="button"
            className="btn btn-primary"
            onClick={crud.openCreate}
            disabled={crud.forbidden || crud.actionLoading}
          >
            Добавить вручную
          </button>
        </div>

        <PriceDataFilters
          source={crud.source}
          onSourceChange={crud.setSource}
          city={crud.city}
          onCityChange={crud.setCity}
          query={crud.query}
          onQueryChange={crud.setQuery}
          includeInactive={crud.includeInactive}
          onIncludeInactiveChange={crud.setIncludeInactive}
          cities={crud.cities}
          onApply={crud.applyFilters}
          onReset={crud.resetFilters}
          disabled={crud.forbidden || crud.loading}
        />

        {!crud.listRequested && !crud.forbidden && (
          <p className="muted hint-block">
            Данные не загружаются автоматически. Нажмите «Применить фильтры».
          </p>
        )}
      </section>

      <section className="panel">
        <div className="section-header">
          <p className="muted">
            Всего: {crud.total} · показано {crud.items.length} · offset{' '}
            {crud.offset}
          </p>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => void crud.reload()}
            disabled={crud.loading || crud.forbidden || !crud.listRequested}
          >
            Обновить
          </button>
        </div>

        <PriceDataTable
          items={crud.items}
          loading={crud.loading}
          listRequested={crud.listRequested}
          actionLoading={crud.actionLoading}
          onEdit={(id) => void crud.openEdit(id)}
          onHide={(id) => void crud.hideRecord(id)}
          onDeleteHard={(id) => void crud.deleteHard(id)}
        />

        <div className="pagination">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={crud.goPrev}
            disabled={!crud.hasPrev || crud.loading || !crud.listRequested}
          >
            ← Назад
          </button>
          <span className="muted">
            {crud.offset + 1}–{crud.offset + crud.items.length} из {crud.total}
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={crud.goNext}
            disabled={!crud.hasNext || crud.loading || !crud.listRequested}
          >
            Вперёд →
          </button>
        </div>
      </section>

      <PriceFormModal
        open={crud.formOpen}
        mode={crud.formMode}
        data={crud.formData}
        cities={crud.cities}
        loading={crud.actionLoading}
        onClose={crud.closeForm}
        onSubmit={() => void crud.submitForm()}
        onChange={crud.updateFormField}
      />
    </main>
  );
}
