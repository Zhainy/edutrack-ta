import type { ColumnMapping, FileType } from '../types';

/**
 * Default column mappings for each file type.
 * These represent the standard/expected column names.
 * When a file's columns don't match, the user can remap them
 * via the UI by selecting which source column maps to which target field.
 */
export const DEFAULT_COLUMN_MAPPINGS: Record<FileType, ColumnMapping[]> = {
  attendance: [
    { sourceColumn: 'studentId', targetField: 'studentId', required: true },
    { sourceColumn: 'date', targetField: 'date', required: true },
    { sourceColumn: 'status', targetField: 'status', required: true },
    { sourceColumn: 'notes', targetField: 'notes', required: false },
  ],
  progress: [
    { sourceColumn: 'studentId', targetField: 'studentId', required: true },
    { sourceColumn: 'activityName', targetField: 'activityName', required: true },
    { sourceColumn: 'moduleNumber', targetField: 'moduleNumber', required: false },
    { sourceColumn: 'completed', targetField: 'completed', required: false },
    { sourceColumn: 'completionDate', targetField: 'completionDate', required: false },
    { sourceColumn: 'score', targetField: 'score', required: false },
  ],
  dedication: [
    { sourceColumn: 'studentId', targetField: 'studentId', required: true },
    { sourceColumn: 'date', targetField: 'date', required: true },
    { sourceColumn: 'hours', targetField: 'hours', required: true },
    { sourceColumn: 'platform', targetField: 'platform', required: false },
  ],
  syllabus: [
    { sourceColumn: 'moduleNumber', targetField: 'moduleNumber', required: true },
    { sourceColumn: 'moduleName', targetField: 'moduleName', required: true },
    { sourceColumn: 'startDate', targetField: 'startDate', required: true },
    { sourceColumn: 'endDate', targetField: 'endDate', required: true },
    { sourceColumn: 'expectedHours', targetField: 'expectedHours', required: true },
    { sourceColumn: 'activities', targetField: 'activities', required: false },
  ],
  students: [
    { sourceColumn: 'fullName', targetField: 'fullName', required: true },
    { sourceColumn: 'email', targetField: 'email', required: true },
    { sourceColumn: 'externalId', targetField: 'externalId', required: true },
    { sourceColumn: 'enrollmentDate', targetField: 'enrollmentDate', required: true },
    { sourceColumn: 'status', targetField: 'status', required: false },
    { sourceColumn: 'tags', targetField: 'tags', required: false },
  ],
};

/**
 * Alternative column names (synonyms) for auto-detection.
 * When a file's column header matches any of these, it's mapped automatically.
 */
export const COLUMN_SYNONYMS: Record<string, string[]> = {
  studentId: ['student_id', 'alumno_id', 'studentid', 'id_alumno', 'idalumno', 'estudiante_id'],
  date: ['fecha', 'day', 'dia', 'fechadd', 'fecha_dd'],
  status: ['estado', 'state', 'asistencia', 'situacion'],
  notes: ['notas', 'note', 'observaciones', 'comentarios', 'obs', 'comments'],
  activityName: ['activity_name', 'actividad', 'nombre_actividad', 'actividad_nombre', 'task', 'tarea'],
  moduleNumber: ['module_number', 'modulo', 'module', 'mod', 'numero_modulo', 'módulo_n°', 'módulo nº', 'modulo n°'],
  completed: ['completado', 'done', 'finished', 'terminado', 'completo', 'finalizado'],
  completionDate: ['completion_date', 'fecha_completado', 'completed_at', 'fecha_fin'],
  score: ['puntaje', 'nota', 'puntos', 'grade', 'calificacion', 'puntaje'],
  hours: ['horas', 'hour', 'h', 'tiempo', 'time', 'minutos', 'dedicación al curso (minutos)', 'dedicación minutos', 'dedicacion minutos'],
  platform: ['plataforma', 'platforma', 'source', 'fuente', 'conexiones'],
  moduleName: ['module_name', 'nombre_modulo', 'modulo_nombre', 'name', 'nombre del modulo', 'nombre del módulo'],
  startDate: ['start_date', 'fecha_inicio', 'inicio', 'desde', 'from', 'date_from', 'fecha_inicio'],
  endDate: ['end_date', 'fecha_fin', 'fin', 'hasta', 'to', 'date_to', 'fecha_termino', 'fecha término'],
  expectedHours: ['expected_hours', 'horas_esperadas', 'horas_estimadas', 'estimated_hours', 'cantidad sincronicas', 'horas sincrónicas', 'horas asincronicas'],
  activities: ['actividades', 'activity_list', 'tasks', 'tareas', 'aprendizajes esperados'],
  fullName: ['full_name', 'nombre', 'name', 'nombre_completo', 'student_name', 'alumno', 'apellido', 'nombres'],
  email: ['correo', 'mail', 'email_address', 'e_mail', 'dirección de correo', 'direccion de correo'],
  externalId: ['external_id', 'id_externo', 'code', 'codigo', 'student_code', 'legajo', 'rut'],
  enrollmentDate: ['enrollment_date', 'fecha_inscripcion', 'inscripcion', 'matricula'],
  tags: ['etiquetas', 'tag', 'categorias', 'categories'],
};

/**
 * Returns the canonical target field for a given source column name,
 * or null if no match is found.
 */
export function detectField(columnName: string): string | null {
  const lower = columnName.trim().toLowerCase().replace(/[\s_-]+/g, '_');

  for (const [field, synonyms] of Object.entries(COLUMN_SYNONYMS)) {
    if (field === lower || synonyms.includes(lower)) {
      return field;
    }
  }

  return null;
}

/**
 * Returns true if the source columns can be fully auto-mapped to the
 * required target fields for the given file type.
 */
export function canAutoMap(
  sourceColumns: string[],
  fileType: FileType
): { mapped: boolean; mappings: ColumnMapping[] } {
  const required = DEFAULT_COLUMN_MAPPINGS[fileType].filter((m) => m.required);
  const mappings: ColumnMapping[] = [];

  for (const req of required) {
    const matchingSource = sourceColumns.find(
      (col) => detectField(col) === req.targetField
    );
    if (!matchingSource) {
      return { mapped: false, mappings: [] };
    }
    mappings.push({ sourceColumn: matchingSource, targetField: req.targetField, required: true });
  }

  // Add optional fields that were found
  const optional = DEFAULT_COLUMN_MAPPINGS[fileType].filter((m) => !m.required);
  for (const opt of optional) {
    const matchingSource = sourceColumns.find(
      (col) => detectField(col) === opt.targetField
    );
    if (matchingSource) {
      mappings.push({ sourceColumn: matchingSource, targetField: opt.targetField, required: false });
    }
  }

  return { mapped: true, mappings };
}
