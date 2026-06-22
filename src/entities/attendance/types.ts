export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;   // ISO 8601: YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  uploadedAt: string;
}
