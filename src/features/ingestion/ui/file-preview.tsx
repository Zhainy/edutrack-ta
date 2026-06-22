import { FileSpreadsheet, FileText, Table, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { FileType } from '../types';

interface FilePreviewProps {
  file: File;
  fileType: FileType;
  status?: 'pending' | 'processing' | 'completed' | 'error';
  onRemove: () => void;
}

const FILE_TYPE_CONFIG: Record<FileType, { label: string; icon: typeof FileSpreadsheet; color: string }> = {
  attendance: { label: 'Asistencia', icon: FileText, color: 'text-sky-400' },
  progress: { label: 'Progreso', icon: FileSpreadsheet, color: 'text-emerald-400' },
  dedication: { label: 'Dedicación', icon: Table, color: 'text-amber-400' },
  syllabus: { label: 'Syllabus', icon: FileText, color: 'text-indigo-400' },
  students: { label: 'Estudiantes', icon: FileSpreadsheet, color: 'text-cyan-400' },
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'bg-slate-700/50 text-slate-300 border-slate-600/50' },
  processing: { label: 'Procesando', className: 'bg-sky-400/20 text-sky-300 border-sky-400/30' },
  completed: { label: 'Completado', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  error: { label: 'Error', className: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilePreview({ file, fileType, status = 'pending', onRemove }: FilePreviewProps) {
  const config = FILE_TYPE_CONFIG[fileType];
  const statusConfig = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0',
          config.color.replace('text-', 'bg-').replace(/-(\d+)$/, '-$1/15')
        )}
      >
        <config.icon size={20} strokeWidth={1.5} className={config.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
          <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0', statusConfig.className)}>
            {statusConfig.label}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-500">{formatFileSize(file.size)}</span>
          <span className="text-xs text-slate-600">·</span>
          <span className="text-xs text-slate-500">{config.label}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors flex-shrink-0"
        aria-label={`Remover ${file.name}`}
      >
        <X size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}
