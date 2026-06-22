import * as XLSX from 'xlsx';
import type { ColumnMapping, ParseResult, ValidationError } from '../types';

export interface XlsxParseOptions {
  file: File;
  mappings: ColumnMapping[];
  sheetName?: string;
  preview?: boolean;
}

export async function parseXlsx({
  file,
  mappings,
  sheetName,
  preview = false,
}: XlsxParseOptions): Promise<ParseResult<Record<string, string>>> {
  console.log(`[xlsx-parser] Parsing XLSX: ${file.name} (${file.size} bytes)`);

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array', codepage: 65001 });

    const sheetNames = workbook.SheetNames;
    const targetSheet = sheetName ?? sheetNames[0];
    const sheet = workbook.Sheets[targetSheet];

    if (!sheet) {
      return {
        success: false,
        data: [],
        errors: [{
          row: 0,
          column: 'general',
          message: `Hoja "${targetSheet}" no encontrada. Hojas: ${sheetNames.join(', ')}`,
          value: undefined,
        }],
        warnings: [],
        stats: { totalRows: 0, validRows: 0, invalidRows: 1 },
      };
    }

    const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      header: undefined,
      defval: '',
      raw: false,
    });

    const limit = preview ? Math.min(20, jsonData.length) : jsonData.length;
    const slice = jsonData.slice(0, limit);

    console.log(`[xlsx-parser] Hoja: "${targetSheet}" (de ${sheetNames.length}), filas: ${slice.length}`);

    const errors: ValidationError[] = [];
    const rows: Record<string, string>[] = [];
    const warnings: string[] = [];

    if (slice.length === 0) {
      warnings.push(`La hoja "${targetSheet}" está vacía`);
    }

    const headers = slice.length > 0 ? Object.keys(slice[0]) : [];
    console.log(`[xlsx-parser] Headers detectados: [${headers.join(', ')}]`);

    let rowIndex = 1;

    for (const rawRow of slice) {
      rowIndex++;
      const mapped: Record<string, string> = {};

      for (const mapping of mappings) {
        const rawValue = rawRow[mapping.sourceColumn];

        if (rawValue === undefined || rawValue === null || String(rawValue).trim() === '') {
          if (mapping.required) {
            errors.push({
              row: rowIndex,
              column: mapping.sourceColumn,
              message: `Campo requerido "${mapping.targetField}" está vacío en fila ${rowIndex}`,
              value: rawValue,
            });
          }
          mapped[mapping.targetField] = '';
          continue;
        }

        mapped[mapping.targetField] = String(rawValue).trim();
      }

      rows.push(mapped);
    }

    const errorRows = new Set(errors.map((e) => e.row));

    console.log(`[xlsx-parser] Filas parseadas: ${rows.length}, errores: ${errors.length}`);

    return {
      success: errors.length === 0,
      data: rows,
      errors,
      warnings,
      stats: {
        totalRows: rows.length,
        validRows: rows.length - errorRows.size,
        invalidRows: errorRows.size,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido al leer XLSX';
    console.error(`[xlsx-parser] Error fatal: ${message}`);
    return {
      success: false,
      data: [],
      errors: [{
        row: 0,
        column: 'general',
        message: `Error al leer archivo XLSX: ${message}`,
        value: undefined,
      }],
      warnings: [],
      stats: { totalRows: 0, validRows: 0, invalidRows: 1 },
    };
  }
}

export async function getSheetNames(file: File): Promise<string[]> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array', codepage: 65001 });
    return workbook.SheetNames;
  } catch {
    return [];
  }
}

// ── SENCE Dedication parser ──────────────────────────────────────────────
// Format: 7 metadata rows, row 8 = headers, row 9+ = data
// Columns: Nombre | Apellido | Grupo | Dedicación minutos | Dedicación formato | Conexiones

export async function parseDedicationXLSX(
  file: File
): Promise<ParseResult<{ studentName: string; minutes: number; hours: number; date: string }>> {
  console.log(`[xlsx-parser] Parsing dedication XLSX: ${file.name}`);

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array', codepage: 65001 });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    if (!sheet) {
      return {
        success: false,
        data: [],
        errors: [{ row: 0, column: 'general', message: 'Hoja no encontrada', value: undefined }],
        warnings: [],
        stats: { totalRows: 0, validRows: 0, invalidRows: 1 },
      };
    }

    const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '', raw: false });
    const errors: ValidationError[] = [];
    const rows: { studentName: string; minutes: number; hours: number; date: string }[] = [];
    const warnings: string[] = [];

    if (data.length < 9) {
      return {
        success: false,
        data: [],
        errors: [{ row: 0, column: 'general', message: 'El archivo no tiene suficientes filas', value: undefined }],
        warnings: [],
        stats: { totalRows: 0, validRows: 0, invalidRows: 1 },
      };
    }

    for (let r = 8; r < data.length; r++) {
      const row = data[r];
      if (!row || row.length < 4) continue;

      const nombre = String(row[0] ?? '').trim();
      const apellido = String(row[1] ?? '').trim();
      const minutesRaw = String(row[3] ?? '').trim();

      if (!nombre && !apellido) continue;

      const studentName = `${nombre} ${apellido}`.trim();
      const minutes = parseFloat(minutesRaw.replace(',', '.'));
      const hours = isNaN(minutes) ? 0 : Math.round((minutes / 60) * 100) / 100;

      if (isNaN(minutes) || minutes <= 0) {
        errors.push({
          row: r + 1,
          column: 'Dedicación minutos',
          message: `Minutos inválidos para "${studentName}": "${minutesRaw}"`,
          value: minutesRaw,
        });
      }

      rows.push({
        studentName,
        minutes: isNaN(minutes) ? 0 : minutes,
        hours,
        date: new Date().toISOString().split('T')[0],
      });
    }

    const errorRows = new Set(errors.map((e) => e.row));
    return {
      success: errors.length === 0,
      data: rows,
      errors,
      warnings,
      stats: {
        totalRows: rows.length,
        validRows: rows.length - errorRows.size,
        invalidRows: errorRows.size,
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

// ── SENCE Syllabus (Cronograma) parser ───────────────────────────────────
// Format: metadata rows, then module table:
// Módulo N° | Nombre del Módulo | Aprendizajes Esperados | Día | Horas Sincrónicas | Horas Asincrónicas | Fecha | Horario

interface ModuleRow {
  moduleNumber: string;
  moduleName: string;
  dayNumber: string;
  syncHours: number;
  asyncHours: number;
  date: string;
  schedule: string;
}

interface ParsedSyllabusModule {
  moduleNumber: number;
  moduleName: string;
  startDate: string;
  endDate: string;
  expectedHours: number;
  activities: string[];
}

export async function parseSyllabusXLSX(
  file: File
): Promise<ParseResult<ParsedSyllabusModule>> {
  console.log(`[xlsx-parser] Parsing syllabus XLSX: ${file.name}`);

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array', codepage: 65001 });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    if (!sheet) {
      return {
        success: false,
        data: [],
        errors: [{ row: 0, column: 'general', message: 'Hoja no encontrada', value: undefined }],
        warnings: [],
        stats: { totalRows: 0, validRows: 0, invalidRows: 1 },
      };
    }

    const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '', raw: false });
    const errors: ValidationError[] = [];
    const warnings: string[] = [];
    const moduleRows: ModuleRow[] = [];
    let currentModule: string | null = null;

    for (let r = 0; r < data.length; r++) {
      const row = data[r];
      if (!row || row.length < 2) continue;

      const colA = String(row[0] ?? '').trim();
      const colB = String(row[1] ?? '').trim();

      const moduleMatch = colA.match(/M[oó]dulo\s*N[°º]\s*(\d+)/i);
      if (moduleMatch) {
        currentModule = moduleMatch[1];
        const moduleName = colB;
        const syncHours = parseFloat(String(row[4] ?? '0').replace(',', '.'));
        const asyncHours = parseFloat(String(row[5] ?? '0').replace(',', '.'));
        const date = String(row[6] ?? '').trim();
        const schedule = String(row[7] ?? '').trim();
        const dayNumber = String(row[3] ?? '').trim();

        if (moduleName) {
          moduleRows.push({
            moduleNumber: currentModule,
            moduleName,
            dayNumber,
            syncHours: isNaN(syncHours) ? 0 : syncHours,
            asyncHours: isNaN(asyncHours) ? 0 : asyncHours,
            date,
            schedule,
          });
        }
      } else if (currentModule && colA && /^\d+$/.test(colA.replace(/\s/g, ''))) {
        // Sub-row of same module (day continuation)
        const syncHours = parseFloat(String(row[4] ?? '0').replace(',', '.'));
        const asyncHours = parseFloat(String(row[5] ?? '0').replace(',', '.'));
        const date = String(row[6] ?? '').trim();
        const schedule = String(row[7] ?? '').trim();
        const dayNumber = String(row[3] ?? '').trim();

        moduleRows.push({
          moduleNumber: currentModule,
          moduleName: '',
          dayNumber,
          syncHours: isNaN(syncHours) ? 0 : syncHours,
          asyncHours: isNaN(asyncHours) ? 0 : asyncHours,
          date,
          schedule,
        });
      }
    }

    // Group rows by module number
    const modulesByNumber = new Map<string, ModuleRow[]>();
    for (const mr of moduleRows) {
      const existing = modulesByNumber.get(mr.moduleNumber) ?? [];
      existing.push(mr);
      modulesByNumber.set(mr.moduleNumber, existing);
    }

    const resultModules: ParsedSyllabusModule[] = [];
    for (const [modNum, modRows] of modulesByNumber) {
      const name = modRows.find((r) => r.moduleName)?.moduleName ?? `Módulo ${modNum}`;
      const dates = modRows.map((r) => r.date).filter(Boolean);
      const totalSync = modRows.reduce((s, r) => s + r.syncHours, 0);
      const totalAsync = modRows.reduce((s, r) => s + r.asyncHours, 0);
      const totalHours = Math.round((totalSync + totalAsync) * 100) / 100;

      resultModules.push({
        moduleNumber: parseInt(modNum, 10),
        moduleName: name,
        startDate: dates[0] ?? '',
        endDate: dates[dates.length - 1] ?? '',
        expectedHours: totalHours,
        activities: modRows.map((r) => {
          const parts: string[] = [];
          if (r.dayNumber) parts.push(`Día ${r.dayNumber}`);
          if (r.schedule) parts.push(r.schedule);
          if (r.date) parts.push(r.date);
          if (r.syncHours > 0) parts.push(`${r.syncHours}h sinc.`);
          if (r.asyncHours > 0) parts.push(`${r.asyncHours}h asinc.`);
          return parts.join(' — ');
        }),
      });
    }

    resultModules.sort((a, b) => a.moduleNumber - b.moduleNumber);

    if (resultModules.length === 0) {
      errors.push({
        row: 0,
        column: 'general',
        message: 'No se encontraron módulos en el archivo',
        value: undefined,
      });
    }

    return {
      success: errors.length === 0,
      data: resultModules,
      errors,
      warnings,
      stats: {
        totalRows: resultModules.length,
        validRows: resultModules.length,
        invalidRows: 0,
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
