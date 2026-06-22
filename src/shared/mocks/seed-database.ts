import { db } from '@/shared/lib/database';
import { mockCohorts } from './cohorts';
import { mockStudents } from './students';
import { mockAttendance } from './attendance';
import { mockProgress } from './progress';
import { mockDedication } from './dedication';
import { mockSyllabus } from './syllabus';
import { mockNotes } from './notes';

export async function seedDatabase(): Promise<void> {
  try {
    const count = await db.students.count();
    if (count > 0) {
      console.log('ℹ️ Database already seeded, skipping...');
      return;
    }

    await db.transaction(
      'rw',
      [db.cohorts, db.students, db.attendance, db.progress, db.dedication, db.syllabus, db.notes],
      async () => {
        await db.cohorts.bulkAdd(mockCohorts);
        await db.students.bulkAdd(mockStudents);
        await db.syllabus.bulkAdd(mockSyllabus);
        await db.attendance.bulkAdd(mockAttendance);
        await db.progress.bulkAdd(mockProgress);
        await db.dedication.bulkAdd(mockDedication);
        await db.notes.bulkAdd(mockNotes);
      }
    );

    console.log(
      `✅ Database seeded: ${mockStudents.length} students, ` +
        `${mockAttendance.length} attendance records, ` +
        `${mockProgress.length} progress records, ` +
        `${mockDedication.length} dedication records`
    );
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}
