import { db } from '@/shared/lib/database';
import type { AttendanceRecord } from '@/entities/attendance';

export async function getAttendanceByDateRange(
  cohortId: string,
  startDate: string,
  endDate: string
): Promise<AttendanceRecord[]> {
  const students = await db.students.where('cohortId').equals(cohortId).toArray();
  const studentIds = students.map((s) => s.id);
  if (studentIds.length === 0) return [];

  const all = await db.attendance
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();

  return all.filter((a) => studentIds.includes(a.studentId));
}

export async function getAttendanceByDate(
  date: string
): Promise<AttendanceRecord[]> {
  return db.attendance.where('date').equals(date).toArray();
}

export async function getAttendanceByStudent(
  studentId: string
): Promise<AttendanceRecord[]> {
  return db.attendance.where('studentId').equals(studentId).sortBy('date');
}

export async function upsertAttendance(
  record: AttendanceRecord
): Promise<void> {
  await db.attendance.put(record);
}

export async function bulkMarkAttendance(
  records: AttendanceRecord[]
): Promise<void> {
  if (records.length === 0) return;
  await db.attendance.bulkPut(records);
}

export async function getAttendanceStats(
  studentId: string,
  month?: string
): Promise<{
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendanceRate: number;
}> {
  let records = await getAttendanceByStudent(studentId);

  if (month) {
    records = records.filter((r) => r.date.startsWith(month));
  }

  const totalDays = records.length;
  const presentDays = records.filter((r) => r.status === 'present').length;
  const absentDays = records.filter((r) => r.status === 'absent').length;
  const lateDays = records.filter((r) => r.status === 'late').length;
  const excusedDays = records.filter((r) => r.status === 'excused').length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return { totalDays, presentDays, absentDays, lateDays, excusedDays, attendanceRate };
}

export async function getDatesForMonth(
  cohortId: string,
  year: number,
  month: number
): Promise<string[]> {
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const students = await db.students.where('cohortId').equals(cohortId).toArray();
  const studentIds = students.map((s) => s.id);
  if (studentIds.length === 0) return [];

  const all = await db.attendance
    .where('date')
    .between(`${monthStr}-01`, `${monthStr}-31`, true, true)
    .toArray();

  const dateSet = new Set(all.filter((a) => studentIds.includes(a.studentId)).map((a) => a.date));
  return Array.from(dateSet).sort();
}
