export interface DedicationRecord {
  id: string;
  studentId: string;
  date: string;     // ISO 8601: YYYY-MM-DD
  hours: number;    // decimal with 2 digits (e.g. 1.50)
  platform: string; // 'main' by default
  uploadedAt: string;
}
