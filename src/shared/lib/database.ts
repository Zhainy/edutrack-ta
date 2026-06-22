import Dexie, { type Table } from 'dexie';
import type { Student } from '@/entities/student';
import type { Cohort } from '@/entities/cohort';
import type { AttendanceRecord } from '@/entities/attendance';
import type { ProgressRecord } from '@/entities/progress';
import type { DedicationRecord } from '@/entities/dedication';
import type { SyllabusModule } from '@/entities/syllabus';
import type { Note } from '@/entities/note';

export class EduTrackDatabase extends Dexie {
  cohorts!: Table<Cohort, string>;
  students!: Table<Student, string>;
  attendance!: Table<AttendanceRecord, string>;
  progress!: Table<ProgressRecord, string>;
  dedication!: Table<DedicationRecord, string>;
  syllabus!: Table<SyllabusModule, string>;
  notes!: Table<Note, string>;

  constructor() {
    super('edutrack-ta');

    // v1 — original schema
    this.version(1).stores({
      cohorts: 'id, name, startDate, endDate',
      students:
        'id, cohortId, externalId, email, status, fullName, [cohortId+status], [cohortId+externalId]',
      attendance: 'id, studentId, date, status, [studentId+date]',
      progress:
        'id, studentId, activityName, moduleNumber, completed, [studentId+activityName]',
      dedication: 'id, studentId, date, platform, [studentId+date]',
      syllabus: 'id, cohortId, moduleNumber, [cohortId+moduleNumber]',
      notes:
        'id, studentId, type, priority, dueDate, isCompleted, [studentId+type], [studentId+isCompleted]',
    });

    // v2 — added createdAt index on notes for orderBy('createdAt')
    this.version(2).stores({
      notes:
        'id, studentId, type, priority, dueDate, isCompleted, createdAt, [studentId+type], [studentId+isCompleted]',
    });
  }
}

export const db = new EduTrackDatabase();
