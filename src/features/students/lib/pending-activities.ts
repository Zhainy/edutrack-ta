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

  const syllabus = await db.syllabus
    .where('cohortId')
    .equals(student.cohortId)
    .toArray();

  const progress = await db.progress
    .where('studentId')
    .equals(studentId)
    .toArray();

  const completedActivityNames = new Set(
    progress.filter(p => p.completed).map(p => p.activityName)
  );

  const pendingActivities: PendingActivity[] = [];

  for (const mod of syllabus) {
    if (new Date(mod.startDate) > referenceDate) continue;

    const activities = mod.activities || [];

    for (const activity of activities) {
      if (completedActivityNames.has(activity)) continue;

      const activityDate = extractActivityDate(activity, mod);
      const isOverdue = activityDate !== null && new Date(activityDate) < referenceDate;
      const daysOverdue = isOverdue
        ? Math.floor((referenceDate.getTime() - new Date(activityDate!).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      pendingActivities.push({
        activityName: activity,
        moduleName: mod.moduleName,
        moduleNumber: mod.moduleNumber,
        expectedDate: activityDate || mod.endDate,
        isOverdue,
        daysOverdue,
      });
    }
  }

  pendingActivities.sort(
    (a, b) => new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime()
  );

  return pendingActivities;
}

function extractActivityDate(activityName: string, _module: SyllabusModule): string | null {
  const dateMatch = activityName.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2].padStart(2, '0');
    const year = dateMatch[3];
    return `${year}-${month}-${day}`;
  }

  const months: Record<string, number> = {
    enero: 1, febrero: 2, marzo: 3, abril: 4,
    mayo: 5, junio: 6, julio: 7, agosto: 8,
    septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
  };

  const spanishMatch = activityName.match(/(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/i);
  if (spanishMatch) {
    const day = spanishMatch[1].padStart(2, '0');
    const monthNum = months[spanishMatch[2].toLowerCase()];
    const year = spanishMatch[3];
    if (monthNum) {
      return `${year}-${String(monthNum).padStart(2, '0')}-${day}`;
    }
  }

  return null;
}
