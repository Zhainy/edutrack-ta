import { db } from '@/shared/lib/database';
import type { Student } from '@/entities/student';
import type { AttendanceRecord } from '@/entities/attendance';
import type { ProgressRecord } from '@/entities/progress';
import type { DedicationRecord } from '@/entities/dedication';
import type { SyllabusModule } from '@/entities/syllabus';
import type { UploadLog } from '@/entities/upload-log';

// ── Bulk upsert helpers ──────────────────────────────────────────────────

export async function bulkUpsertStudents(students: Student[]): Promise<number> {
  if (students.length === 0) return 0;
  console.log(`[ingestion-api] Upserting ${students.length} students`);
  await db.students.bulkPut(students);
  return students.length;
}

export async function bulkUpsertAttendance(records: AttendanceRecord[]): Promise<number> {
  if (records.length === 0) return 0;
  console.log(`[ingestion-api] Upserting ${records.length} attendance records`);
  await db.attendance.bulkPut(records);
  return records.length;
}

export async function bulkUpsertProgress(records: ProgressRecord[]): Promise<number> {
  if (records.length === 0) return 0;
  console.log(`[ingestion-api] Upserting ${records.length} progress records`);
  await db.progress.bulkPut(records);
  return records.length;
}

export async function bulkUpsertDedication(records: DedicationRecord[]): Promise<number> {
  if (records.length === 0) return 0;
  console.log(`[ingestion-api] Upserting ${records.length} dedication records`);
  await db.dedication.bulkPut(records);
  return records.length;
}

export async function bulkUpsertSyllabus(modules: SyllabusModule[]): Promise<number> {
  if (modules.length === 0) return 0;
  console.log(`[ingestion-api] Upserting ${modules.length} syllabus modules`);
  await db.syllabus.bulkPut(modules);
  return modules.length;
}

// ── Upload log helpers ───────────────────────────────────────────────────

export async function getUploadLogs(): Promise<UploadLog[]> {
  const logs = await db.uploadLogs
    .orderBy('uploadedAt')
    .reverse()
    .toArray();
  return logs;
}

export async function addUploadLog(log: UploadLog): Promise<void> {
  console.log(`[ingestion-api] Adding upload log: ${log.fileName} (${log.status})`);
  await db.uploadLogs.put(log);
}

export async function clearUploadLogs(): Promise<void> {
  console.log('[ingestion-api] Clearing all upload logs');
  await db.uploadLogs.clear();
}
