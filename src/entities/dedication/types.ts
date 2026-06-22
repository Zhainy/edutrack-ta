export interface DedicationRecord {
  id: string;
  studentId: string;
  date: string;
  hours: number;
  platform: string;
  studentName?: string;
  metadata?: Record<string, unknown>;
  uploadedAt: string;
}
