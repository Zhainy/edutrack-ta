import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Upload, FileSpreadsheet, FileText, Table, CheckCircle2, XCircle, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { FileType } from '../types';

interface FileUploadZoneProps {
  fileType: FileType;
  acceptedExtensions: string[];
  maxFileSize?: number;
  onFileSelected: (file: File) => void;
  onRemove?: (fileType: FileType) => void;
  disabled?: boolean;
  selectedFile?: File | null;
}

const FILE_TYPE_CONFIG: Record<FileType, { label: string; icon: typeof FileSpreadsheet; color: string }> = {
  attendance: { label: 'Asistencia', icon: FileText, color: 'text-sky-400' },
  progress: { label: 'Progreso', icon: FileSpreadsheet, color: 'text-emerald-400' },
  dedication: { label: 'Dedicación', icon: Table, color: 'text-amber-400' },
  syllabus: { label: 'Syllabus', icon: FileText, color: 'text-indigo-400' },
  students: { label: 'Estudiantes', icon: FileSpreadsheet, color: 'text-cyan-400' },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploadZone({
  fileType,
  acceptedExtensions,
  maxFileSize = 10,
  onFileSelected,
  disabled = false,
  selectedFile,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const config = FILE_TYPE_CONFIG[fileType];

  const extList = acceptedExtensions.join(', ').toUpperCase();

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedExtensions.includes(ext)) {
      return `Tipo de archivo no válido. Se esperaba: ${extList}`;
    }
    if (file.size > maxFileSize * 1024 * 1024) {
      return `El archivo excede el límite de ${maxFileSize} MB`;
    }
    return null;
  };

  const handleFile = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onFileSelected(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleClick = () => {
    if (disabled || selectedFile) return;
    inputRef.current?.click();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const StatusIcon = selectedFile ? CheckCircle2 : error ? XCircle : config.icon;
  const statusColor = selectedFile
    ? 'text-emerald-400'
    : error
      ? 'text-rose-400'
      : isDragging
        ? 'text-indigo-400'
        : config.color;

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`Zona de carga para ${config.label}`}
      aria-describedby={error ? `${fileType}-error` : undefined}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
      className={cn(
        'relative flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        selectedFile
          ? 'border-emerald-500/40 bg-emerald-500/5'
          : error
            ? 'border-rose-500/40 bg-rose-500/5'
            : isDragging
              ? 'border-indigo-400 bg-indigo-500/10'
              : 'border-slate-700 hover:border-slate-600 bg-slate-900/50 hover:bg-slate-900'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptedExtensions.join(',')}
        className="hidden"
        onChange={handleInputChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Close button when file selected */}
      {selectedFile && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setError(null);
            onRemove?.(fileType);
          }}
          className="absolute top-3 right-3 p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          aria-label="Remover archivo"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      )}

      <div
        className={cn(
          'flex items-center justify-center w-14 h-14 rounded-xl transition-colors',
          selectedFile
            ? 'bg-emerald-500/15'
            : error
              ? 'bg-rose-500/15'
              : isDragging
                ? 'bg-indigo-500/15'
                : 'bg-slate-800'
        )}
      >
        {isDragging && !selectedFile ? (
          <Upload size={28} strokeWidth={1.5} className="text-indigo-400" />
        ) : (
          <StatusIcon size={28} strokeWidth={1.5} className={cn('transition-colors', statusColor)} />
        )}
      </div>

      {selectedFile ? (
        <div className="text-center">
          <p className="text-sm font-medium text-slate-200 truncate max-w-[200px]">
            {selectedFile.name}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{formatFileSize(selectedFile.size)}</p>
        </div>
      ) : error ? (
        <div className="text-center">
          <p className="text-sm font-medium text-rose-400">{error}</p>
          <p className="text-xs text-slate-500 mt-0.5">Toca o arrastra para intentar de nuevo</p>
        </div>
      ) : isDragging ? (
        <div className="text-center">
          <p className="text-sm font-medium text-indigo-400">Suelta el archivo aquí</p>
          <p className="text-xs text-slate-500 mt-0.5">{extList} — máx. {maxFileSize} MB</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-sm font-medium text-slate-300">
            Arrastra o haz click para subir
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{extList} — máx. {maxFileSize} MB</p>
        </div>
      )}

      {/* File type badge */}
      <div
        className={cn(
          'absolute top-3 left-3 px-2 py-0.5 rounded-md text-xs font-medium border',
          selectedFile
            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
            : error
              ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
              : 'bg-slate-800 text-slate-400 border-slate-700'
        )}
      >
        {config.label}
      </div>

      {error && (
        <p id={`${fileType}-error`} className="sr-only" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
