import Papa from 'papaparse';
import type { ColumnMapping, ParseResult, ValidationError } from '../types';
import type { ProgressRecord } from '@/entities/progress';

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
// Statuses: "Finalizado (ha alcanzado...)", "Finalizado (no ha alcanzado...)", "Finalizado", "No finalizado"
// Dates: "jueves, 14 de mayo de 2026, 19:43"

function parseSpanishDate(dateStr: string): string | null {
  if (!dateStr) return null;

  const months: Record<string, number> = {
    enero: 0, febrero: 1, marzo: 2, abril: 3,
    mayo: 4, junio: 5, julio: 6, agosto: 7,
    septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
  };

  const match = dateStr.match(
    /(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})(?:,\s+(\d{1,2}):(\d{2}))?/
  );
  if (match) {
    const day = parseInt(match[1], 10);
    const month = months[match[2].toLowerCase()];
    const year = parseInt(match[3], 10);
    if (month !== undefined) {
      const date = new Date(year, month, day);
      return date.toISOString().split('T')[0];
    }
  }

  const shortMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (shortMatch) {
    const day = parseInt(shortMatch[1], 10);
    const month = parseInt(shortMatch[2], 10) - 1;
    const year = parseInt(shortMatch[3], 10);
    return new Date(year, month, day).toISOString().split('T')[0];
  }

  return null;
}

function extractModuleNumber(activityName: string): number | null {
  const moduleMatch = activityName.match(/m[oó]dulo\s*(\d+)/i);
  if (moduleMatch) return parseInt(moduleMatch[1], 10);

  const classMatch = activityName.match(/clase\s*(\d+)/i);
  if (classMatch) {
    const classNum = parseInt(classMatch[1], 10);
    if (classNum <= 3) return 1;
    if (classNum <= 14) return 2;
    if (classNum <= 22) return 3;
    if (classNum <= 31) return 4;
    if (classNum <= 39) return 5;
    if (classNum <= 49) return 6;
    if (classNum <= 61) return 7;
    if (classNum <= 66) return 8;
    return 9;
  }

  return null;
}

export async function parseProgressCSV(
  file: File
): Promise<ParseResult<ProgressRecord>> {
  console.log(`[csv-parser] Parsing progress CSV: ${file.name}`);

  const text = await file.text();

  return new Promise((resolve) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: false,
      complete: (results) => {
        const errors: ValidationError[] = [];
        const records: ProgressRecord[] = [];
        const warnings: string[] = [];
        const headers = results.meta.fields ?? [];
        const dataRows = results.data as Record<string, unknown>[];
        const totalRows = dataRows.length;
        let validRows = 0;
        let invalidRows = 0;

        const emailCol = headers[0];
        const activityColumns = headers.slice(1);

        dataRows.forEach((row, index) => {
          const rowIndex = index + 2;

          try {
            const email = String(row[emailCol] ?? '').trim();
            if (!email) {
              errors.push({
                row: rowIndex,
                column: emailCol,
                message: 'Email es requerido',
                value: row[emailCol],
              });
              invalidRows++;
              return;
            }

            for (let i = 0; i < activityColumns.length; i += 2) {
              const statusColumn = activityColumns[i];
              const dateColumn = activityColumns[i + 1];
              if (!statusColumn) continue;

              const status = String(row[statusColumn] ?? '').trim();
              const dateStr = String(row[dateColumn] ?? '').trim();
              const isCompleted = status.includes('Finalizado');
              if (!isCompleted) continue;

              const completionDate = dateStr ? parseSpanishDate(dateStr) : null;
              const approved = status.includes('ha alcanzado');

              records.push({
                id: crypto.randomUUID(),
                studentId: '',
                studentEmail: email,
                activityName: statusColumn,
                moduleNumber: extractModuleNumber(statusColumn) ?? undefined,
                completed: isCompleted,
                completionDate: completionDate ?? undefined,
                score: approved ? 100 : null as unknown as undefined,
                status,
                uploadedAt: new Date().toISOString(),
              });
            }

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
        });

        resolve({
          success: invalidRows === 0,
          data: records,
          errors,
          warnings,
          stats: { totalRows, validRows, invalidRows },
        });
      },
      error: (err: { message: string }) => {
        resolve({
          success: false,
          data: [],
          errors: [{ row: 0, column: 'CSV', message: `Error parseando CSV: ${err.message}`, value: null }],
          warnings: [],
          stats: { totalRows: 0, validRows: 0, invalidRows: 0 },
        });
      },
    });
  });
}
