export interface Student {
  id: string;
  cohortId: string;
  externalId: string;
  fullName: string;
  email?: string;
  status: 'active' | 'dropout' | 'inactive';
  enrollmentDate: string; // ISO 8601: YYYY-MM-DD
  tags: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
