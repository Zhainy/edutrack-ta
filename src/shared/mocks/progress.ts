import type { ProgressRecord } from '@/entities/progress';
import { mockStudents } from './students';
import { mockSyllabus } from './syllabus';

function buildProgressForStudent(
  studentId: string,
  completionRate: number
): ProgressRecord[] {
  const records: ProgressRecord[] = [];
  const now = new Date().toISOString();

  mockSyllabus.forEach((module) => {
    module.activities.forEach((activityName) => {
      const completed = Math.random() < completionRate;
      records.push({
        id: `prog-${studentId}-${module.id}-${activityName.replace(/\s+/g, '-').toLowerCase()}`,
        studentId,
        activityName,
        moduleNumber: module.moduleNumber,
        completed,
        completionDate: completed
          ? new Date(Date.now() - Math.random() * 30 * 86400000).toISOString().split('T')[0]
          : undefined,
        uploadedAt: now,
      });
    });
  });

  return records;
}

const progressRates: Record<string, number> = {
  's-01': 0.90,
  's-02': 0.88,
  's-03': 0.95,
  's-04': 0.85,
  's-05': 0.92,
  's-06': 0.89,
  's-07': 0.87,
  's-08': 0.70,
  's-09': 0.65,
  's-10': 0.72,
  's-11': 0.60,
  's-12': 0.40,
  's-13': 0.35,
  's-14': 0.45,
  's-15': 0.15,
  's-16': 0.10,
  's-17': 0.08,
  's-18': 0.05,
  's-19': 0.25,
  's-20': 0.20,
};

export const mockProgress: ProgressRecord[] = mockStudents.flatMap((student) => {
  const rate = progressRates[student.id] ?? 0.75;
  return buildProgressForStudent(student.id, rate);
});
