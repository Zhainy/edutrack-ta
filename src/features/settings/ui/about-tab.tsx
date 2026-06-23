import { Card } from '@/shared/ui';
import { Github, Linkedin, Globe } from 'lucide-react';
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
            <p className="text-sm text-slate-400 mb-4">
              Desarrollado para Teacher Assistants de SENCE.
            </p>
            <div>
              <p className="text-sm text-slate-400 mb-2">Desarrollado por</p>
              <p className="text-lg font-semibold text-slate-100 mb-3">Nicole Fernández</p>
              <div className="flex gap-3">
                <a
                  href="https://github.com/Zhainy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span className="text-sm">GitHub</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/niferng/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  <span className="text-sm">LinkedIn</span>
                </a>
                <a
                  href="https://zhainy.github.io/nicole-portfolio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">Portafolio</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} EduTrack TA. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}
