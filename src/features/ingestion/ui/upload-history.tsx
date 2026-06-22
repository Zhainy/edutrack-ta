import { EmptyState } from '@/shared/ui/empty-state';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Clock, Trash2, Upload } from 'lucide-react';
import { formatDate } from '@/shared/lib/date';
import type { UploadLog } from '../types';

interface UploadHistoryProps {
  logs: UploadLog[];
  onClear?: () => void;
}

const FILE_TYPE_LABELS: Record<string, string> = {
  attendance: 'Asistencia',
  progress: 'Progreso',
  dedication: 'Dedicación',
  syllabus: 'Syllabus',
  students: 'Estudiantes',
};

function statusVariant(status: UploadLog['status']): 'risk-high' | 'risk-medium' | 'risk-low' | 'info' {
  if (status === 'success') return 'risk-low';
  if (status === 'partial') return 'risk-medium';
  return 'risk-high';
}

function statusLabel(status: UploadLog['status']): string {
  if (status === 'success') return 'Completado';
  if (status === 'partial') return 'Parcial';
  return 'Fallido';
}

export function UploadHistory({ logs, onClear }: UploadHistoryProps) {
  if (logs.length === 0) {
    return (
      <EmptyState
        icon={<Upload size={24} strokeWidth={1.5} />}
        title="Sin historial de cargas"
        description="Los archivos que importes aparecerán aquí."
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-400">
          {logs.length} {logs.length === 1 ? 'carga' : 'cargas'}
        </p>
        {onClear && (
          <Button variant="ghost" size="sm" leftIcon={<Trash2 size={14} strokeWidth={1.5} />} onClick={onClear}>
            Limpiar historial
          </Button>
        )}
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Archivo</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Registros</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} strokeWidth={1.5} className="text-slate-500 flex-shrink-0" />
                    {formatDate(log.uploadedAt, 'dd/MM/yyyy HH:mm')}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  {FILE_TYPE_LABELS[log.fileType] ?? log.fileType}
                </td>
                <td className="px-4 py-3 text-sm text-slate-400 font-mono max-w-[200px] truncate">
                  {log.fileName}
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono text-slate-300">
                  {log.recordsCount}
                  {log.warningCount && log.warningCount > 0 ? (
                    <span className="text-xs text-amber-400 ml-1">({log.warningCount} adv.)</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={statusVariant(log.status)}>
                    {statusLabel(log.status)}
                  </Badge>
                  {log.errorMessage && (
                    <p className="text-xs text-rose-400 mt-0.5 truncate max-w-[150px]" title={log.errorMessage}>
                      {log.errorMessage}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
