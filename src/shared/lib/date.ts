import { format, parseISO, isValid, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formats an ISO date string for display in Spanish locale.
 */
export function formatDate(isoDate: string, pattern = 'dd/MM/yyyy'): string {
  try {
    const date = parseISO(isoDate);
    if (!isValid(date)) return '—';
    return format(date, pattern, { locale: es });
  } catch {
    return '—';
  }
}

/**
 * Returns days elapsed since a given ISO date string.
 */
export function daysSince(isoDate: string): number {
  try {
    const date = parseISO(isoDate);
    if (!isValid(date)) return 0;
    return differenceInDays(new Date(), date);
  } catch {
    return 0;
  }
}

/**
 * Returns today's date as ISO 8601 string (YYYY-MM-DD).
 */
export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Converts a Date to ISO 8601 date string (YYYY-MM-DD).
 */
export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
