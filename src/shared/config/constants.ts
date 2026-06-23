/** Application-wide constants */

export const APP_NAME = 'EduTrack TA';
export const APP_VERSION = '1.1.0';

/** IndexedDB database name */
export const DB_NAME = 'edutrack-ta';

/** Default pagination page size */
export const DEFAULT_PAGE_SIZE = 20;

/** Debounce delay in ms for search inputs */
export const SEARCH_DEBOUNCE_MS = 300;

/** Navigation routes */
export const ROUTES = {
  DASHBOARD: '/',
  STUDENTS: '/students',
  STUDENT_DETAIL: (id: string) => `/students/${id}`,
  ATTENDANCE: '/attendance',
  INGESTION: '/ingestion',
  ANALYTICS: '/analytics',
  CRM: '/crm',
  SETTINGS: '/settings',
  AI_INSIGHTS: '/ai-insights',
} as const;

/** Risk level thresholds (kept in sync with risk-engine/config/thresholds.ts) */
export const RISK_COLORS = {
  low: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-300',
    border: 'border-emerald-500/30',
  },
  medium: {
    bg: 'bg-amber-400/20',
    text: 'text-amber-300',
    border: 'border-amber-400/30',
  },
  high: {
    bg: 'bg-rose-500/20',
    text: 'text-rose-300',
    border: 'border-rose-500/30',
  },
} as const;
