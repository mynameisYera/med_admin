export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatElapsed(seconds: number | null | undefined): string {
  if (seconds == null) return '';
  if (seconds < 60) return `${seconds} сек`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest > 0 ? `${minutes} мин ${rest} сек` : `${minutes} мин`;
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

const CITY_LABELS: Record<string, string> = {
  almaty: 'Алматы',
  astana: 'Астана',
  pavlodar: 'Павлодар',
  shymkent: 'Шымкент',
  karaganda: 'Караганда',
};

export function formatCityLabel(slug: string | null | undefined): string {
  if (!slug) return '—';
  return CITY_LABELS[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function formatPriceKzt(
  amount: number | null | undefined,
  currency = 'KZT',
): string {
  const safeAmount =
    typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;
  const safeCurrency = currency || 'KZT';

  try {
    return new Intl.NumberFormat('ru-KZ', {
      style: 'currency',
      currency: safeCurrency,
      maximumFractionDigits: 0,
    }).format(safeAmount);
  } catch {
    return `${safeAmount.toLocaleString('ru-RU')} ₸`;
  }
}
