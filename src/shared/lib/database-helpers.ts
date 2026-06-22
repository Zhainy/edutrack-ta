import { db } from './database';
import type { Student } from '@/entities/student';
import type { AttendanceRecord } from '@/entities/attendance';
import type { ProgressRecord } from '@/entities/progress';
import type { DedicationRecord } from '@/entities/dedication';
import type { Note } from '@/entities/note';
import type { SyllabusModule } from '@/entities/syllabus';
import type { Cohort } from '@/entities/cohort';

// ── Cohorts ──────────────────────────────────────────────────────────────────

export async function getAllCohorts(): Promise<Cohort[]> {
  return db.cohorts.orderBy('startDate').reverse().toArray();
}

export async function getCohortById(id: string): Promise<Cohort | undefined> {
  return db.cohorts.get(id);
}

export async function upsertCohort(cohort: Cohort): Promise<void> {
  await db.cohorts.put(cohort);
}

// ── Students ──────────────────────────────────────────────────────────────────

export async function getAllStudents(cohortId?: string): Promise<Student[]> {
  if (cohortId) {
    return db.students.where('cohortId').equals(cohortId).toArray();
  }
  return db.students.toArray();
}

export async function getStudentById(id: string): Promise<Student | undefined> {
  return db.students.get(id);
}

export async function upsertStudent(student: Student): Promise<void> {
  await db.students.put(student);
}

export async function bulkUpsertStudents(students: Student[]): Promise<void> {
  await db.students.bulkPut(students);
}

export async function updateStudentStatus(
  id: string,
  status: Student['status']
): Promise<void> {
  await db.students.update(id, { status, updatedAt: new Date().toISOString() });
}

export async function updateStudentTags(id: string, tags: string[]): Promise<void> {
  await db.students.update(id, { tags, updatedAt: new Date().toISOString() });
}

// ── Attendance ────────────────────────────────────────────────────────────────

export async function getAttendanceByStudent(
  studentId: string
): Promise<AttendanceRecord[]> {
  return db.attendance.where('studentId').equals(studentId).sortBy('date');
}

export async function bulkUpsertAttendance(records: AttendanceRecord[]): Promise<void> {
  await db.attendance.bulkPut(records);
}

// ── Progress ──────────────────────────────────────────────────────────────────

export async function getProgressByStudent(studentId: string): Promise<ProgressRecord[]> {
  return db.progress.where('studentId').equals(studentId).toArray();
}

export async function bulkUpsertProgress(records: ProgressRecord[]): Promise<void> {
  await db.progress.bulkPut(records);
}

// ── Dedication ────────────────────────────────────────────────────────────────

export async function getDedicationByStudent(
  studentId: string
): Promise<DedicationRecord[]> {
  return db.dedication.where('studentId').equals(studentId).sortBy('date');
}

export async function bulkUpsertDedication(records: DedicationRecord[]): Promise<void> {
  await db.dedication.bulkPut(records);
}

// ── Syllabus ──────────────────────────────────────────────────────────────────

export async function getSyllabusByCohort(cohortId: string): Promise<SyllabusModule[]> {
  return db.syllabus
    .where('cohortId')
    .equals(cohortId)
    .sortBy('moduleNumber');
}

export async function bulkUpsertSyllabus(modules: SyllabusModule[]): Promise<void> {
  await db.syllabus.bulkPut(modules);
}

/**
 * Returns the cumulative expected hours for a cohort up to a given reference date.
 * Only modules whose endDate is <= referenceDate are counted.
 */
export async function getExpectedHoursUntil(
  referenceDate: Date,
  cohortId: string
): Promise<number> {
  const modules = await getSyllabusByCohort(cohortId);
  return modules
    .filter((m) => new Date(m.endDate) <= referenceDate)
    .reduce((sum, m) => sum + m.expectedHours, 0);
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export async function getNotesByStudent(studentId: string): Promise<Note[]> {
  return db.notes
    .where('studentId')
    .equals(studentId)
    .reverse()
    .sortBy('createdAt');
}

export async function upsertNote(note: Note): Promise<void> {
  await db.notes.put(note);
}

export async function deleteNote(id: string): Promise<void> {
  await db.notes.delete(id);
}

export async function markNoteCompleted(id: string): Promise<void> {
  await db.notes.update(id, {
    isCompleted: true,
    completedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
