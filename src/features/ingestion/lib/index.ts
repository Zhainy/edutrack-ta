export { parseCsv } from './csv-parser';
export type { CsvParseOptions } from './csv-parser';

export { parseXlsx, getSheetNames } from './xlsx-parser';
export type { XlsxParseOptions } from './xlsx-parser';

export { parseStudentCSV, parseStudentXLSX } from './student-parser';
export type { RawStudentImport } from './student-parser';

export { detectFileType } from './detect-file-type';

export {
  normalizeDate,
  normalizeAttendanceStatus,
  normalizeHours,
  normalizeBoolean,
  normalizeTags,
  normalizeEmail,
  normalizeActivities,
  normalizeStudent,
  normalizeAttendance,
  normalizeProgress,
  normalizeDedication,
  normalizeSyllabus,
  normalizeRUT,
  normalizeName,
  normalizeStudentFromImport,
} from './normalizer';
export type {
  NormalizeStudentInput,
  NormalizeAttendanceInput,
  NormalizeProgressInput,
  NormalizeDedicationInput,
  NormalizeSyllabusInput,
} from './normalizer';
