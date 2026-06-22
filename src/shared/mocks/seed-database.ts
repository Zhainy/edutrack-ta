import { db } from '@/shared/lib/database';
import { mockCohorts } from './cohorts';
import { mockStudents } from './students';
import { mockAttendance } from './attendance';
import { mockProgress } from './progress';
import { mockDedication } from './dedication';
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
        await db.attendance.bulkAdd(mockAttendance);
        await db.progress.bulkAdd(mockProgress);
        await db.dedication.bulkAdd(mockDedication);
        await db.notes.bulkAdd(mockNotes);
      }
    );

    // Check if syllabus was already loaded (e.g., from cronograma file)
    const syllabusCount = await db.syllabus.count();
    if (syllabusCount === 0) {
      console.log(
        '⚠️ No hay módulos cargados. Ir a /ingestion y cargar el cronograma ' +
        '(CRONOGRAMA*.xlsx) para ver los 9 módulos reales del curso Front-End con Vue.js.'
      );
    }

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
