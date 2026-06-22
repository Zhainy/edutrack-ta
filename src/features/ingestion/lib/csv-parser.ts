import Papa from 'papaparse';
import type { ColumnMapping, ParseResult, ValidationError } from '../types';

export interface CsvParseOptions {
  file: File;
  mappings: ColumnMapping[];
  preview?: boolean;
}

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
          errors: [{
            row: 0,
            column: 'general',
            message: `Error al parsear CSV: ${err.message}`,
            value: undefined,
          }],
          warnings: [],
          stats: { totalRows: 0, validRows: 0, invalidRows: 1 },
        });
      },
    });
  });
}

// ── SENCE Progress CSV parser ────────────────────────────────────────────
// Format: Col A = email, Col B+ = activity status/date pairs

interface ProgressActivity {
  activityName: string;
  completed: boolean;
  completionDate: string | undefined;
}

export async function parseProgressCSV(
  file: File
): Promise<ParseResult<{ email: string; activities: ProgressActivity[] }>> {
  console.log(`[csv-parser] Parsing progress CSV: ${file.name}`);

  const text = await file.text();

  return new Promise((resolve) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: false,
      delimiter: '',
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        const errors: ValidationError[] = [];
        const rows: { email: string; activities: ProgressActivity[] }[] = [];
        const warnings: string[] = [];
        const headers = results.meta.fields ?? [];

        const emailCol = headers.find((h) => /correo|email|mail|direccion/i.test(h));
        if (!emailCol) {
          resolve({
            success: false,
            data: [],
            errors: [{ row: 0, column: 'general', message: 'No se encontró columna de email. Se esperaba: "Dirección de correo"', value: undefined }],
            warnings: [],
            stats: { totalRows: 0, validRows: 0, invalidRows: 1 },
          });
          return;
        }

        // Detect activity columns: every pair starting from index 1
        const activityHeaders = headers.slice(1);
        const activityNames: string[] = [];
        for (let h = 0; h < activityHeaders.length; h += 2) {
          if (activityHeaders[h]) {
            activityNames.push(activityHeaders[h]);
          }
        }

        for (let i = 0; i < results.data.length; i++) {
          const rawRow = results.data[i] as Record<string, string>;
          const email = String(rawRow[emailCol] ?? '').trim();

          if (!email) continue;

          const activities: ProgressActivity[] = [];
          for (let a = 0; a < activityNames.length; a++) {
            const nameIndex = headers.indexOf(activityNames[a]);
            const dateIndex = nameIndex + 1;

            const activityName = activityNames[a];
            const statusRaw = rawRow[headers[nameIndex]] ?? '';
            const dateRaw = dateIndex < headers.length ? (rawRow[headers[dateIndex]] ?? '') : '';

            const statusText = String(statusRaw).trim().toLowerCase();
            const completed =
              statusText.includes('finalizado') &&
              !statusText.includes('no finalizado') &&
              !statusText.includes('no ha alcanzado');

            const completionDate = dateRaw ? String(dateRaw).trim() : undefined;

            if (statusRaw && statusRaw.trim()) {
              activities.push({ activityName, completed, completionDate });
            }
          }

          rows.push({ email, activities });
        }

        if (rows.length === 0) {
          errors.push({ row: 0, column: 'general', message: 'No se encontraron estudiantes en el archivo', value: undefined });
        }

        resolve({
          success: errors.length === 0,
          data: rows,
          errors,
          warnings,
          stats: {
            totalRows: rows.length,
            validRows: rows.length,
            invalidRows: 0,
          },
        });
      },
      error: (err: { message: string }) => {
        resolve({
          success: false,
          data: [],
          errors: [{ row: 0, column: 'general', message: `Error al parsear CSV: ${err.message}`, value: undefined }],
          warnings: [],
          stats: { totalRows: 0, validRows: 0, invalidRows: 1 },
        });
      },
    });
  });
}
