import { useState, useCallback } from 'react';
import { Upload, HardDrive, Trash2, Play } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { FileUploadZone } from '@/features/ingestion/ui/file-upload-zone';
import { FilePreview } from '@/features/ingestion/ui/file-preview';
import { UploadProgress } from '@/features/ingestion/ui/upload-progress';
import { UploadHistory } from '@/features/ingestion/ui/upload-history';
import type { FileType, UploadLog } from '@/features/ingestion/types';

interface SelectedFile {
  file: File;
  fileType: FileType;
}

const ZONE_CONFIG: { fileType: FileType; acceptedExtensions: string[] }[] = [
  { fileType: 'attendance', acceptedExtensions: ['.csv'] },
  { fileType: 'progress', acceptedExtensions: ['.csv'] },
  { fileType: 'dedication', acceptedExtensions: ['.xlsx', '.xls'] },
  { fileType: 'syllabus', acceptedExtensions: ['.csv'] },
];

const MOCK_LOGS: UploadLog[] = [
  {
    id: 'log-1',
    cohortId: 'coh-1',
    fileName: 'asistencia-marzo-2026.csv',
    fileType: 'attendance',
    fileSize: 24580,
    recordsCount: 120,
    status: 'success',
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'log-2',
    cohortId: 'coh-1',
    fileName: 'progreso-modulo-2.csv',
    fileType: 'progress',
    fileSize: 15320,
    recordsCount: 85,
    status: 'success',
    uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'log-3',
    cohortId: 'coh-1',
    fileName: 'dedicacion-semanal.xlsx',
    fileType: 'dedication',
    fileSize: 44800,
    recordsCount: 190,
    status: 'partial',
    warningCount: 3,
    errorCount: 2,
    uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export function IngestionPage() {
  const [selectedFiles, setSelectedFiles] = useState<Record<string, SelectedFile>>({});
  const [processing, setProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'parsing' | 'validating' | 'saving' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [logs, setLogs] = useState<UploadLog[]>(MOCK_LOGS);

  const filesCount = Object.keys(selectedFiles).length;

  const handleFileSelected = useCallback((fileType: FileType, file: File) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [fileType]: { file, fileType },
    }));
  }, []);

  const handleRemove = useCallback((fileType: FileType) => {
    setSelectedFiles((prev) => {
      const next = { ...prev };
      delete next[fileType];
      return next;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedFiles({});
  }, []);

  const handleProcess = useCallback(async () => {
    setProcessing(true);
    setUploadStatus('idle');
    setUploadProgress(0);

    // Simulate processing — sub-feature 3 will implement real logic
    setUploadStatus('parsing');
    await delay(1000);
    setUploadProgress(30);

    setUploadStatus('validating');
    await delay(800);
    setUploadProgress(60);

    setUploadStatus('saving');
    await delay(1200);
    setUploadProgress(100);

    const now = new Date().toISOString();
    const newLogs: UploadLog[] = Object.entries(selectedFiles).map(([ft, sf]) => ({
      id: `log-${Date.now()}-${ft}`,
      cohortId: 'coh-1',
      fileName: sf.file.name,
      fileType: ft as FileType,
      fileSize: sf.file.size,
      recordsCount: 0,
      status: 'success' as const,
      uploadedAt: now,
    }));

    setLogs((prev) => [...newLogs, ...prev]);
    setUploadStatus('success');
    setProcessing(false);
  }, [selectedFiles]);

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
            onFileSelected={(file) => handleFileSelected(fileType, file)}
            onRemove={handleRemove}
            selectedFile={selectedFiles[fileType]?.file ?? null}
            disabled={processing}
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
                onClick={handleClearAll}
                disabled={processing}
              >
                Limpiar todo
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Play size={16} strokeWidth={1.5} />}
                onClick={handleProcess}
                isLoading={processing}
              >
                Procesar Archivos
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {Object.values(selectedFiles).map(({ file, fileType }) => (
              <FilePreview
                key={fileType}
                file={file}
                fileType={fileType}
                status="pending"
                onRemove={() => handleRemove(fileType)}
              />
            ))}
          </div>

          {/* Progress indicator */}
          <div className="mt-4">
            <UploadProgress
              status={uploadStatus}
              progress={uploadProgress}
              fileName={Object.values(selectedFiles).map((sf) => sf.file.name).join(', ')}
              errors={undefined}
            />
          </div>
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
          logs={logs}
          onClear={() => setLogs([])}
        />
      </Card>
    </div>
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
