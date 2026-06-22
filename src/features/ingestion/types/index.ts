import type { Student } from '@/entities/student';
import type { AttendanceRecord } from '@/entities/attendance';
import type { ProgressRecord } from '@/entities/progress';
import type { DedicationRecord } from '@/entities/dedication';
import type { SyllabusModule } from '@/entities/syllabus';

// ── Row types (parsed but not yet normalized) ────────────────────────────

export interface RawRow {
  [column: string]: string;
}

// ── Validation / Parse errors ───────────────────────────────────────────

export interface ValidationError {
  row: number;
  column: string;
  message: string;
  value: unknown;
}

// ── Parse result ─────────────────────────────────────────────────────────

export interface ParseResult<T> {
  success: boolean;
  data: T[];
  errors: ValidationError[];
  warnings: string[];
  stats: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
  };
}

// ── Normalized entity results ────────────────────────────────────────────

export type NormalizedStudent = Partial<Student> & { id: string; cohortId: string };
export type NormalizedAttendance = Partial<AttendanceRecord> & { id: string; studentId: string };
export type NormalizedProgress = Partial<ProgressRecord> & { id: string; studentId: string; activityName: string };
export type NormalizedDedication = Partial<DedicationRecord> & { id: string; studentId: string };
export type NormalizedSyllabus = Partial<SyllabusModule> & { id: string; cohortId: string; moduleNumber: number };

// ── File metadata ────────────────────────────────────────────────────────

export type FileType = 'attendance' | 'progress' | 'dedication' | 'syllabus' | 'students';

export type UploadStatus = 'success' | 'partial' | 'failed';

export interface UploadLog {
  id: string;
  cohortId: string;
  fileName: string;
  fileType: FileType;
  fileSize: number;
  recordsCount: number;
  status: UploadStatus;
  warningCount?: number;
  errorCount?: number;
  errorMessage?: string;
  uploadedBy?: string;
  uploadedAt: string;
}

// ── Column mapping ───────────────────────────────────────────────────────

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  required: boolean;
}
