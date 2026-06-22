import type { FileType } from '@/features/ingestion/types';

export interface UploadLog {
  id: string;
  cohortId: string;
  fileName: string;
  fileType: FileType;
  fileSize: number;
  recordsCount: number;
  status: 'success' | 'partial' | 'failed';
  warningCount?: number;
  errorCount?: number;
  errorMessage?: string;
  uploadedBy?: string;
  uploadedAt: string;
}
