import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, User, Menu, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useStudentsStore } from '@/features/students';

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/students': 'Estudiantes',
  '/ingestion': 'Carga de Datos',
  '/analytics': 'Analítica',
  '/crm': 'CRM',
  '/settings': 'Configuración',
};

function getRouteLabel(pathname: string): string {
  if (pathname.startsWith('/students/')) return 'Perfil de Estudiante';
  return ROUTE_LABELS[pathname] ?? 'EduTrack TA';
}

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const location = useLocation();
  const pageTitle = getRouteLabel(location.pathname);

  const cohorts = useStudentsStore((s) => s.cohorts);
  const activeCohortId = useStudentsStore((s) => s.activeCohortId);
  const setActiveCohort = useStudentsStore((s) => s.setActiveCohort);
  const loadCohorts = useStudentsStore((s) => s.loadCohorts);

  useEffect(() => {
    void loadCohorts();
  }, [loadCohorts]);

  const activeCohort = cohorts.find((c) => c.id === activeCohortId);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-16 items-center justify-between px-4 md:px-6',
        'bg-slate-900/80 backdrop-blur-sm border-b border-slate-800'
      )}
    >
      {/* Left section */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className={cn(
            'flex md:hidden items-center justify-center w-9 h-9 rounded-lg',
            'text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
          )}
          aria-label="Abrir menú"
        >
          <Menu size={20} strokeWidth={1.5} aria-hidden="true" />
        </button>

        <h1 className="text-sm font-semibold text-slate-100">{pageTitle}</h1>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Course selector */}
        {cohorts.length === 1 ? (
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            {activeCohort?.code ?? 'Sin curso'}
          </span>
        ) : cohorts.length > 1 ? (
          <div className="relative hidden sm:block">
            <select
              value={activeCohortId ?? ''}
              onChange={(e) => setActiveCohort(e.target.value)}
              className={cn(
                'appearance-none px-3 py-1.5 pr-8 rounded-md text-sm',
                'bg-slate-800 border border-slate-700 text-slate-200',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                'cursor-pointer'
              )}
              aria-label="Seleccionar curso"
            >
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              strokeWidth={1.5}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        ) : null}

        {/* Notifications */}
        <button
          className={cn(
            'relative flex items-center justify-center w-9 h-9 rounded-lg',
            'text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
          )}
          aria-label="Notificaciones"
        >
          <Bell size={18} strokeWidth={1.5} aria-hidden="true" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"
            aria-label="Tienes notificaciones pendientes"
          />
        </button>

        {/* Avatar */}
        <div
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-full',
            'bg-slate-700 border border-slate-600 text-slate-300'
          )}
          aria-label="Usuario"
          role="img"
        >
          <User size={16} strokeWidth={1.5} aria-hidden="true" />
        </div>
      </div>
    </header>
  );
}
