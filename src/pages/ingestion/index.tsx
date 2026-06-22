import { useEffect, useMemo, useState } from 'react';
import { Upload, HardDrive, Trash2, Play, Users } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { FileUploadZone } from '@/features/ingestion/ui/file-upload-zone';
import { FilePreview } from '@/features/ingestion/ui/file-preview';
import { UploadProgress } from '@/features/ingestion/ui/upload-progress';
import { UploadHistory } from '@/features/ingestion/ui/upload-history';
import { StudentUploadZone } from '@/features/ingestion/ui/student-upload-zone';
import { useIngestion } from '@/features/ingestion/hooks/use-ingestion';
import { useStudentsStore } from '@/features/students';
import { bulkImportStudents } from '@/features/students';
import { normalizeStudentFromImport } from '@/features/ingestion/lib/normalizer';
import { toast } from 'sonner';
import type { FileType } from '@/features/ingestion/types';

const ZONE_CONFIG: { fileType: FileType; acceptedExtensions: string[]; description: string }[] = [
  { fileType: 'attendance', acceptedExtensions: ['.csv', '.xlsx'], description: 'CSV/XLSX con fechas y estados de asistencia' },
  { fileType: 'progress', acceptedExtensions: ['.csv'], description: 'CSV de SENCE (progress.*.csv) con actividades' },
  { fileType: 'dedication', acceptedExtensions: ['.xlsx', '.xls'], description: 'XLSX de SENCE (dedication.*.xlsx) con minutos' },
  { fileType: 'syllabus', acceptedExtensions: ['.xlsx', '.xls'], description: 'XLSX del cronograma del curso (CRONOGRAMA*.xlsx)' },
  { fileType: 'students', acceptedExtensions: ['.csv', '.xlsx', '.xls'], description: 'CSV/XLSX con lista de estudiantes' },
];

interface ManualStudent {
  nombre: string;
  email: string;
  rut?: string;
  telefono?: string;
}

export function IngestionPage() {
  const {
    selectedFiles,
    status,
    progress,
    errors,
    uploadLogs,
    fileResults,
    addFile,
    removeFile,
    clearAll,
    processFiles,
    resetStatus,
    clearLogs,
    loadUploadLogs,
  } = useIngestion();

  const activeCohortId = useStudentsStore((s) => s.activeCohortId);
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [manualStudents, setManualStudents] = useState<ManualStudent[]>([]);
  const [studentImporting, setStudentImporting] = useState(false);

  useEffect(() => {
    void loadUploadLogs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStudentFile = (file: File) => {
    setStudentFile(file);
    // Add to ingestion store selectedFiles so it's processed with others
    addFile('students', file);
  };

  const handleStudentFileRemove = () => {
    setStudentFile(null);
    removeFile('students');
  };

  const handleManualAdd = (data: ManualStudent) => {
    setManualStudents((prev) => [...prev, data]);
    toast.success('Estudiante agregado manualmente');
  };

  const handleManualRemove = (index: number) => {
    setManualStudents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImportManual = async () => {
    if (manualStudents.length === 0 || !activeCohortId) return;
    setStudentImporting(true);
    try {
      const allStudents = manualStudents.map((m) => {
        const result = normalizeStudentFromImport(m as never, activeCohortId);
        return result.data[0] as never;
      });
      const result = await bulkImportStudents(allStudents, { skipDuplicates: true });
      setManualStudents([]);
      toast.success(`${result.imported} estudiante(s) importado(s), ${result.skipped} omitido(s)`);
    } catch (err) {
      toast.error('Error al importar estudiantes manuales');
    } finally {
      setStudentImporting(false);
    }
  };

  const filesCount = Object.keys(selectedFiles).length + (studentFile ? 1 : 0);
  const isProcessing = status === 'parsing' || status === 'validating' || status === 'saving';

  const processingFileName = useMemo(() => {
    return Object.values(selectedFiles).map((f) => f.name).join(', ');
  }, [selectedFiles]);

  const handleProcess = async () => {
    resetStatus();
    await processFiles(activeCohortId ?? undefined);
  };

  const aggregateStats = useMemo(() => {
    if (fileResults.length === 0) return undefined;
    return {
      totalRows: fileResults.reduce((s, r) => s + r.totalRows, 0),
      validRows: fileResults.reduce((s, r) => s + r.validRows, 0),
      invalidRows: fileResults.reduce((s, r) => s + r.invalidRows, 0),
    };
  }, [fileResults]);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Carga de Datos</h1>
        <p className="mt-1 text-sm text-slate-400">
          Importa archivos CSV y XLSX con los datos de tus estudiantes.
        </p>
      </div>

      {/* Student section */}
      <Card variant="default" padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} strokeWidth={1.5} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Carga de Estudiantes</h3>
        </div>

        <StudentUploadZone
          selectedFile={studentFile}
          onFileSelected={handleStudentFile}
          onRemove={handleStudentFileRemove}
          disabled={isProcessing}
          onManualAdd={handleManualAdd}
        />

        {/* Manual student list */}
        {manualStudents.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-400">
                {manualStudents.length} estudiante(s) agregado(s) manualmente
              </p>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Upload size={14} strokeWidth={1.5} />}
                onClick={handleImportManual}
                isLoading={studentImporting}
                disabled={studentImporting || !activeCohortId}
              >
                Importar {manualStudents.length} estudiante(s)
              </Button>
            </div>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-900">
                  <tr className="border-b border-slate-800">
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Nombre</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Email</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">RUT</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Teléfono</th>
                    <th className="px-3 py-2 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {manualStudents.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="px-3 py-2 text-slate-200">{s.nombre}</td>
                      <td className="px-3 py-2 text-slate-400">{s.email}</td>
                      <td className="px-3 py-2 text-slate-400">{s.rut ?? '—'}</td>
                      <td className="px-3 py-2 text-slate-400">{s.telefono ?? '—'}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleManualRemove(i)}
                          className="text-slate-500 hover:text-rose-400 transition-colors"
                          aria-label="Remover"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      {/* Upload zones grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ZONE_CONFIG.map(({ fileType, acceptedExtensions, description }) => (
          <div key={fileType} className="flex flex-col gap-1">
            <FileUploadZone
              fileType={fileType}
              acceptedExtensions={acceptedExtensions}
              onFileSelected={(file) => addFile(fileType, file)}
              onRemove={removeFile}
              selectedFile={selectedFiles[fileType] ?? null}
              disabled={isProcessing}
            />
            <p className="text-xs text-slate-500 px-1">{description}</p>
          </div>
        ))}
      </div>

      {/* Pending files section */}
      {filesCount > 0 && (
        <Card variant="default" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HardDrive size={20} strokeWidth={1.5} className="text-sky-400" />
              <h3 className="text-sm font-semibold text-slate-200">
                Archivos Pendientes
              </h3>
              <span className="text-xs text-slate-500">({filesCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Trash2 size={14} strokeWidth={1.5} />}
                onClick={clearAll}
                disabled={isProcessing}
              >
                Limpiar todo
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Play size={16} strokeWidth={1.5} />}
                onClick={handleProcess}
                isLoading={isProcessing}
                disabled={isProcessing}
              >
                {isProcessing ? 'Procesando...' : 'Procesar Archivos'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {Object.entries(selectedFiles).map(([fileType, file]) => (
              <FilePreview
                key={fileType}
                file={file}
                fileType={fileType as FileType}
                status="pending"
                onRemove={() => removeFile(fileType as FileType)}
              />
            ))}
          </div>

          {/* Progress indicator */}
          {status !== 'idle' && (
            <div className="mt-4">
              <UploadProgress
                status={status === 'parsing' || status === 'validating' || status === 'saving' ? status : status === 'error' ? 'error' : 'success'}
                progress={progress}
                fileName={processingFileName}
                stats={aggregateStats}
                errors={errors}
                onRetry={handleProcess}
              />
            </div>
          )}
        </Card>
      )}

      {/* Upload history */}
      <Card variant="default" padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <Upload size={20} strokeWidth={1.5} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Historial de Cargas
          </h3>
        </div>
        <UploadHistory
          logs={uploadLogs}
          onClear={clearLogs}
        />
      </Card>
    </div>
  );
}
