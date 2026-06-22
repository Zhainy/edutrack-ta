import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { FileSpreadsheet, CheckCircle2, X, UserPlus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

interface StudentUploadZoneProps {
  selectedFile: File | null;
  onFileSelected: (file: File) => void;
  onRemove: () => void;
  disabled?: boolean;
  onManualAdd: (data: { nombre: string; email: string; rut?: string; telefono?: string }) => void;
}

export function StudentUploadZone({
  selectedFile,
  onFileSelected,
  onRemove,
  disabled = false,
  onManualAdd,
}: StudentUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formNombre, setFormNombre] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRut, setFormRut] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!['.csv', '.xlsx', '.xls'].includes(ext)) {
      return 'Tipo de archivo no válido. Se esperaba: CSV, XLSX';
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'El archivo excede el límite de 10 MB';
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

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim() || !formEmail.trim()) return;
    onManualAdd({
      nombre: formNombre.trim(),
      email: formEmail.trim(),
      rut: formRut.trim() || undefined,
      telefono: formTelefono.trim() || undefined,
    });
    setFormNombre('');
    setFormEmail('');
    setFormRut('');
    setFormTelefono('');
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Zona de carga para estudiantes"
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
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
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={handleInputChange}
          aria-hidden="true"
          tabIndex={-1}
        />

        {selectedFile && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setError(null); onRemove(); }}
            className="absolute top-3 right-3 p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
            aria-label="Remover archivo"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        )}

        <div className={cn(
          'p-3 rounded-full bg-slate-800/50',
          selectedFile ? 'text-emerald-400' : error ? 'text-rose-400' : isDragging ? 'text-indigo-400' : 'text-cyan-400'
        )}>
          {selectedFile ? <CheckCircle2 size={24} strokeWidth={1.5} /> : <FileSpreadsheet size={24} strokeWidth={1.5} />}
        </div>

        <div className="text-center">
          {selectedFile ? (
            <p className="text-sm font-medium text-slate-200">{selectedFile.name}</p>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-300">
                {isDragging ? 'Suelta el archivo aquí' : 'Carga masiva de estudiantes'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Arrastra un archivo CSV o XLSX, o haz clic para seleccionar
              </p>
              <p className="mt-0.5 text-xs text-slate-600">
                Headers esperados: RUT, Nombre, Email, Teléfono
              </p>
            </>
          )}
        </div>

        {error && (
          <p id="students-error" className="text-xs text-rose-400">{error}</p>
        )}
      </div>

      {/* Manual add form toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<UserPlus size={14} strokeWidth={1.5} />}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : 'Agregar manualmente'}
        </Button>
      </div>

      {/* Manual add form */}
      {showForm && (
        <form onSubmit={handleManualSubmit} className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Nombre completo *"
              value={formNombre}
              onChange={(e) => setFormNombre(e.target.value)}
              required
            />
            <Input
              placeholder="Email *"
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              required
            />
            <Input
              placeholder="RUT (opcional)"
              value={formRut}
              onChange={(e) => setFormRut(e.target.value)}
            />
            <Input
              placeholder="Teléfono (opcional)"
              value={formTelefono}
              onChange={(e) => setFormTelefono(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!formNombre.trim() || !formEmail.trim()}
            >
              Agregar Estudiante
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
