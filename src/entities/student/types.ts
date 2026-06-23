export type StudentStatus = 'active' | 'dropout' | 'inactive' | 'replacement';

export interface Student {
  id: string;
  cohortId: string;
  externalId: string;
  fullName: string;
  email?: string;
  status: StudentStatus;
  enrollmentDate: string; // ISO 8601: YYYY-MM-DD
  tags: string[];
  metadata?: {
    rut?: string;
    telefono?: string;
    contactStatus?: string;
    observations?: string;
  };
  createdAt: string;
  updatedAt: string;
}
