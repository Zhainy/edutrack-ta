import { useEffect, useMemo } from 'react';
import { Upload, HardDrive, Trash2, Play } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { FileUploadZone } from '@/features/ingestion/ui/file-upload-zone';
import { FilePreview } from '@/features/ingestion/ui/file-preview';
import { UploadProgress } from '@/features/ingestion/ui/upload-progress';
import { UploadHistory } from '@/features/ingestion/ui/upload-history';
import { useIngestion } from '@/features/ingestion/hooks/use-ingestion';
import type { FileType } from '@/features/ingestion/types';

const ZONE_CONFIG: { fileType: FileType; acceptedExtensions: string[] }[] = [
  { fileType: 'attendance', acceptedExtensions: ['.csv'] },
  { fileType: 'progress', acceptedExtensions: ['.csv'] },
  { fileType: 'dedication', acceptedExtensions: ['.xlsx', '.xls'] },
  { fileType: 'syllabus', acceptedExtensions: ['.csv'] },
];

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

  useEffect(() => {
    void loadUploadLogs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filesCount = Object.keys(selectedFiles).length;
  const isProcessing = status === 'parsing' || status === 'validating' || status === 'saving';

  const processingFileName = useMemo(() => {
    return Object.values(selectedFiles).map((f) => f.name).join(', ');
  }, [selectedFiles]);

  const handleProcess = async () => {
    resetStatus();
    await processFiles();
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

      {/* Upload zones grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ZONE_CONFIG.map(({ fileType, acceptedExtensions }) => (
          <FileUploadZone
            key={fileType}
            fileType={fileType}
            acceptedExtensions={acceptedExtensions}
            onFileSelected={(file) => addFile(fileType, file)}
            onRemove={removeFile}
            selectedFile={selectedFiles[fileType] ?? null}
            disabled={isProcessing}
          />
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
