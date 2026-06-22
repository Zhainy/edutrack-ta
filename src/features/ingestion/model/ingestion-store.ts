import { create } from 'zustand';
import { detectFileType, parseCsv, parseXlsx, parseStudentCSV, parseStudentXLSX } from '../lib';
import { DEFAULT_COLUMN_MAPPINGS } from '../config/column-mappings';
import {
  RawAttendanceSchema,
  RawProgressSchema,
  RawDedicationSchema,
  RawSyllabusSchema,
  RawStudentImportSchema,
} from '@/shared/lib/validators';
import { normalizeAttendance, normalizeProgress, normalizeDedication, normalizeSyllabus, normalizeStudentFromImport } from '../lib/normalizer';
import {
  bulkUpsertAttendance,
  bulkUpsertProgress,
  bulkUpsertDedication,
  bulkUpsertSyllabus,
  addUploadLog,
  getUploadLogs,
  clearUploadLogs,
} from '../api/ingestion-api';
import { bulkImportStudents } from '@/features/students';
import type { FileType, ValidationError, ParseResult } from '../types';
import type { UploadLog } from '@/entities/upload-log';

type ProcessStatus = 'idle' | 'parsing' | 'validating' | 'saving' | 'success' | 'error';

interface FileResult {
  fileType: FileType;
  fileName: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  savedCount: number;
  status: 'success' | 'partial' | 'failed';
  errorMessage?: string;
}

interface IngestionState {
  selectedFiles: Record<string, File>;
  status: ProcessStatus;
  currentFileType: FileType | null;
  progress: number;
  lastResult: ParseResult<unknown> | null;
  errors: ValidationError[];
  uploadLogs: UploadLog[];
  fileResults: FileResult[];

  addFile: (type: FileType, file: File) => void;
  removeFile: (type: FileType) => void;
  clearAll: () => void;
  processFiles: (cohortId?: string) => Promise<void>;
  resetStatus: () => void;
  loadUploadLogs: () => Promise<void>;
  clearLogs: () => Promise<void>;
}

export const useIngestionStore = create<IngestionState>((set, get) => ({
  selectedFiles: {},
  status: 'idle',
  currentFileType: null,
  progress: 0,
  lastResult: null,
  errors: [],
  uploadLogs: [],
  fileResults: [],

  addFile: (type, file) => {
    set((state) => ({
      selectedFiles: { ...state.selectedFiles, [type]: file },
    }));
  },

  removeFile: (type) => {
    set((state) => {
      const next = { ...state.selectedFiles };
      delete next[type];
      return { selectedFiles: next };
    });
  },

  clearAll: () => {
    set({ selectedFiles: {}, status: 'idle', progress: 0, errors: [], fileResults: [], lastResult: null });
  },

  resetStatus: () => {
    set({ status: 'idle', progress: 0, errors: [], fileResults: [], lastResult: null });
  },

  processFiles: async (cohortId = 'coh-1') => {
    const { selectedFiles } = get();
    const entries = Object.entries(selectedFiles);
    if (entries.length === 0) return;

    set({ status: 'parsing', progress: 0, errors: [], fileResults: [], lastResult: null });
    console.log(`[ingestion-store] Starting process for ${entries.length} file(s)`);

    const fileResults: FileResult[] = [];
    const allErrors: ValidationError[] = [];
    const totalSteps = entries.length;
    let anyFailed = false;

    for (let i = 0; i < entries.length; i++) {
      const [fileTypeStr, file] = entries[i];
      const fileType = fileTypeStr as FileType;

      set({ currentFileType: fileType });

      try {
        // 1. Detect format
        const format = detectFileType(file.name);
        if (!format) {
          fileResults.push({
            fileType,
            fileName: file.name,
            totalRows: 0,
            validRows: 0,
            invalidRows: 0,
            savedCount: 0,
            status: 'failed',
            errorMessage: `Formato de archivo no soportado: ${file.name}`,
          });
          anyFailed = true;
          continue;
        }

        console.log(`[ingestion-store] Processing ${fileType} (${format}): ${file.name}`);

        // 2. Parse
        let parseResult: ParseResult<Record<string, string>>;

        if (fileType === 'students') {
          const result = format === 'csv'
            ? await parseStudentCSV(file)
            : await parseStudentXLSX(file);
          parseResult = result as unknown as ParseResult<Record<string, string>>;
        } else {
          const mappings = DEFAULT_COLUMN_MAPPINGS[fileType as keyof typeof DEFAULT_COLUMN_MAPPINGS] ?? [];
          parseResult = format === 'csv'
            ? await parseCsv({ file, mappings })
            : await parseXlsx({ file, mappings });
        }

        if (parseResult.data.length === 0 && parseResult.errors.length > 0) {
          fileResults.push({
            fileType,
            fileName: file.name,
            totalRows: 0,
            validRows: 0,
            invalidRows: 0,
            savedCount: 0,
            status: 'failed',
            errorMessage: parseResult.errors[0]?.message ?? 'Error al parsear archivo',
          });
          allErrors.push(...parseResult.errors);
          anyFailed = true;
          continue;
        }

        // 3. Validate + normalize per file type
        set({ status: 'validating' });
        const rawRows = parseResult.data;

        const schemaMap: Partial<Record<FileType, import('zod').ZodSchema>> = {
          attendance: RawAttendanceSchema,
          progress: RawProgressSchema,
          dedication: RawDedicationSchema,
          syllabus: RawSyllabusSchema,
          students: RawStudentImportSchema,
        };

        const normalizerMap: Partial<Record<FileType, (input: Record<string, unknown>) => { data: unknown[]; errors: ValidationError[] }>> = {
          attendance: (input) => normalizeAttendance(input as never),
          progress: (input) => normalizeProgress(input as never),
          dedication: (input) => normalizeDedication(input as never),
          syllabus: (input) => normalizeSyllabus(input as never),
          students: (input) => {
            const raw = input.raw as Record<string, string>;
            const cohortId = input.cohortId as string;
            const result = normalizeStudentFromImport(raw as never, cohortId);
            return { data: result.data as unknown[], errors: result.errors };
          },
        };

        const bulkUpsertMap: Partial<Record<FileType, (data: unknown[]) => Promise<number>>> = {
          attendance: bulkUpsertAttendance as (data: unknown[]) => Promise<number>,
          progress: bulkUpsertProgress as (data: unknown[]) => Promise<number>,
          dedication: bulkUpsertDedication as (data: unknown[]) => Promise<number>,
          syllabus: bulkUpsertSyllabus as (data: unknown[]) => Promise<number>,
          students: (async (data: unknown[]) => {
            const result = await bulkImportStudents(data as never, { skipDuplicates: true });
            return result.imported;
          }) as (data: unknown[]) => Promise<number>,
        };

        const schema = schemaMap[fileType];
        const normalizer = normalizerMap[fileType];
        const bulkUpsert = bulkUpsertMap[fileType];

        if (!schema || !normalizer || !bulkUpsert) {
          fileResults.push({
            fileType,
            fileName: file.name,
            totalRows: rawRows.length,
            validRows: 0,
            invalidRows: rawRows.length,
            savedCount: 0,
            status: 'failed',
            errorMessage: `Tipo de archivo no soportado: ${fileType}`,
          });
          anyFailed = true;
          continue;
        }

        // Validate each raw row with Zod
        const validRawRows: Record<string, string>[] = [];
        const fileErrors: ValidationError[] = [];

        for (let r = 0; r < rawRows.length; r++) {
          const result = schema.safeParse(rawRows[r]);
          if (result.success) {
            validRawRows.push(result.data as unknown as Record<string, string>);
          } else {
            for (const issue of result.error.issues) {
              fileErrors.push({
                row: r + 2,
                column: issue.path.join('.'),
                message: issue.message,
                value: issue.path.length > 0 ? rawRows[r][issue.path[0] as string] : undefined,
              });
            }
          }
        }

        // Normalize
        set({ status: 'saving' });
        const normalizedItems: unknown[] = [];
        const normalizeErrors: ValidationError[] = [];

        for (let r = 0; r < validRawRows.length; r++) {
          const needsCohortId = fileType === 'syllabus' || fileType === 'students';
          const input = needsCohortId
            ? { raw: validRawRows[r], index: r + 2, cohortId }
            : { raw: validRawRows[r], index: r + 2 };
          const normResult = normalizer(input);
          normalizedItems.push(...normResult.data);
          normalizeErrors.push(...normResult.errors);
        }

        const allFileErrors = [...fileErrors, ...normalizeErrors];
        allErrors.push(...allFileErrors);

        // Save to IndexedDB
        const savedCount = normalizedItems.length > 0 ? await bulkUpsert(normalizedItems) : 0;

        const invalidRows = allFileErrors.length;
        const fileStatus: 'success' | 'partial' | 'failed' =
          savedCount > 0 && invalidRows === 0
            ? 'success'
            : savedCount > 0
              ? 'partial'
              : 'failed';

        fileResults.push({
          fileType,
          fileName: file.name,
          totalRows: rawRows.length,
          validRows: savedCount,
          invalidRows,
          savedCount,
          status: fileStatus,
        });

        if (fileStatus === 'failed') anyFailed = true;

        console.log(`[ingestion-store] ${fileType}: ${savedCount} saved, ${invalidRows} errors`);

        // Log to upload_logs
        const now = new Date().toISOString();
        const uploadLog: UploadLog = {
          id: `upl-${Date.now()}-${fileType}`,
          cohortId,
          fileName: file.name,
          fileType,
          fileSize: file.size,
          recordsCount: savedCount,
          status: fileStatus,
          warningCount: fileStatus === 'partial' ? invalidRows : undefined,
          errorCount: fileStatus === 'failed' ? invalidRows : undefined,
          errorMessage: fileStatus === 'failed' ? allFileErrors[0]?.message : undefined,
          uploadedAt: now,
        };
        await addUploadLog(uploadLog);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido';
        console.error(`[ingestion-store] Error processing ${fileType}:`, message);
        fileResults.push({
          fileType,
          fileName: file.name,
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
          savedCount: 0,
          status: 'failed',
          errorMessage: message,
        });
        anyFailed = true;
      }

      // Update progress
      const pct = Math.round(((i + 1) / totalSteps) * 100);
      set({ progress: pct });
    }

    const overallStatus: ProcessStatus = anyFailed ? 'error' : 'success';
    set({
      status: overallStatus,
      errors: allErrors,
      fileResults,
      currentFileType: null,
      progress: 100,
    });

    // Refresh logs
    await get().loadUploadLogs();

    console.log(`[ingestion-store] Done. Status: ${overallStatus}`);
  },

  loadUploadLogs: async () => {
    try {
      const logs = await getUploadLogs();
      set({ uploadLogs: logs });
    } catch (err) {
      console.error('[ingestion-store] Error loading upload logs:', err);
    }
  },

  clearLogs: async () => {
    await clearUploadLogs();
    set({ uploadLogs: [] });
  },
}));
