const percentFormatter = new Intl.NumberFormat('en-CA', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat('en-CA', {
  maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
});

const compactMillionsFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatPercent(value: number): string {
  return percentFormatter.format(value);
}

export function formatCount(value: number): string {
  return integerFormatter.format(value);
}

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatCurrencyCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${compactMillionsFormatter.format(value / 1_000_000)}M`;
  }
  if (Math.abs(value) >= 1000) return `${currencyFormatter.format(value / 1000)}K`;
  return currencyFormatter.format(value);
}

export function formatCutoff(value: string): string {
  if (!value) return 'Not available';
  const parsed = /^-?\d{11,}$/.test(value)
    ? new Date(Number(value))
    : new Date(value.length <= 10 ? `${value}T00:00:00Z` : value);
  return Number.isNaN(parsed.getTime()) ? value : dateFormatter.format(parsed);
}

export function signedPercent(value: number): string {
  if (!Number.isFinite(value) || value === 0) return 'flat';
  return `${value > 0 ? '+' : ''}${formatPercent(value)}`;
}
