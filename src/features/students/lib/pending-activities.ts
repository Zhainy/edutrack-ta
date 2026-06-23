import { db } from '@/shared/lib/database';
import type { SyllabusModule } from '@/entities/syllabus';

export interface PendingActivity {
  activityName: string;
  moduleName: string;
  moduleNumber: number;
  expectedDate: string;
  isOverdue: boolean;
  daysOverdue: number;
}

export async function getPendingActivities(
  studentId: string,
  referenceDate: Date = new Date()
): Promise<PendingActivity[]> {
  const student = await db.students.get(studentId);
  if (!student) return [];

  const allProgress = await db.progress
    .where('studentId')
    .equals(studentId)
    .toArray();

  const syllabus = await db.syllabus
    .where('cohortId')
    .equals(student.cohortId)
    .toArray();

  const syllabusByModule = new Map<number, SyllabusModule>();
  for (const mod of syllabus) {
    syllabusByModule.set(mod.moduleNumber, mod);
  }

  const pendingProgress = allProgress.filter(p => !p.completed);

  const pendingActivities: PendingActivity[] = [];

  for (const progress of pendingProgress) {
    const moduleInfo = syllabusByModule.get(progress.moduleNumber || 0);

    const expectedDate = progress.completionDate || moduleInfo?.endDate || '';

    const isOverdue = expectedDate !== '' && new Date(expectedDate) < referenceDate;
    const daysOverdue = isOverdue
      ? Math.floor((referenceDate.getTime() - new Date(expectedDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    pendingActivities.push({
      activityName: progress.activityName,
      moduleName: moduleInfo?.moduleName || `Módulo ${progress.moduleNumber}`,
      moduleNumber: progress.moduleNumber || 0,
      expectedDate,
      isOverdue: isOverdue || false,
      daysOverdue,
    });
  }

  const uniqueMap = new Map<string, PendingActivity>();
  for (const activity of pendingActivities) {
    const key = `${activity.moduleNumber}-${activity.activityName}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, activity);
    }
  }

  const result = Array.from(uniqueMap.values());

  result.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    if (a.isOverdue && b.isOverdue) return b.daysOverdue - a.daysOverdue;
    return new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime();
  });

  return result;
}
