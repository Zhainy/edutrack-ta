import * as XLSX from 'xlsx';
import type { ParseResult, ValidationError } from '../types';
import type { AttendanceRecord } from '@/entities/attendance';
import type { ModuleGrade } from '@/entities/module-grade';
import type { Note } from '@/entities/note';
import type { Student } from '@/entities/student';

const MONTH_SHEETS = ['Mayo', 'Junio', 'Julio', 'Agosto'];

const MONTH_NUMBERS: Record<string, number> = {
  Mayo: 5, Junio: 6, Julio: 7, Agosto: 8,
};

const YEAR = 2026;

const CHAR_MAP: Record<string, string> = {
  'ﾍ': 'í',
  'ﾁ': 'á',
  'ﾑ': 'ñ',
  'ﾓ': 'ó',
  'ﾕ': 'ú',
  'ｻ': 'Á',
  'ﾉ': 'é',
  'ﾅ': 'Ñ',
  'ｵ': 'Ó',
  'ﾌ': 'é',
  '｣': 'ó',
  '｢': 'Ó',
  'ｩ': 'ú',
  'ｳ': 'ó',
};

function cleanStudentName(name: string): string {
  if (!name) return name;
  let cleaned = name;
  for (const [corrupt, correct] of Object.entries(CHAR_MAP)) {
    cleaned = cleaned.split(corrupt).join(correct);
  }
  return cleaned.trim();
}

function isWeekend(year: number, month: number, day: number): boolean {
  const d = new Date(year, month - 1, day);
  const dow = d.getDay();
  return dow === 0 || dow === 6;
}

function mapStatus(code: string): AttendanceRecord['status'] | null {
  const c = code.trim().toUpperCase();
  if (c === 'P') return 'present';
  if (c === 'A') return 'absent';
  if (c === 'X') return 'excused';
  return null;
}

export async function parseStudentsFromAttendanceFile(
  file: File,
  cohortId: string
): Promise<ParseResult<Student>> {
  console.log(`[attendance-parser] Parsing students from XLSX: ${file.name}`);

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    console.log(`[parseStudents] Sheets: ${workbook.SheetNames.join(', ')}`);

    const listaSheetName = workbook.SheetNames.find(
      name => name.toLowerCase() === 'lista'
    );
    if (!listaSheetName) {
      return {
        success: false,
        data: [],
        errors: [{ row: 0, column: 'Sheet', message: 'No se encontró hoja "Lista" en el archivo', value: undefined }],
        warnings: [],
        stats: { totalRows: 0, validRows: 0, invalidRows: 0 },
      };
    }

    const sheet = workbook.Sheets[listaSheetName];
    const rawRows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });

    console.log(`[parseStudents] Total filas leídas: ${rawRows.length}`);
    console.log(`[parseStudents] Fila 0 (codigo):`, rawRows[0]);
    console.log(`[parseStudents] Fila 1 (headers):`, rawRows[1]);

    // Row 0: course code + name
    // Row 1: headers (Rut, Nombre, ..., Correo, Teléfono, ...)
    // Row 2+: student data
    const dataRows = rawRows.slice(2);

    const students: Student[] = [];
    const errors: ValidationError[] = [];

    for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex++) {
      const row = dataRows[rowIndex];
      const actualRowIndex = rowIndex + 6; // 1-based display

      if (!row || row.length === 0) continue;

      const rut = String(row[0] ?? '').trim();
      const fullName = String(row[1] ?? '').trim();
      if (!fullName && !rut) continue; // skip truly empty rows

      const contactStatus = String(row[2] ?? '').trim();
      const email = String(row[3] ?? '').trim();
      const phone = String(row[4] ?? '').trim();
      const observations = String(row[5] ?? '').trim();

      if (!fullName || !email) {
        errors.push({
          row: actualRowIndex,
          column: 'Nombre/Email',
          message: 'Nombre y email son requeridos',
          value: { fullName, email },
        });
        continue;
      }

      let status: Student['status'] = 'active';
      const tags: string[] = [];

      if (observations.toUpperCase().includes('DESERTOR')) {
        status = 'dropout';
        tags.push('Desertor');
      }
      if (observations.toUpperCase().includes('REEMPLAZO')) {
        tags.push('Reemplazo');
      }
      if (observations.toUpperCase().includes('SUBSIDIO')) {
        tags.push('Subsidio de cuidado');
      }

      const cs = contactStatus.toLowerCase();
      if (cs === 'no contesta') tags.push('No contesta');
      else if (cs === 'buzon') tags.push('Buzón lleno');
      else if (cs === 'whatsapp') tags.push('Contacto por WhatsApp');

      let enrollmentDate = new Date().toISOString().split('T')[0];
      const ingresoMatch = observations.match(/Ingreso\s+(\d{1,2})\/(\d{1,2})/);
      if (ingresoMatch) {
        const day = ingresoMatch[1].padStart(2, '0');
        const month = ingresoMatch[2].padStart(2, '0');
        enrollmentDate = `2026-${month}-${day}`;
      }

      const cleanName = cleanStudentName(fullName);

      students.push({
        id: crypto.randomUUID(),
        cohortId,
        externalId: rut || email,
        fullName: cleanName,
        email,
        status,
        enrollmentDate,
        tags,
        metadata: {
          rut,
          telefono: phone,
          contactStatus,
          observations,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    console.log(`[parseStudents] Estudiantes parseados: ${students.length}, errores: ${errors.length}`);

    return {
      success: errors.length === 0,
      data: students,
      errors,
      warnings: [],
      stats: {
        totalRows: dataRows.length,
        validRows: students.length,
        invalidRows: errors.length,
      },
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

          // Skip weekends (classes are Mon-Fri per syllabus)
          if (isWeekend(YEAR, monthNum, day)) continue;

          // Read cell comment if present
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
          const rawComment = (sheet[cellRef] as { c?: Array<{ t?: string }> } | undefined)?.c?.[0]?.t ?? '';
          const commentText = cleanStudentName(rawComment);

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
              studentName,
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
    const moduleGrades: ModuleGrade[] = [];
    if (notasSheet && notasSheet['!ref']) {
      const rawNotasData: unknown[][] = XLSX.utils.sheet_to_json(notasSheet, {
        header: 1, defval: '', raw: false,
      });

      // Row 0: headers
      const notaHeaders = rawNotasData[0] ?? [];
      const gradeCols: { col: number; moduleNumber: number }[] = [];
      for (let c = 1; c < notaHeaders.length; c++) {
        const h = String(notaHeaders[c] ?? '').trim();
        const m = h.match(/M[oó]dulo\s*(\d+)/i);
        if (m) gradeCols.push({ col: c, moduleNumber: parseInt(m[1], 10) });
      }

      const now = new Date().toISOString();

      for (let rowIdx = 2; rowIdx < rawNotasData.length; rowIdx++) {
        const row = rawNotasData[rowIdx];
        if (!row || row.length < 2) continue;

        const rawName = String(row[0] ?? '').trim();
        const studentName = cleanStudentName(rawName);
        if (!studentName) continue;

        for (const { col, moduleNumber } of gradeCols) {
          const cellValue = row[col] as string | undefined;
          if (cellValue === undefined || cellValue === null) continue;

          const cellText = String(cellValue).trim();
          if (!cellText) continue;

          let grade: number | null = null;
          let isPending = false;

          if (cellText.toUpperCase() === 'PENDIENTE') {
            isPending = true;
          } else {
            const parsed = parseFloat(cellText.replace(',', '.'));
            if (!isNaN(parsed)) grade = parsed;
          }

          moduleGrades.push({
            id: crypto.randomUUID(),
            studentId: '',
            studentName,
            cohortId: '',
            moduleNumber,
            grade,
            isPending,
            createdAt: now,
            updatedAt: now,
          });

          allNotes.push({
            id: crypto.randomUUID(),
            studentId: '',
            studentName,
            type: 'alert',
            title: `Evaluación Módulo ${moduleNumber}`,
            content: `${studentName}: ${cellText}`,
            priority: 'medium',
            isCompleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    console.log(`[attendance-parser] ${allRecords.length} records, ${allNotes.length} notes, ${moduleGrades.length} grades from ${MONTH_SHEETS.filter((m) => workbook.Sheets[m]).length} sheet(s)`);

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
      extra: { notes: allNotes, moduleGrades },
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
