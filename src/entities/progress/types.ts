export interface ProgressRecord {
  id: string;
  studentId: string;
  activityName: string;
  moduleNumber?: number;
  completed: boolean;
  completionDate?: string; // ISO 8601: YYYY-MM-DD
  score?: number;          // decimal 0-100
  uploadedAt: string;
}
