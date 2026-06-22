import { db } from '@/shared/lib/database';
import type { AttendanceRecord } from '@/entities/attendance';

interface ImportRow {
  date: string;
  studentName: string;
  status: string;
}

function normalizeImportStatus(raw: string): AttendanceRecord['status'] {
  const lower = raw.trim().toLowerCase();
  if (['presente', 'present', 'asistió', 'asistio', 'p'].includes(lower)) return 'present';
  if (['ausente', 'absent', 'falta', 'a', 'no asistió'].includes(lower)) return 'absent';
  if (['tarde', 'late', 'atraso', 'l', 'retraso'].includes(lower)) return 'late';
  if (['justificado', 'excused', 'justificada', 'e', 'permiso'].includes(lower)) return 'excused';
  return 'present';
}

function normalizeDate(raw: string): string | null {
  // Try DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY
  const trimmed = raw.trim();
  let parts: number[] | null = null;

  const dmy = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmy) parts = [parseInt(dmy[3]), parseInt(dmy[2]), parseInt(dmy[1])];

  const ymd = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymd) parts = [parseInt(ymd[1]), parseInt(ymd[2]), parseInt(ymd[3])];

  if (!parts) return null;
  return `${parts[0]}-${String(parts[1]).padStart(2, '0')}-${String(parts[2]).padStart(2, '0')}`;
}

export async function importAttendanceFromFile(
  rows: ImportRow[],
  cohortId: string
): Promise<{ imported: number; errors: string[] }> {
  const errors: string[] = [];
  const records: AttendanceRecord[] = [];
  const students = await db.students.where('cohortId').equals(cohortId).toArray();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const normalizedDate = normalizeDate(row.date);
    if (!normalizedDate) {
      errors.push(`Fila ${i + 1}: fecha inválida "${row.date}"`);
      continue;
    }

    const student = students.find(
      (s) => s.fullName.toLowerCase().trim() === row.studentName.toLowerCase().trim()
    );

    if (!student) {
      errors.push(`Fila ${i + 1}: estudiante no encontrado "${row.studentName}"`);
      continue;
    }

    records.push({
      id: crypto.randomUUID(),
      studentId: student.id,
      date: normalizedDate,
      status: normalizeImportStatus(row.status),
      uploadedAt: new Date().toISOString(),
    });
  }

  if (records.length > 0) {
    await db.attendance.bulkPut(records);
  }

  return { imported: records.length, errors };
}
