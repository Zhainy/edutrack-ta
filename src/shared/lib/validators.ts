import { z } from 'zod';
import { parse, format } from 'date-fns';

// ── Multi-format date parser ─────────────────────────────────────────────

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

function tryParseDate(value: string): string | null {
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

// ── Reusable refinements ─────────────────────────────────────────────────

const isoDate = z.string().refine(
  (v) => /^\d{4}-\d{2}-\d{2}$/.test(v),
  { message: 'Fecha debe tener formato YYYY-MM-DD' }
);

const isoDateTime = z.string().refine(
  (v) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v),
  { message: 'Fecha debe tener formato ISO datetime' }
);

// ── Student ───────────────────────────────────────────────────────────────

const StudentStatusEnum = z.enum(['active', 'dropout', 'inactive']);

export const RawStudentSchema = z.object({
  externalId: z.string().min(1, 'ID externo requerido'),
  fullName: z.string().min(1, 'Nombre requerido'),
  email: z.string().optional().default(''),
  status: z.string().optional().default('active'),
  enrollmentDate: z.string().optional().default(''),
  tags: z.string().optional().default(''),
});

export const StudentSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
  cohortId: z.string().min(1, 'Cohorte requerida'),
  externalId: z.string().min(1, 'ID externo requerido'),
  fullName: z.string().min(1, 'Nombre requerido').max(255, 'Nombre demasiado largo'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  status: StudentStatusEnum,
  enrollmentDate: isoDate,
  tags: z.array(z.string()),
  metadata: z.record(z.unknown()).optional(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
});

// ── Attendance ────────────────────────────────────────────────────────────

const AttendanceStatusEnum = z.enum(['present', 'absent', 'late', 'excused']);

export const RawAttendanceSchema = z.object({
  studentId: z.string().min(1, 'ID de estudiante requerido'),
  date: z.string().min(1, 'Fecha requerida'),
  status: z.string().min(1, 'Estado requerido'),
  notes: z.string().optional().default(''),
});

export const AttendanceSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
  studentId: z.string().min(1, 'ID de estudiante requerido'),
  date: isoDate,
  status: AttendanceStatusEnum,
  notes: z.string().optional(),
  uploadedAt: isoDateTime,
});

// ── Progress ──────────────────────────────────────────────────────────────

export const RawProgressSchema = z.object({
  studentId: z.string().min(1, 'ID de estudiante requerido'),
  activityName: z.string().min(1, 'Nombre de actividad requerido'),
  moduleNumber: z.string().optional().default(''),
  completed: z.string().optional().default(''),
  completionDate: z.string().optional().default(''),
  score: z.string().optional().default(''),
});

export const ProgressSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
  studentId: z.string().min(1, 'ID de estudiante requerido'),
  activityName: z.string().min(1, 'Nombre de actividad requerido'),
  moduleNumber: z.number().int().positive('Módulo debe ser positivo').optional(),
  completed: z.boolean(),
  completionDate: isoDate.optional(),
  score: z.number().min(0, 'Score mínimo 0').max(100, 'Score máximo 100').optional(),
  uploadedAt: isoDateTime,
});

// ── Dedication ────────────────────────────────────────────────────────────

export const RawDedicationSchema = z.object({
  studentId: z.string().min(1, 'ID de estudiante requerido'),
  date: z.string().min(1, 'Fecha requerida'),
  hours: z.string().min(1, 'Horas requeridas'),
  platform: z.string().optional().default('main'),
});

export const DedicationSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
  studentId: z.string().min(1, 'ID de estudiante requerido'),
  date: isoDate,
  hours: z.number().min(0, 'Las horas no pueden ser negativas'),
  platform: z.string().min(1, 'Plataforma requerida'),
  uploadedAt: isoDateTime,
});

// ── Syllabus ──────────────────────────────────────────────────────────────

export const RawSyllabusSchema = z.object({
  moduleNumber: z.string().min(1, 'Número de módulo requerido'),
  moduleName: z.string().min(1, 'Nombre de módulo requerido'),
  startDate: z.string().min(1, 'Fecha de inicio requerida'),
  endDate: z.string().min(1, 'Fecha de fin requerida'),
  expectedHours: z.string().min(1, 'Horas esperadas requeridas'),
  activities: z.string().optional().default(''),
});

export const SyllabusSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
  cohortId: z.string().min(1, 'Cohorte requerida'),
  moduleNumber: z.number().int().positive('Módulo debe ser positivo'),
  moduleName: z.string().min(1, 'Nombre de módulo requerido'),
  startDate: isoDate,
  endDate: isoDate,
  expectedHours: z.number().min(0, 'Horas esperadas no pueden ser negativas'),
  activities: z.array(z.string()),
  createdAt: isoDateTime,
});

// ── Validated entity pipeline ─────────────────────────────────────────────

export function validateDate(value: string): { valid: boolean; normalized: string | null; error?: string } {
  const result = tryParseDate(value);
  if (result) return { valid: true, normalized: result };
  return { valid: false, normalized: null, error: `Fecha inválida: "${value}". Formatos aceptados: YYYY-MM-DD, DD/MM/YYYY, etc.` };
}

export function validateAndParseRows<T>(
  rows: Record<string, string>[],
  schema: z.ZodSchema<T>
): { valid: T[]; errors: { row: number; field: string; message: string; value: unknown }[] } {
  const valid: T[] = [];
  const errors: { row: number; field: string; message: string; value: unknown }[] = [];

  rows.forEach((row, index) => {
    const lineNumber = index + 2;
    const result = schema.safeParse(row);
    if (result.success) {
      valid.push(result.data);
    } else {
      for (const issue of result.error.issues) {
        errors.push({
          row: lineNumber,
          field: issue.path.join('.'),
          message: issue.message,
          value: issue.path.length > 0 ? row[issue.path[0]] : undefined,
        });
      }
    }
  });

  return { valid, errors };
}

// ── Inferred raw types ───────────────────────────────────────────────────

// ── Student Import (from CSV/XLSX with Spanish headers) ──────────────────

export const RawStudentImportSchema = z.object({
  rut: z.string().optional(),
  nombre: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido').or(z.literal('')),
  telefono: z.string().optional(),
});

// ── Inferred raw types ───────────────────────────────────────────────────

export type RawStudent = z.infer<typeof RawStudentSchema>;
export type RawAttendance = z.infer<typeof RawAttendanceSchema>;
export type RawProgress = z.infer<typeof RawProgressSchema>;
export type RawDedication = z.infer<typeof RawDedicationSchema>;
export type RawSyllabus = z.infer<typeof RawSyllabusSchema>;
export type RawStudentImport = z.infer<typeof RawStudentImportSchema>;
