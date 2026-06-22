import { db } from '@/shared/lib/database';
import type { Student } from '@/entities/student';

/**
 * Returns all students, optionally filtered by cohortId.
 */
export async function getAllStudents(cohortId?: string): Promise<Student[]> {
  if (cohortId) {
    return db.students.where('cohortId').equals(cohortId).toArray();
  }
  return db.students.toArray();
}

/**
 * Returns all students grouped by status counts.
 */
export async function getStudentStatusCounts(): Promise<{
  active: number;
  dropout: number;
  inactive: number;
  total: number;
}> {
  const students = await db.students.toArray();
  return {
    active: students.filter((s) => s.status === 'active').length,
    dropout: students.filter((s) => s.status === 'dropout').length,
    inactive: students.filter((s) => s.status === 'inactive').length,
    total: students.length,
  };
}
