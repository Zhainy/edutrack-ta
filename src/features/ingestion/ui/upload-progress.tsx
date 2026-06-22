import { useMemo, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import type { ValidationError } from '../types';

type UploadStatus = 'idle' | 'parsing' | 'validating' | 'saving' | 'success' | 'error';

interface UploadProgressProps {
  status: UploadStatus;
  progress?: number;
  fileName: string;
  stats?: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
  };
  errors?: ValidationError[];
  onRetry?: () => void;
}

const STATUS_MESSAGES: Record<UploadStatus, { label: string; description: string; icon: React.ReactNode }> = {
  idle: { label: 'Esperando', description: '', icon: null },
  parsing: {
    label: 'Leyendo archivo',
    description: 'Extrayendo datos del archivo...',
    icon: <Loader2 size={20} strokeWidth={1.5} className="animate-spin text-sky-400" />,
  },
  validating: {
    label: 'Validando datos',
    description: 'Revisando formato y consistencia...',
    icon: <Loader2 size={20} strokeWidth={1.5} className="animate-spin text-sky-400" />,
  },
  saving: {
    label: 'Guardando en base de datos',
    description: 'Persistiendo la información...',
    icon: <Loader2 size={20} strokeWidth={1.5} className="animate-spin text-sky-400" />,
  },
  success: {
    label: 'Carga completada',
    description: 'Los datos se importaron correctamente.',
    icon: <CheckCircle2 size={20} strokeWidth={1.5} className="text-emerald-400" />,
  },
  error: {
    label: 'Error en la carga',
    description: 'Ocurrió un problema durante la importación.',
    icon: <XCircle size={20} strokeWidth={1.5} className="text-rose-400" />,
  },
};

export function UploadProgress({
  status,
  progress,
  fileName,
  stats,
  errors,
  onRetry,
}: UploadProgressProps) {
  const [showErrors, setShowErrors] = useState(false);
  const msg = STATUS_MESSAGES[status];
  const isProcessing = status === 'parsing' || status === 'validating' || status === 'saving';
  const isFinished = status === 'success' || status === 'error';

  const uniqueErrors = useMemo(() => {
    if (!errors) return [];
    const seen = new Set<number>();
    return errors.filter((e) => {
      if (seen.has(e.row)) return false;
      seen.add(e.row);
      return true;
    });
  }, [errors]);

  if (status === 'idle') return null;

  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-colors',
        status === 'success' && 'bg-emerald-500/5 border-emerald-500/20',
        status === 'error' && 'bg-rose-500/5 border-rose-500/20',
        isProcessing && 'bg-slate-900 border-slate-800'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        {msg.icon}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200">{msg.label}</p>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {fileName}{msg.description ? ` — ${msg.description}` : ''}
          </p>
        </div>
        {status === 'error' && onRetry && (
          <Button variant="secondary" size="sm" leftIcon={<RotateCcw size={14} strokeWidth={1.5} />} onClick={onRetry}>
            Reintentar
          </Button>
        )}
      </div>

      {/* Progress bar */}
      {isProcessing && (
        <div className="mt-3">
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${progress ?? 0}%` }}
            />
          </div>
          {progress !== undefined && (
            <p className="text-xs text-slate-500 mt-1 text-right font-mono">{progress}%</p>
          )}
        </div>
      )}

      {/* Stats */}
      {isFinished && stats && (
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Total:</span>
            <span className="text-sm font-mono text-slate-300">{stats.totalRows}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} strokeWidth={1.5} className="text-emerald-400" />
            <span className="text-sm font-mono text-emerald-400">{stats.validRows}</span>
          </div>
          {stats.invalidRows > 0 && (
            <div className="flex items-center gap-1.5">
              <XCircle size={14} strokeWidth={1.5} className="text-rose-400" />
              <span className="text-sm font-mono text-rose-400">{stats.invalidRows}</span>
            </div>
          )}
        </div>
      )}

      {/* Warnings */}
      {isFinished && stats && stats.invalidRows > 0 && stats.validRows > 0 && (
        <div className="flex items-center gap-1.5 mt-2">
          <AlertTriangle size={14} strokeWidth={1.5} className="text-amber-400" />
          <p className="text-xs text-amber-400">
            Carga parcial: {stats.validRows} de {stats.totalRows} filas válidas
          </p>
        </div>
      )}

      {/* Errors list */}
      {uniqueErrors.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowErrors(!showErrors)}
            className="flex items-center gap-1 text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors"
          >
            {showErrors ? <ChevronDown size={14} strokeWidth={1.5} /> : <ChevronRight size={14} strokeWidth={1.5} />}
            {uniqueErrors.length} {uniqueErrors.length === 1 ? 'error' : 'errores'}
          </button>
          {showErrors && (
            <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
              {uniqueErrors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-rose-500/5 border border-rose-500/10">
                  <XCircle size={12} strokeWidth={1.5} className="text-rose-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-slate-400">
                    <span className="font-medium text-rose-300">Fila {err.row}</span>
                    {err.column !== 'general' && <span> · Columna: {err.column}</span>}
                    <p className="text-slate-400 mt-0.5">{err.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
