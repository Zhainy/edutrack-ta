import { db } from '@/shared/lib/database';
import type { Cohort } from '@/entities/cohort';

export async function getAllCohorts(): Promise<Cohort[]> {
  return db.cohorts.orderBy('startDate').reverse().toArray();
}

export async function upsertCohort(cohort: Cohort): Promise<void> {
  await db.cohorts.put(cohort);
}

export async function deleteCohort(id: string): Promise<void> {
  await db.transaction(
    'rw',
    [db.cohorts, db.students, db.attendance, db.progress, db.dedication, db.syllabus, db.notes, db.moduleGrades],
    async () => {
      await db.cohorts.delete(id);
      const studentIds = await db.students.where('cohortId').equals(id).primaryKeys();
      await db.students.where('cohortId').equals(id).delete();
      await db.attendance.where('studentId').anyOf(studentIds).delete();
      await db.progress.where('studentId').anyOf(studentIds).delete();
      await db.dedication.where('studentId').anyOf(studentIds).delete();
      await db.notes.where('studentId').anyOf(studentIds).delete();
      await db.moduleGrades.where('studentId').anyOf(studentIds).delete();
      await db.syllabus.where('cohortId').equals(id).delete();
    }
  );
}
