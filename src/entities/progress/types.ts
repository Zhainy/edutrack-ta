export interface ProgressRecord {
  id: string;
  studentId: string;
  activityName: string;
  moduleNumber?: number;
  completed: boolean;
  completionDate?: string;
  score?: number;
  studentEmail?: string;
  status?: string;
  uploadedAt: string;
}
