export type Format = 'csv' | 'xlsx' | null;

export function detectFileType(fileName: string): Format {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'csv') return 'csv';
  if (ext === 'xlsx' || ext === 'xls') return 'xlsx';
  return null;
}

export function detectContentType(
  fileName: string,
  headers?: string[]
): 'attendance' | 'progress' | 'dedication' | 'syllabus' | 'students' | null {
  const lower = fileName.toLowerCase();

  if (/dedicaci[oó]n|dedication/i.test(lower)) return 'dedication';
  if (/progreso|progress|actividades|avance/i.test(lower)) return 'progress';
  if (/cronograma|syllabus|planificaci[oó]n|plan/i.test(lower)) return 'syllabus';
  if (/asistenci[aá]|attendance|presente|ausente/i.test(lower)) return 'attendance';
  if (/estudiante|alumno|student/i.test(lower)) return 'students';

  if (headers && headers.length > 0) {
    const joined = headers.join(' ').toLowerCase();
    if (/dedicaci[oó]n al curso|minutos|conexiones/i.test(joined)) return 'dedication';
    if (/direcci[oó]n de correo|finalizado|no finalizado/i.test(joined)) return 'progress';
    if (/m[oó]dulo n[°º]/i.test(joined)) return 'syllabus';
    if (/asistencia|presente|ausente|justificado/i.test(joined)) return 'attendance';
  }

  return null;
}
