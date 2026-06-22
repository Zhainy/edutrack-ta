import type { Cohort } from '@/entities/cohort';

export const COHORT_ID = 'cohort-2026-a';

export const mockCohorts: Cohort[] = [
  {
    id: COHORT_ID,
    name: 'Cohorte 2026-A',
    description: 'Cohorte de programación web - primer semestre 2026',
    startDate: '2026-03-01',
    endDate: '2026-08-31',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
  },
];
