import type { Cohort } from '@/entities/cohort';

export const COHORT_ID = 'cohort-1';

export const mockCohorts: Cohort[] = [
  {
    id: COHORT_ID,
    code: 'RTD-24-01-06-0021-4',
    name: 'DESARROLLO DE APLICACIONES FRONT-END TRAINEE V2.0',
    startDate: '2026-05-14',
    endDate: '2026-08-18',
    totalHours: 438,
    region: "O'Higgins",
    schedule: '19:00 A 23:00 HRS',
    instructor: 'Juan Pablo Duran',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
