import Papa from 'papaparse';
import type { ColumnMapping, ParseResult, ValidationError } from '../types';

export interface CsvParseOptions {
  file: File;
  mappings: ColumnMapping[];
  preview?: boolean;
}

/**
 * Parses a CSV file using PapaParse with auto-detection of delimiters.
 * Applies column mappings to extract only the relevant fields,
 * and returns a ParseResult with row-level validation errors.
 */
export async function parseCsv({
  file,
  mappings,
  preview = false,
}: CsvParseOptions): Promise<ParseResult<Record<string, string>>> {
  console.log(`[csv-parser] Parsing CSV: ${file.name} (${file.size} bytes)`);

  const text = await file.text();

  return new Promise((resolve) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      delimiter: '',
      preview: preview ? 20 : undefined,
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        const errors: ValidationError[] = [];
        const rows: Record<string, string>[] = [];
        const warnings: string[] = [];
        let rowIndex = 1;

        const headers = results.meta.fields ?? [];
        console.log(`[csv-parser] Headers detectados: [${headers.join(', ')}]`);
        console.log(`[csv-parser] Filas totales (pre-parsing): ${results.data.length}`);

        for (const rawRow of results.data as Record<string, string>[]) {
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

        // Collect PapaParse-level errors
        for (const err of results.errors ?? []) {
          const errorRow = (err.row ?? 0) + 2;
          errors.push({
            row: errorRow,
            column: 'general',
            message: `Error de parseo en fila ${errorRow}: ${err.message}`,
            value: undefined,
          });
        }

        const errorRows = new Set(errors.map((e) => e.row));

        console.log(`[csv-parser] Filas parseadas: ${rows.length}, errores: ${errors.length}`);

        resolve({
          success: errors.length === 0,
          data: rows,
          errors,
          warnings,
          stats: {
            totalRows: rows.length,
            validRows: rows.length - errorRows.size,
            invalidRows: errorRows.size,
          },
        });
      },
      error: (err: { message: string }) => {
        console.error(`[csv-parser] Error fatal: ${err.message}`);
        resolve({
          success: false,
          data: [],
          errors: [
            {
              row: 0,
              column: 'general',
              message: `Error al parsear CSV: ${err.message}`,
              value: undefined,
            },
          ],
          warnings: [],
          stats: { totalRows: 0, validRows: 0, invalidRows: 1 },
        });
      },
    });
  });
}
