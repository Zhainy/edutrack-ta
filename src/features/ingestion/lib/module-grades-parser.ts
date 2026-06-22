import * as XLSX from 'xlsx';
import { findStudentId } from '@/features/students/lib/matcher';
import type { ParseResult, ValidationError } from '../types';
import type { ModuleGrade } from '@/entities/module-grade';

const CHAR_MAP: Record<string, string> = {
  'ﾍ': 'í', 'ﾁ': 'á', 'ﾑ': 'ñ', 'ﾓ': 'ó', 'ﾕ': 'ú',
  'ｻ': 'Á', 'ﾉ': 'é', 'ﾅ': 'Ñ', 'ｵ': 'Ó',
  'ﾌ': 'é', '｣': 'ó', '｢': 'Ó', 'ｩ': 'ú', 'ｳ': 'ó',
};

function cleanName(name: string): string {
  if (!name) return name;
  let cleaned = name;
  for (const [corrupt, correct] of Object.entries(CHAR_MAP)) {
    cleaned = cleaned.split(corrupt).join(correct);
  }
  return cleaned.trim();
}

export async function parseModuleGradesXLSX(
  file: File,
  cohortId: string
): Promise<ParseResult<ModuleGrade>> {
  console.log(`[module-grades-parser] Parsing module grades XLSX: ${file.name}`);

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    const sheet = workbook.Sheets['Notas'];
    if (!sheet) {
      return {
        success: false,
        data: [],
        errors: [{
          row: 0, column: 'Sheet',
          message: 'No se encontró hoja "Notas" en el archivo',
          value: undefined,
        }],
        warnings: [],
        stats: { totalRows: 0, validRows: 0, invalidRows: 0 },
      };
    }

    const rawRows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1, defval: '', raw: false,
    });

    const errors: ValidationError[] = [];
    const grades: ModuleGrade[] = [];
    const warnings: string[] = [];

    if (rawRows.length < 3) {
      warnings.push('La hoja "Notas" tiene pocas filas (quizás sin datos)');
    }

    // Row 0 should have module header names (Módulo 1, Módulo 2, etc.)
    const headers = rawRows[0] ?? [];
    const moduleCols: { col: number; moduleNumber: number }[] = [];

    for (let c = 1; c < headers.length; c++) {
      const h = String(headers[c] ?? '').trim();
      const m = h.match(/M[oó]dulo\s*(\d+)/i);
      if (m) {
        moduleCols.push({ col: c, moduleNumber: parseInt(m[1], 10) });
      }
    }

    if (moduleCols.length === 0) {
      warnings.push('No se detectaron columnas de módulo en los encabezados');
    }

    const now = new Date().toISOString();

    for (let rowIdx = 2; rowIdx < rawRows.length; rowIdx++) {
      const row = rawRows[rowIdx];
      if (!row || row.length < 2) continue;

      const rawName = String(row[0] ?? '').trim();
      const studentName = cleanName(rawName);
      if (!studentName) continue;

      const studentId = await findStudentId(studentName);

      for (const { col, moduleNumber } of moduleCols) {
        const cellValue = row[col] as string | undefined;
        if (cellValue === undefined || cellValue === null || cellValue === '') continue;

        const cellText = String(cellValue).trim();
        let grade: number | null = null;
        let isPending = false;

        if (cellText.toUpperCase() === 'PENDIENTE') {
          isPending = true;
        } else {
          const parsed = parseFloat(cellText.replace(',', '.'));
          if (!isNaN(parsed)) {
            grade = parsed;
          } else {
            continue;
          }
        }

        grades.push({
          id: crypto.randomUUID(),
          studentId: studentId || '',
          cohortId,
          moduleNumber,
          grade,
          isPending,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    console.log(`[module-grades-parser] ${grades.length} grades parsed`);
    return {
      success: errors.length === 0,
      data: grades,
      errors,
      warnings,
      stats: {
        totalRows: rawRows.length - 2,
        validRows: grades.length,
        invalidRows: errors.length,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al leer XLSX';
    return {
      success: false,
      data: [],
      errors: [{
        row: 0, column: 'general',
        message: `Error al leer archivo: ${message}`,
        value: undefined,
      }],
      warnings: [],
      stats: { totalRows: 0, validRows: 0, invalidRows: 1 },
    };
  }
}
