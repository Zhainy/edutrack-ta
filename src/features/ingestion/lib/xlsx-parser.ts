import * as XLSX from 'xlsx';
import type { ColumnMapping, ParseResult, ValidationError } from '../types';

export interface XlsxParseOptions {
  file: File;
  mappings: ColumnMapping[];
  sheetName?: string;
  preview?: boolean;
}

/**
 * Parses an XLSX/XLS file using SheetJS.
 * Reads the specified sheet (or first sheet by default),
 * applies column mappings, and returns a ParseResult.
 */
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
      console.error(`[xlsx-parser] Hoja "${targetSheet}" no encontrada`);
      return {
        success: false,
        data: [],
        errors: [
          {
            row: 0,
            column: 'general',
            message: `Hoja "${targetSheet}" no encontrada en el archivo. Hojas disponibles: ${sheetNames.join(', ')}`,
            value: undefined,
          },
        ],
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
      errors: [
        {
          row: 0,
          column: 'general',
          message: `Error al leer archivo XLSX: ${message}`,
          value: undefined,
        },
      ],
      warnings: [],
      stats: { totalRows: 0, validRows: 0, invalidRows: 1 },
    };
  }
}

/**
 * Gets all sheet names from an XLSX file without parsing all rows.
 */
export async function getSheetNames(file: File): Promise<string[]> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array', codepage: 65001 });
    return workbook.SheetNames;
  } catch (err) {
    console.error('[xlsx-parser] Error al leer nombres de hojas:', err);
    return [];
  }
}
