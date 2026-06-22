import * as XLSX from 'xlsx';
import type { ColumnMapping, ParseResult, ValidationError } from '../types';
import type { DedicationRecord } from '@/entities/dedication';

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
// Columns: Nombre | Apellido(s) | Grupo | Dedicación al curso (minutos) | Dedicación al curso | Conexiones por día

export async function parseDedicationXLSX(
  file: File
): Promise<ParseResult<DedicationRecord>> {
  console.log(`[xlsx-parser] Parsing dedication XLSX: ${file.name}`);

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
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

    const rawData = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '', raw: false });
    const errors: ValidationError[] = [];
    const records: DedicationRecord[] = [];
    const warnings: string[] = [];

    // Real structure: row 0 = metadata, row 1 = empty, row 2 = headers, row 3+ = data
    if (rawData.length < 4) {
      return {
        success: false,
        data: [],
        errors: [{ row: 0, column: 'general', message: 'El archivo no tiene suficientes filas', value: undefined }],
        warnings: [],
        stats: { totalRows: 0, validRows: 0, invalidRows: 1 },
      };
    }

    const dataRows = rawData.slice(3);
    let validRows = 0;
    let invalidRows = 0;
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowIndex = i + 4;

      try {
        if (!row || row.length === 0 || !row[0]) continue;

        const nombre = String(row[0] ?? '').trim();
        const apellidos = String(row[1] ?? '').trim();
        const grupo = String(row[2] ?? '').trim();
        const minutosRaw = String(row[3] ?? '').trim();
        const conexiones = parseFloat(String(row[5] ?? '0').trim()) || 0;

        if (!nombre || !apellidos) {
          errors.push({
            row: rowIndex,
            column: 'Nombre/Apellido',
            message: 'Nombre y apellido son requeridos',
            value: { nombre, apellidos },
          });
          invalidRows++;
          continue;
        }

        const minutos = parseInt(minutosRaw, 10) || 0;
        if (minutos === 0) continue;

        const hours = Math.round((minutos / 60) * 100) / 100;
        const fullName = `${nombre} ${apellidos}`.trim();

        records.push({
          id: crypto.randomUUID(),
          studentId: '',
          studentName: fullName,
          date: today,
          hours,
          platform: 'SENCE',
          metadata: { grupo, minutos, conexiones },
          uploadedAt: new Date().toISOString(),
        });
        validRows++;
      } catch (error) {
        errors.push({
          row: rowIndex,
          column: 'General',
          message: `Error procesando fila: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          value: row,
        });
        invalidRows++;
      }
    }

    return {
      success: invalidRows === 0,
      data: records,
      errors,
      warnings,
      stats: { totalRows: dataRows.length, validRows, invalidRows },
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

// ── Syllabus parser moved to syllabus-parser.ts ───────────────────────────
