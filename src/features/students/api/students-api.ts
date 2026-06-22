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
