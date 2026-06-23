import { Card } from '@/shared/ui';
import { APP_NAME, APP_VERSION } from '@/shared/config/constants';

export function AboutTab() {
  return (
    <Card>
      <Card.Header>
        <h3 className="text-sm font-semibold text-slate-100">Acerca de</h3>
      </Card.Header>
      <Card.Content>
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-slate-100">{APP_NAME}</h4>
            <p className="mt-1 text-sm text-slate-400">
              Sistema de seguimiento para Teacher Assistants de SENCE.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Versión</span>
              <p className="text-slate-100 font-medium">{APP_VERSION}</p>
            </div>
            <div>
              <span className="text-slate-500">Stack</span>
              <p className="text-slate-100">React 18 + TypeScript + Tailwind</p>
            </div>
            <div>
              <span className="text-slate-500">Base de datos</span>
              <p className="text-slate-100">IndexedDB (Dexie)</p>
            </div>
            <div>
              <span className="text-slate-500">Estado</span>
              <p className="text-slate-100">Zustand</p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <h4 className="text-sm font-semibold text-slate-100 mb-2">Créditos</h4>
            <p className="text-sm text-slate-400">
              Desarrollado para Teacher Assistants de SENCE.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              &copy; {new Date().getFullYear()} EduTrack TA. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}
