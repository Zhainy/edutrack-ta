import { useEffect, useCallback } from 'react';
import { useIngestionStore } from '../model/ingestion-store';
import { toast } from '@/shared/ui/toast';
import type { FileType } from '../types';

export function useIngestion() {
  const store = useIngestionStore();

  useEffect(() => {
    store.loadUploadLogs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const processFiles = useCallback(
    async (cohortId?: string) => {
      const { selectedFiles } = useIngestionStore.getState();
      const entries = Object.entries(selectedFiles);

      if (entries.length === 0) {
        toast.warning('No hay archivos', 'Selecciona al menos un archivo para procesar.');
        return;
      }

      console.log(`[use-ingestion] Starting process for ${entries.length} file(s)`);

      try {
        await store.processFiles(cohortId);

        const { fileResults, status } = useIngestionStore.getState();
        const partialCount = fileResults.filter((r) => r.status === 'partial').length;
        const failedCount = fileResults.filter((r) => r.status === 'failed').length;

        const totalValid = fileResults.reduce((sum, r) => sum + r.validRows, 0);
        const totalRows = fileResults.reduce((sum, r) => sum + r.totalRows, 0);

        if (status === 'success') {
          toast.success(
            `${totalValid} registros cargados correctamente`,
            `Se procesaron ${fileResults.length} archivo(s) sin errores.`
          );
        } else if (partialCount > 0) {
          toast.warning(
            `${totalValid} de ${totalRows} registros cargados`,
            `${fileResults.reduce((s, r) => s + r.invalidRows, 0)} tuvieron errores.`
          );
        }

        if (failedCount > 0) {
          const failedFiles = fileResults
            .filter((r) => r.status === 'failed')
            .map((r) => r.fileName)
            .join(', ');
          toast.error(
            `Error en ${failedCount} archivo(s)`,
            `No se pudieron procesar: ${failedFiles}`
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido';
        console.error('[use-ingestion] Process error:', message);
        toast.error('Error al procesar archivos', message);
      }
    },
    [store]
  );

  const addFile = useCallback(
    (type: FileType, file: File) => {
      store.addFile(type, file);
    },
    [store]
  );

  const removeFile = useCallback(
    (type: FileType) => {
      store.removeFile(type);
    },
    [store]
  );

  const clearAll = useCallback(() => {
    store.clearAll();
  }, [store]);

  const resetStatus = useCallback(() => {
    store.resetStatus();
  }, [store]);

  const clearLogs = useCallback(async () => {
    await store.clearLogs();
    toast.success('Historial limpiado');
  }, [store]);

  return {
    selectedFiles: store.selectedFiles,
    status: store.status,
    currentFileType: store.currentFileType,
    progress: store.progress,
    errors: store.errors,
    uploadLogs: store.uploadLogs,
    fileResults: store.fileResults,

    addFile,
    removeFile,
    clearAll,
    processFiles,
    resetStatus,
    clearLogs,
    loadUploadLogs: store.loadUploadLogs,
  };
}
