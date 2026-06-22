import { parse, format } from 'date-fns';
import type { ValidationError } from '../types';
import type { Student } from '@/entities/student';
import type { AttendanceRecord } from '@/entities/attendance';
import type { ProgressRecord } from '@/entities/progress';
import type { DedicationRecord } from '@/entities/dedication';
import type { SyllabusModule } from '@/entities/syllabus';
import type {
  RawStudent,
  RawAttendance,
  RawProgress,
  RawDedication,
  RawSyllabus,
} from '@/shared/lib/validators';

// ── Date normalizer ───────────────────────────────────────────────────────

const DATE_FORMATS = [
  'yyyy-MM-dd',
  'dd/MM/yyyy',
  'MM/dd/yyyy',
  'yyyy/MM/dd',
  'dd-MM-yyyy',
  'MM-dd-yyyy',
  'dd.MM.yyyy',
  'yyyy.MM.dd',
  'dd MMM yyyy',
  'dd MMMM yyyy',
];

export function normalizeDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  for (const fmt of DATE_FORMATS) {
    try {
      const parsed = parse(trimmed, fmt, new Date());
      if (!isNaN(parsed.getTime())) {
        return format(parsed, 'yyyy-MM-dd');
      }
    } catch {
      continue;
    }
  }

  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return format(d, 'yyyy-MM-dd');
    }
  } catch {
    // ignore
  }

  return null;
}

// ── Attendance status mapper ──────────────────────────────────────────────

const STATUS_MAP: Record<string, AttendanceRecord['status']> = {
  present: 'present',
  presente: 'present',
  p: 'present',
  asistio: 'present',
  absent: 'absent',
  ausente: 'absent',
  a: 'absent',
  falta: 'absent',
  late: 'late',
  tarde: 'late',
  l: 'late',
  retraso: 'late',
  excused: 'excused',
  justificado: 'excused',
  e: 'excused',
  justificada: 'excused',
};

export function normalizeAttendanceStatus(value: string): AttendanceRecord['status'] {
  const lower = value.trim().toLowerCase();
  return STATUS_MAP[lower] ?? 'present';
}

// ── Hours normalizer ──────────────────────────────────────────────────────

export function normalizeHours(value: string): number {
  const raw = parseFloat(value.trim().replace(',', '.'));
  if (isNaN(raw) || raw < 0) return 0;
  return parseFloat(raw.toFixed(2));
}

// ── Boolean normalizer ────────────────────────────────────────────────────

export function normalizeBoolean(value: string): boolean {
  const lower = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'sí', 'si', 'y', 'completado', 'completo', 'done', 'finished'].includes(lower)) {
    return true;
  }
  if (['false', '0', 'no', 'n', 'not', 'incomplete', 'pendiente'].includes(lower)) {
    return false;
  }
  return value.trim().length > 0;
}

// ── Tags normalizer ───────────────────────────────────────────────────────

export function normalizeTags(value: string): string[] {
  return value
    .split(/[,;]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

// ── Email normalizer ──────────────────────────────────────────────────────

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

// ── Activities normalizer ─────────────────────────────────────────────────

export function normalizeActivities(value: string): string[] {
  return value
    .split(/[,;|\n]/)
    .map((a) => a.trim())
    .filter(Boolean);
}

// ── Advanced: normalize + validate in one pass ────────────────────────────

interface NormalizeResult<T> {
  data: T[];
  errors: ValidationError[];
}

// ── Student normalizer ────────────────────────────────────────────────────

export interface NormalizeStudentInput {
  raw: RawStudent;
  index: number;
  cohortId: string;
}

export function normalizeStudent(
  input: NormalizeStudentInput
): NormalizeResult<Partial<Student>> {
  const { raw, cohortId } = input;
  const errors: ValidationError[] = [];
  const now = new Date().toISOString();

  console.log(`[normalizer] Normalizando estudiante fila ${input.index}: ${raw.fullName}`);

  const enrollmentDate = normalizeDate(raw.enrollmentDate || '');
  if (!enrollmentDate) {
    errors.push({
      row: input.index,
      column: 'enrollmentDate',
      message: 'Fecha de inscripción inválida',
      value: raw.enrollmentDate,
    });
  }

  if (!raw.fullName.trim()) {
    errors.push({
      row: input.index,
      column: 'fullName',
      message: 'Nombre completo requerido',
      value: raw.fullName,
    });
  }

  const result: Partial<Student> = {
    id: crypto.randomUUID(),
    cohortId,
    externalId: raw.externalId.trim(),
    fullName: raw.fullName.trim(),
    email: raw.email ? normalizeEmail(raw.email) : undefined,
    status: 'active',
    enrollmentDate: enrollmentDate ?? '',
    tags: raw.tags ? normalizeTags(raw.tags) : [],
    metadata: {},
    createdAt: now,
    updatedAt: now,
  };

  if (raw.status && raw.status.trim()) {
    const status = raw.status.trim().toLowerCase();
    if (['active', 'dropout', 'inactive'].includes(status)) {
      result.status = status as Student['status'];
    } else {
      errors.push({
        row: input.index,
        column: 'status',
        message: `Estado "${raw.status}" no válido. Usar: active, dropout, inactive`,
        value: raw.status,
      });
    }
  }

  return { data: [result], errors };
}

// ── Attendance normalizer ─────────────────────────────────────────────────

export interface NormalizeAttendanceInput {
  raw: RawAttendance;
  index: number;
}

export function normalizeAttendance(
  input: NormalizeAttendanceInput
): NormalizeResult<Partial<AttendanceRecord>> {
  const { raw } = input;
  const errors: ValidationError[] = [];

  const date = normalizeDate(raw.date);
  if (!date) {
    errors.push({
      row: input.index,
      column: 'date',
      message: 'Fecha inválida',
      value: raw.date,
    });
  }

  if (!raw.studentId.trim()) {
    errors.push({
      row: input.index,
      column: 'studentId',
      message: 'ID de estudiante requerido',
      value: raw.studentId,
    });
  }

  const result: Partial<AttendanceRecord> = {
    id: crypto.randomUUID(),
    studentId: raw.studentId.trim(),
    date: date ?? '',
    status: normalizeAttendanceStatus(raw.status),
    notes: raw.notes?.trim() || undefined,
    uploadedAt: new Date().toISOString(),
  };

  return { data: [result], errors };
}

// ── Progress normalizer ───────────────────────────────────────────────────

export interface NormalizeProgressInput {
  raw: RawProgress;
  index: number;
}

export function normalizeProgress(
  input: NormalizeProgressInput
): NormalizeResult<Partial<ProgressRecord>> {
  const { raw } = input;
  const errors: ValidationError[] = [];

  const completionDate = raw.completionDate
    ? (normalizeDate(raw.completionDate) ?? undefined)
    : undefined;

  if (raw.completionDate && !completionDate) {
    errors.push({
      row: input.index,
      column: 'completionDate',
      message: 'Fecha de completitud inválida',
      value: raw.completionDate,
    });
  }

  let score: number | undefined;
  if (raw.score && raw.score.trim()) {
    score = parseFloat(raw.score.trim().replace(',', '.'));
    if (isNaN(score) || score < 0 || score > 100) {
      errors.push({
        row: input.index,
        column: 'score',
        message: 'Score debe ser un número entre 0 y 100',
        value: raw.score,
      });
      score = undefined;
    }
  }

  let moduleNumber: number | undefined;
  if (raw.moduleNumber && raw.moduleNumber.trim()) {
    moduleNumber = parseInt(raw.moduleNumber.trim(), 10);
    if (isNaN(moduleNumber) || moduleNumber < 1) {
      errors.push({
        row: input.index,
        column: 'moduleNumber',
        message: 'Número de módulo inválido',
        value: raw.moduleNumber,
      });
      moduleNumber = undefined;
    }
  }

  const completed = raw.completed ? normalizeBoolean(raw.completed) : false;

  if (!raw.activityName.trim()) {
    errors.push({
      row: input.index,
      column: 'activityName',
      message: 'Nombre de actividad requerido',
      value: raw.activityName,
    });
  }

  if (!raw.studentId.trim()) {
    errors.push({
      row: input.index,
      column: 'studentId',
      message: 'ID de estudiante requerido',
      value: raw.studentId,
    });
  }

  const result: Partial<ProgressRecord> = {
    id: crypto.randomUUID(),
    studentId: raw.studentId.trim(),
    activityName: raw.activityName.trim(),
    moduleNumber,
    completed,
    completionDate,
    score,
    uploadedAt: new Date().toISOString(),
  };

  return { data: [result], errors };
}

// ── Dedication normalizer ─────────────────────────────────────────────────

export interface NormalizeDedicationInput {
  raw: RawDedication;
  index: number;
}

export function normalizeDedication(
  input: NormalizeDedicationInput
): NormalizeResult<Partial<DedicationRecord>> {
  const { raw } = input;
  const errors: ValidationError[] = [];

  const date = normalizeDate(raw.date);
  if (!date) {
    errors.push({
      row: input.index,
      column: 'date',
      message: 'Fecha inválida',
      value: raw.date,
    });
  }

  if (!raw.studentId.trim()) {
    errors.push({
      row: input.index,
      column: 'studentId',
      message: 'ID de estudiante requerido',
      value: raw.studentId,
    });
  }

  const hours = normalizeHours(raw.hours);

  const result: Partial<DedicationRecord> = {
    id: crypto.randomUUID(),
    studentId: raw.studentId.trim(),
    date: date ?? '',
    hours,
    platform: raw.platform?.trim() || 'main',
    uploadedAt: new Date().toISOString(),
  };

  return { data: [result], errors };
}

// ── Syllabus normalizer ───────────────────────────────────────────────────

export interface NormalizeSyllabusInput {
  raw: RawSyllabus;
  index: number;
  cohortId: string;
}

export function normalizeSyllabus(
  input: NormalizeSyllabusInput
): NormalizeResult<Partial<SyllabusModule>> {
  const { raw, cohortId } = input;
  const errors: ValidationError[] = [];

  const startDate = normalizeDate(raw.startDate);
  if (!startDate) {
    errors.push({
      row: input.index,
      column: 'startDate',
      message: 'Fecha de inicio inválida',
      value: raw.startDate,
    });
  }

  const endDate = normalizeDate(raw.endDate);
  if (!endDate) {
    errors.push({
      row: input.index,
      column: 'endDate',
      message: 'Fecha de fin inválida',
      value: raw.endDate,
    });
  }

  const moduleNumber = parseInt(raw.moduleNumber.trim(), 10);
  if (isNaN(moduleNumber) || moduleNumber < 1) {
    errors.push({
      row: input.index,
      column: 'moduleNumber',
      message: 'Número de módulo inválido',
      value: raw.moduleNumber,
    });
  }

  const expectedHours = normalizeHours(raw.expectedHours);

  if (!raw.moduleName.trim()) {
    errors.push({
      row: input.index,
      column: 'moduleName',
      message: 'Nombre de módulo requerido',
      value: raw.moduleName,
    });
  }

  const activities = raw.activities ? normalizeActivities(raw.activities) : [];

  const result: Partial<SyllabusModule> = {
    id: crypto.randomUUID(),
    cohortId,
    moduleNumber: isNaN(moduleNumber) ? 0 : moduleNumber,
    moduleName: raw.moduleName.trim(),
    startDate: startDate ?? '',
    endDate: endDate ?? '',
    expectedHours,
    activities,
    createdAt: new Date().toISOString(),
  };

  return { data: [result], errors };
}
