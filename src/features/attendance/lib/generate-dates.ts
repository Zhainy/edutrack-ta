import { db } from '@/shared/lib/database';

export interface ClassDate {
  date: string;
  dayOfWeek: number;
  moduleNumber?: number;
  isHoliday?: boolean;
}

function toLocalDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export async function generateAllClassDates(): Promise<ClassDate[]> {
  const syllabus = await db.syllabus.toArray();

  const classDates: ClassDate[] = [];
  const currentDate = new Date(2026, 4, 14); // May 14, 2026
  const endDate = new Date(2026, 7, 18); // Aug 18, 2026

  const holidays = [
    '2026-05-21',
    '2026-07-16',
    '2026-08-15',
  ].map(parseLocalDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const dateStr = toLocalDateStr(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const isHoliday = holidays.some(
        h => h.getFullYear() === currentDate.getFullYear()
          && h.getMonth() === currentDate.getMonth()
          && h.getDate() === currentDate.getDate()
      );

      if (!isHoliday) {
        const module = syllabus.find(m => {
          const start = parseLocalDate(m.startDate);
          const end = parseLocalDate(m.endDate);
          return currentDate >= start && currentDate <= end;
        });

        classDates.push({
          date: dateStr,
          dayOfWeek,
          moduleNumber: module?.moduleNumber,
          isHoliday: false,
        });
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return classDates;
}

export function getMonthName(date: Date): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  return months[date.getMonth()];
}

export function groupDatesByMonth(dates: ClassDate[]): Map<string, ClassDate[]> {
  const grouped = new Map<string, ClassDate[]>();

  for (const date of dates) {
    const d = parseLocalDate(date.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(date);
  }

  return grouped;
}
