import { format, parseISO, isValid, differenceInDays, formatDistanceToNow } from 'date-fns';
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

/**
 * Returns a human-readable relative date string in Spanish.
 * e.g. "hace 2 días", "ayer", "hoy"
 */
export function relativeDate(isoDate: string): string {
  try {
    const date = parseISO(isoDate);
    if (!isValid(date)) return '—';
    const now = new Date();
    const diffDays = differenceInDays(now, date);
    if (diffDays === 0) return 'hoy';
    if (diffDays === 1) return 'ayer';
    if (diffDays < 7) return `hace ${diffDays} días`;
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  } catch {
    return '—';
  }
}

/**
 * Formats an ISO date string to date portion only (YYYY-MM-DD).
 */
export function toDateOnly(isoDate: string): string {
  try {
    const date = parseISO(isoDate);
    if (!isValid(date)) return '—';
    return format(date, 'yyyy-MM-dd');
  } catch {
    return '—';
  }
}
