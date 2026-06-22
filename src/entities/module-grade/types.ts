export interface ModuleGrade {
  id: string;
  studentId: string;
  cohortId: string;
  moduleNumber: number;
  grade: number | null;
  isPending: boolean;
  sentDate?: string;
  createdAt: string;
  updatedAt: string;
}
