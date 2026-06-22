import type { AttendanceRecord } from '@/entities/attendance';
import { mockStudents } from './students';

function buildAttendanceHistory(
  studentId: string,
  presentRate: number,
  lateRate: number
): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    // skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dateStr = date.toISOString().split('T')[0];
    const rand = Math.random();

    let status: AttendanceRecord['status'];
    if (rand < presentRate) {
      status = 'present';
    } else if (rand < presentRate + lateRate * (1 - presentRate)) {
      status = 'late';
    } else {
      status = 'absent';
    }

    records.push({
      id: `att-${studentId}-${dateStr}`,
      studentId,
      date: dateStr,
      status,
      uploadedAt: new Date().toISOString(),
    });
  }

  return records;
}

interface AttendanceConfig {
  present: number;
  late: number;
}

// Attendance rates per student group
const attendanceConfig: Record<string, AttendanceConfig> = {
  // Good students
  's-01': { present: 0.95, late: 0.05 },
  's-02': { present: 0.92, late: 0.05 },
  's-03': { present: 0.97, late: 0.02 },
  's-04': { present: 0.90, late: 0.06 },
  's-05': { present: 0.94, late: 0.04 },
  's-06': { present: 0.96, late: 0.03 },
  's-07': { present: 0.93, late: 0.05 },
  // Medium risk
  's-08': { present: 0.80, late: 0.08 },
  's-09': { present: 0.75, late: 0.10 },
  's-10': { present: 0.82, late: 0.07 },
  's-11': { present: 0.70, late: 0.10 },
  // High risk
  's-12': { present: 0.60, late: 0.08 },
  's-13': { present: 0.55, late: 0.06 },
  's-14': { present: 0.65, late: 0.07 },
  // Dropout / inactive — very low attendance
  's-15': { present: 0.20, late: 0.05 },
  's-16': { present: 0.15, late: 0.03 },
  's-17': { present: 0.10, late: 0.02 },
  's-18': { present: 0.05, late: 0.01 },
  's-19': { present: 0.30, late: 0.05 },
  's-20': { present: 0.25, late: 0.04 },
};

export const mockAttendance: AttendanceRecord[] = mockStudents.flatMap((student) => {
  const config = attendanceConfig[student.id] ?? { present: 0.85, late: 0.05 };
  return buildAttendanceHistory(student.id, config.present, config.late);
});
