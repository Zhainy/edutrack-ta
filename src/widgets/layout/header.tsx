import { useLocation } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/students': 'Estudiantes',
  '/ingestion': 'Carga de Datos',
  '/analytics': 'Analítica',
  '/crm': 'CRM',
  '/settings': 'Configuración',
};

function getRouteLabel(pathname: string): string {
  // Handle /students/:id
  if (pathname.startsWith('/students/')) return 'Perfil de Estudiante';
  return ROUTE_LABELS[pathname] ?? 'EduTrack TA';
}

export function Header() {
  const location = useLocation();
  const pageTitle = getRouteLabel(location.pathname);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-16 items-center justify-between px-6',
        'bg-slate-900/80 backdrop-blur-sm border-b border-slate-800'
      )}
    >
      {/* Breadcrumb / page title */}
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-semibold text-slate-100">{pageTitle}</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
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
          {/* Notification badge */}
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
