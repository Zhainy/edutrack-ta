import * as XLSX from 'xlsx';
import type { ParseResult, ValidationError } from '../types';
import type { AttendanceRecord } from '@/entities/attendance';
import type { Note } from '@/entities/note';

const MONTH_SHEETS = ['Mayo', 'Junio', 'Julio', 'Agosto'];

const MONTH_NUMBERS: Record<string, number> = {
  Mayo: 5, Junio: 6, Julio: 7, Agosto: 8,
};

const YEAR = 2026;

function cleanStudentName(name: string): string {
  if (!name) return name;
  return name
    .replace(/[\uFF81]/g, 'á')
    .replace(/[\uFF8D]/g, 'í')
    .replace(/[\uFF91]/g, 'ñ')
    .replace(/[\uFF93]/g, 'ó')
    .replace(/[\uFF95]/g, 'ú')
    .replace(/[\uFF7B]/g, 'Á')
    .replace(/[\uFF89]/g, 'Í')
    .replace(/[\uFF85]/g, 'Ñ')
    .replace(/[\uFF75]/g, 'Ó')
    .replace(/[\uFF84]/g, 'é')
    .replace(/[\uFF9D]/g, 'ü')
    .trim();
}

function mapStatus(code: string): AttendanceRecord['status'] | null {
  const c = code.trim().toUpperCase();
  if (c === 'P') return 'present';
  if (c === 'A') return 'absent';
  if (c === 'X') return 'excused';
  return null;
}

export async function parseAttendanceXLSX(
  file: File
): Promise<ParseResult<AttendanceRecord>> {
  console.log(`[attendance-parser] Parsing multi-sheet attendance XLSX: ${file.name}`);

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array', cellStyles: true });

    const allRecords: AttendanceRecord[] = [];
    const allNotes: Note[] = [];
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    for (const month of MONTH_SHEETS) {
      const sheet = workbook.Sheets[month];
      if (!sheet) {
        warnings.push(`Hoja "${month}" no encontrada`);
        continue;
      }

      if (!sheet['!ref']) {
        warnings.push(`Hoja "${month}" está vacía`);
        continue;
      }

      const range = XLSX.utils.decode_range(sheet['!ref']);
      const monthNum = MONTH_NUMBERS[month];
      if (!monthNum) continue;

      // Row 0: date headers (day numbers)
      const dateHeaders: (number | null)[] = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cell = sheet[XLSX.utils.encode_cell({ r: 0, c: col })];
        const raw = cell ? String(cell.v ?? '').trim() : '';
        const day = parseInt(raw, 10);
        dateHeaders.push(isNaN(day) ? null : day);
      }

      // Rows 1+: student data
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        // Column B (index 1): student name
        const nameCell = sheet[XLSX.utils.encode_cell({ r: row, c: 1 })];
        const rawName = nameCell ? String(nameCell.v ?? '').trim() : '';
        const studentName = cleanStudentName(rawName);

        if (!studentName || studentName.toLowerCase().includes('asistentes')) continue;

        // Process each date column starting at column C (index 2)
        for (let col = 2; col <= range.e.c; col++) {
          const day = dateHeaders[col];
          if (day === null || day === undefined) continue;

          const statusCell = sheet[XLSX.utils.encode_cell({ r: row, c: col })];
          if (!statusCell) continue;

          const rawStatus = String(statusCell.v ?? '').trim();
          if (!rawStatus) continue;

          const status = mapStatus(rawStatus);
          if (!status) continue;

          const dateStr = `${YEAR}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

          // Read cell comment if present
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
          const commentText = (sheet[cellRef] as { c?: Array<{ t?: string }> } | undefined)?.c?.[0]?.t ?? '';

          allRecords.push({
            id: crypto.randomUUID(),
            studentId: '',
            studentName,
            date: dateStr,
            status,
            notes: commentText || undefined,
            uploadedAt: new Date().toISOString(),
          });

          // Create automatic note if comment is substantive
          if (commentText && commentText.length > 10) {
            allNotes.push({
              id: crypto.randomUUID(),
              studentId: '',
              type: 'context',
              title: `Asistencia ${dateStr}`,
              content: commentText,
              priority: 'medium',
              dueDate: dateStr,
              isCompleted: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }
    }

    // Parse "Notas" sheet for final module evaluations
    const notasSheet = workbook.Sheets['Notas'];
    if (notasSheet && notasSheet['!ref']) {
      const notasRange = XLSX.utils.decode_range(notasSheet['!ref']);

      for (let row = notasRange.s.r + 1; row <= notasRange.e.r; row++) {
        const nameCell = notasSheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
        const rawName = nameCell ? String(nameCell.v ?? '').trim() : '';
        const studentName = cleanStudentName(rawName);
        if (!studentName) continue;

        // Collect module notes from columns B onwards
        for (let col = 1; col <= notasRange.e.c; col++) {
          const valCell = notasSheet[XLSX.utils.encode_cell({ r: row, c: col })];
          if (!valCell) continue;
          const val = String(valCell.v ?? '').trim();
          if (!val) continue;

          allNotes.push({
            id: crypto.randomUUID(),
            studentId: '',
            type: 'alert',
            title: `Evaluación Módulo ${col}`,
            content: `${studentName}: ${val}`,
            priority: 'medium',
            isCompleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    console.log(`[attendance-parser] ${allRecords.length} records, ${allNotes.length} notes from ${MONTH_SHEETS.filter((m) => workbook.Sheets[m]).length} sheet(s)`);

    return {
      success: errors.length === 0,
      data: allRecords,
      errors,
      warnings,
      stats: {
        totalRows: allRecords.length,
        validRows: allRecords.length,
        invalidRows: errors.length,
      },
      extra: { notes: allNotes },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al leer XLSX';
    return {
      success: false,
      data: [],
      errors: [{ row: 0, column: 'general', message: `Error al leer archivo: ${message}`, value: undefined }],
      warnings: [],
      stats: { totalRows: 0, validRows: 0, invalidRows: 1 },
    };
  }
}
