export interface Cohort {
  id: string;
  name: string;
  description?: string;
  startDate: string; // ISO 8601: YYYY-MM-DD
  endDate: string;   // ISO 8601: YYYY-MM-DD
  syllabusUrl?: string;
  createdAt: string;
  updatedAt: string;
}
