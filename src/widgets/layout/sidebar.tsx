import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Upload,
  BarChart3,
  MessageSquare,
  Settings,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ROUTES } from '@/shared/config/constants';

import type { LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

type IconComponent = ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;

interface NavItem {
  path: string;
  label: string;
  icon: IconComponent;
}

const NAV_ITEMS: NavItem[] = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { path: ROUTES.STUDENTS, label: 'Estudiantes', icon: Users },
  { path: ROUTES.INGESTION, label: 'Carga de Datos', icon: Upload },
  { path: ROUTES.ANALYTICS, label: 'Analítica', icon: BarChart3 },
  { path: ROUTES.CRM, label: 'CRM', icon: MessageSquare },
  { path: ROUTES.SETTINGS, label: 'Configuración', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-slate-900 border-r border-slate-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500">
          <GraduationCap size={18} strokeWidth={1.5} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100 leading-tight">EduTrack TA</p>
          <p className="text-xs text-slate-500 leading-tight">Sistema de Seguimiento</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4" aria-label="Navegación principal">
        <ul className="flex flex-col gap-1" role="list">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const isActive =
              path === ROUTES.DASHBOARD
                ? location.pathname === path ||
                  location.pathname === '/' ||
                  location.pathname === '/dashboard'
                : location.pathname.startsWith(path);

            return (
              <li key={path}>
                <NavLink
                  to={path}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                    isActive
                      ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                  )}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.5}
                    className={isActive ? 'text-indigo-400' : 'text-slate-500'}
                    aria-hidden="true"
                  />
                  {label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-800">
        <p className="text-xs text-slate-600">EduTrack TA v1.1.0</p>
      </div>
    </aside>
  );
}
