import { db } from '@/shared/lib/database';

const CHAR_MAP: Record<string, string> = {
  'ﾍ': 'i', 'ﾁ': 'a', 'ﾑ': 'n', 'ﾓ': 'o', 'ﾕ': 'u',
  'ｻ': 'A', 'ﾉ': 'e', 'ﾅ': 'N', 'ｵ': 'O',
  'ﾌ': 'e', '｣': 'o', '｢': 'O', 'ｩ': 'u', 'ｳ': 'o',
};

function normalize(s: string): string {
  let cleaned = s;
  for (const [corrupt, correct] of Object.entries(CHAR_MAP)) {
    cleaned = cleaned.split(corrupt).join(correct);
  }
  return cleaned
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export async function findStudentId(
  name?: string,
  email?: string
): Promise<string | null> {
  if (email) {
    const student = await db.students.where('email').equals(email).first();
    if (student) return student.id;
  }

  if (name) {
    const allStudents = await db.students.toArray();
    const normalizedName = normalize(name);

    const exactMatch = allStudents.find(s => normalize(s.fullName) === normalizedName);
    if (exactMatch) return exactMatch.id;

    const partialMatch = allStudents.find(s => {
      const sn = normalize(s.fullName);
      return sn.includes(normalizedName) || normalizedName.includes(sn);
    });
    if (partialMatch) return partialMatch.id;

    const nameParts = normalizedName.split(' ');
    if (nameParts.length >= 2) {
      const firstLast = `${nameParts[0]} ${nameParts[1]}`;
      const partsMatch = allStudents.find(s =>
        normalize(s.fullName).startsWith(firstLast)
      );
      if (partsMatch) return partsMatch.id;
    }
  }

  return null;
}

export async function matchAllRecords(): Promise<{
  matched: number;
  unmatched: number;
}> {
  let matched = 0;
  let unmatched = 0;

  const unmatchedAttendance = await db.attendance
    .filter(a => !a.studentId || a.studentId === '')
    .toArray();

  for (const record of unmatchedAttendance) {
    const studentId = await findStudentId(record.studentName);
    if (studentId) {
      await db.attendance.update(record.id, { studentId });
      matched++;
    } else {
      unmatched++;
    }
  }

  const unmatchedDedication = await db.dedication
    .filter(d => !d.studentId || d.studentId === '')
    .toArray();

  for (const record of unmatchedDedication) {
    const studentId = await findStudentId(record.studentName);
    if (studentId) {
      await db.dedication.update(record.id, { studentId });
      matched++;
    } else {
      unmatched++;
    }
  }

  const unmatchedProgress = await db.progress
    .filter(p => !p.studentId || p.studentId === '')
    .toArray();

  for (const record of unmatchedProgress) {
    const studentId = await findStudentId(undefined, record.studentEmail);
    if (studentId) {
      await db.progress.update(record.id, { studentId });
      matched++;
    } else {
      unmatched++;
    }
  }

  return { matched, unmatched };
}
