import { db } from '@/shared/lib/database';
import type { Student } from '@/entities/student';
import type { Cohort } from '@/entities/cohort';

export async function getAllStudents(cohortId?: string): Promise<Student[]> {
  if (cohortId) {
    return db.students.where('cohortId').equals(cohortId).toArray();
  }
  return db.students.toArray();
}

export async function getStudentsByCohort(cohortId: string): Promise<Student[]> {
  return db.students.where('cohortId').equals(cohortId).toArray();
}

export async function getStudentStatusCounts(
  cohortId?: string
): Promise<{
  active: number;
  dropout: number;
  inactive: number;
  total: number;
}> {
  const students = cohortId
    ? await db.students.where('cohortId').equals(cohortId).toArray()
    : await db.students.toArray();
  return {
    active: students.filter((s) => s.status === 'active').length,
    dropout: students.filter((s) => s.status === 'dropout').length,
    inactive: students.filter((s) => s.status === 'inactive').length,
    total: students.length,
  };
}

export async function getCohorts(): Promise<Cohort[]> {
  return db.cohorts.orderBy('startDate').reverse().toArray();
}

export async function getCohortById(id: string): Promise<Cohort | undefined> {
  return db.cohorts.get(id);
}

export async function deleteStudent(id: string): Promise<void> {
  await db.transaction('rw', [db.students, db.attendance, db.progress, db.dedication, db.notes], async () => {
    await db.students.delete(id);
    await db.attendance.where('studentId').equals(id).delete();
    await db.progress.where('studentId').equals(id).delete();
    await db.dedication.where('studentId').equals(id).delete();
    await db.notes.where('studentId').equals(id).delete();
  });
}

export async function bulkImportStudents(
  students: Student[],
  options?: { skipDuplicates: boolean }
): Promise<{ imported: number; skipped: number }> {
  if (students.length === 0) return { imported: 0, skipped: 0 };

  const skip = options?.skipDuplicates ?? true;
  let imported = 0;
  let skipped = 0;

  const existing = await db.students.toArray();
  const emailSet = new Set(existing.map((s) => s.email?.toLowerCase()).filter(Boolean));
  const externalIdSet = new Set(existing.map((s) => s.externalId.toLowerCase()));

  for (const student of students) {
    const isDuplicate = skip && (
      (student.email && emailSet.has(student.email.toLowerCase())) ||
      (student.externalId && externalIdSet.has(student.externalId.toLowerCase()))
    );

    if (isDuplicate) {
      skipped++;
      continue;
    }

    await db.students.put(student);

    if (student.email) emailSet.add(student.email.toLowerCase());
    if (student.externalId) externalIdSet.add(student.externalId.toLowerCase());

    imported++;
  }

  return { imported, skipped };
}
