export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName?: string;
  date: string;   // ISO 8601: YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  uploadedAt: string;
  updatedAt?: string;
}
