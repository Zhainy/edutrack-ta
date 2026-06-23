import { db } from '@/shared/lib/database';
import { calculateRisk } from '@/features/risk-engine';
import type { Student, StudentStatus } from '@/entities/student';
import type { Cohort } from '@/entities/cohort';
import type { RiskOutput } from '@/features/risk-engine';

export interface StudentMetrics {
  studentId: string;
  totalHours: number;
  expectedHours: number;
  hoursPercentage: number;
  attendanceRate: number;
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  completedActivities: number;
  totalActivities: number;
  activityPercentage: number;
  riskScore: number;
  riskLevel: RiskOutput['riskLevel'];
  riskFactors: string[];
  lastActivityDate: string | null;
  daysSinceLastActivity: number;
}

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
  replacement: number;
  total: number;
}> {
  const students = cohortId
    ? await db.students.where('cohortId').equals(cohortId).toArray()
    : await db.students.toArray();
  return {
    active: students.filter((s) => s.status === 'active').length,
    dropout: students.filter((s) => s.status === 'dropout').length,
    inactive: students.filter((s) => s.status === 'inactive').length,
    replacement: students.filter((s) => s.status === 'replacement').length,
    total: students.length,
  };
}

export async function getCohorts(): Promise<Cohort[]> {
  return db.cohorts.orderBy('startDate').reverse().toArray();
}

export async function getCohortById(id: string): Promise<Cohort | undefined> {
  return db.cohorts.get(id);
}

export async function updateStudent(
  studentId: string,
  updates: Partial<Student>
): Promise<void> {
  const student = await db.students.get(studentId);
  if (!student) throw new Error('Student not found');
  await db.students.update(studentId, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function updateStudentStatus(
  studentId: string,
  status: StudentStatus
): Promise<void> {
  await updateStudent(studentId, { status });
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

export async function getStudentMetrics(
  studentId: string
): Promise<StudentMetrics> {
  const student = await db.students.get(studentId);
  if (!student) throw new Error('Student not found');

  const attendance = await db.attendance.where('studentId').equals(studentId).toArray();
  const dedication = await db.dedication.where('studentId').equals(studentId).toArray();
  const progress = await db.progress.where('studentId').equals(studentId).toArray();
  const syllabus = await db.syllabus.where('cohortId').equals(student.cohortId).toArray();

  const totalHours = dedication.reduce((sum, d) => sum + (d.hours || 0), 0);
  const today = new Date();
  const expectedHours = syllabus
    .filter(s => new Date(s.endDate) <= today)
    .reduce((sum, s) => sum + (s.expectedHours || 0), 0);
  const hoursPercentage = expectedHours > 0 ? Math.min((totalHours / expectedHours) * 100, 100) : 0;

  const presentClasses = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const totalClasses = attendance.length;
  const absentClasses = totalClasses - presentClasses;
  const attendanceRate = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 100;

  // Total unique activities from all progress records in the cohort
  const cohortStudents = await db.students.where('cohortId').equals(student.cohortId).toArray();
  const cohortStudentIds = new Set(cohortStudents.map(s => s.id));
  const allCohortProgress = await db.progress
    .filter(p => cohortStudentIds.has(p.studentId))
    .toArray();
  const uniqueActivityNames = new Set(allCohortProgress.map(p => p.activityName));
  const totalActivities = uniqueActivityNames.size || progress.length;

  const completedActivities = progress.filter(p => p.completed).length;

  const activityPercentage = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

  const risk = calculateRisk({
    student,
    attendance,
    progress,
    dedication,
    syllabus,
    referenceDate: new Date(),
    allCohortProgress,
  });

  const dates = dedication.map(d => new Date(d.date).getTime());
  const lastActivity = dates.length > 0 ? new Date(Math.max(...dates)) : null;
  const daysSinceLastActivity = lastActivity
    ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  return {
    studentId,
    totalHours: Math.round(totalHours * 10) / 10,
    expectedHours,
    hoursPercentage: Math.round(hoursPercentage * 10) / 10,
    attendanceRate: Math.round(attendanceRate * 10) / 10,
    totalClasses,
    presentClasses,
    absentClasses,
    completedActivities,
    totalActivities,
    activityPercentage: Math.round(activityPercentage * 10) / 10,
    riskScore: risk.riskScore,
    riskLevel: risk.riskLevel,
    riskFactors: risk.factors.map(f => f.description),
    lastActivityDate: lastActivity?.toISOString().split('T')[0] ?? null,
    daysSinceLastActivity,
  };
}

export async function getAllStudentMetrics(
  cohortId?: string
): Promise<(Student & { metrics: StudentMetrics })[]> {
  let students = await db.students.toArray();
  if (cohortId) {
    students = students.filter(s => s.cohortId === cohortId);
  }

  const results: (Student & { metrics: StudentMetrics })[] = [];
  for (const student of students) {
    try {
      const metrics = await getStudentMetrics(student.id);
      results.push({ ...student, metrics });
    } catch {
      console.warn(`[students-api] Skipping metrics for ${student.fullName}`);
    }
  }

  return results;
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
