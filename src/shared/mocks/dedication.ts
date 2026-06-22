import type { DedicationRecord } from '@/entities/dedication';
import { mockStudents } from './students';

function buildDedicationHistory(
  studentId: string,
  avgHoursPerDay: number,
  declining: boolean = false
): DedicationRecord[] {
  const records: DedicationRecord[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    // skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // declining: reduce hours in last 14 days by 65%
    const multiplier = declining && i < 14 ? 0.35 : 1;
    const variance = 0.6 + Math.random() * 0.8; // ±40% variance
    const rawHours = avgHoursPerDay * multiplier * variance;
    const hours = parseFloat(Math.max(0, rawHours).toFixed(2));

    if (hours <= 0) continue;

    const dateStr = date.toISOString().split('T')[0];
    records.push({
      id: `ded-${studentId}-${dateStr}`,
      studentId,
      date: dateStr,
      hours,
      platform: 'main',
      uploadedAt: new Date().toISOString(),
    });
  }

  return records;
}

interface DedicationConfig {
  avgHours: number;
  declining: boolean;
}

const dedicationConfig: Record<string, DedicationConfig> = {
  's-01': { avgHours: 4.0, declining: false },
  's-02': { avgHours: 3.5, declining: false },
  's-03': { avgHours: 4.5, declining: false },
  's-04': { avgHours: 3.8, declining: false },
  's-05': { avgHours: 4.2, declining: false },
  's-06': { avgHours: 3.6, declining: false },
  's-07': { avgHours: 3.9, declining: false },
  's-08': { avgHours: 2.5, declining: true },
  's-09': { avgHours: 2.0, declining: true },
  's-10': { avgHours: 2.8, declining: false },
  's-11': { avgHours: 1.8, declining: true },
  's-12': { avgHours: 1.2, declining: true },
  's-13': { avgHours: 0.8, declining: true },
  's-14': { avgHours: 1.5, declining: true },
  's-15': { avgHours: 0.3, declining: false },
  's-16': { avgHours: 0.2, declining: false },
  's-17': { avgHours: 0.1, declining: false },
  's-18': { avgHours: 0.0, declining: false },
  's-19': { avgHours: 0.5, declining: false },
  's-20': { avgHours: 0.4, declining: false },
};

export const mockDedication: DedicationRecord[] = mockStudents.flatMap((student) => {
  const config = dedicationConfig[student.id] ?? { avgHours: 2.0, declining: false };
  return buildDedicationHistory(student.id, config.avgHours, config.declining);
});
