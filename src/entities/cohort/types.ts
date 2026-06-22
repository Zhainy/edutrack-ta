export interface Cohort {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  region?: string;
  schedule?: string;
  instructor?: string;
  description?: string;
  syllabusUrl?: string;
  createdAt: string;
  updatedAt: string;
}
