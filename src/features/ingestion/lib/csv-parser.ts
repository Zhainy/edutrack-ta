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

  const text = await readFileAsTextSafe(file);

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
  const name = activityName.toLowerCase();

  // Direct match on "módulo N"
  const moduleMatch = name.match(/m[oó]dulo\s*(\d+)/i);
  if (moduleMatch) return parseInt(moduleMatch[1], 10);

  // Match by activity content keywords
  if (name.includes('orientación') || name.includes('metodología') || name.includes('perfil')) return 1;
  if (name.includes('front-end') || name.includes('html') || name.includes('css') || name.includes('jquery') || name.includes('bootstrap')) return 2;
  if (name.includes('interfaz de usuario') || name.includes('interfaz web') || name.includes('preprocesador') || name.includes('sass') || name.includes('less')) return 3;
  if (name.includes('javascript básico') || name.includes('variables') || name.includes('funciones') || name.includes('objetos') || name.includes('estructuras')) return 4;
  if (name.includes('javascript avanzado') || name.includes('es6') || name.includes('dom') || name.includes('api') || name.includes('xhr')) return 5;
  if (name.includes('vue') && (name.includes('interfaz') || name.includes('componente') || name.includes('formulario') || name.includes('sintaxis'))) return 6;
  if (name.includes('vue') && (name.includes('avanzado') || name.includes('axios') || name.includes('aplicación'))) return 7;
  if (name.includes('portafolio') || name.includes('producto digital')) return 8;
  if (name.includes('empleabilidad') || name.includes('currículum') || name.includes('industria digital')) return 9;

  // Fallback: map by class number (66 total sync classes across 9 modules)
  const classMatch = name.match(/clase\s*(\d+)/i);
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

// ── UTF-16LE detection + decoding ─────────────────────────────────────────

async function readFileAsTextSafe(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Check for UTF-16LE BOM (FF FE)
  if (bytes[0] === 0xFF && bytes[1] === 0xFE) {
    const decoded = new TextDecoder('utf-16le').decode(buffer);
    return decoded.replace(/^\uFEFF/, '').replace(/\0/g, '');
  }

  // Check for UTF-16BE BOM (FE FF) — rare but handle it
  if (bytes[0] === 0xFE && bytes[1] === 0xFF) {
    const decoded = new TextDecoder('utf-16be').decode(buffer);
    return decoded.replace(/^\uFEFF/, '').replace(/\0/g, '');
  }

  // Check for UTF-8 BOM (EF BB BF)
  if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
    const decoded = new TextDecoder('utf-8').decode(buffer);
    return decoded.replace(/^\uFEFF/, '');
  }

  // Fallback: detect UTF-16LE by checking for null bytes between ASCII chars
  const sampleLen = Math.min(4096, bytes.length);
  const sample = bytes.slice(0, sampleLen);
  let nullCount = 0;
  let totalChecked = 0;
  for (let i = 1; i < sample.length; i += 2) {
    totalChecked++;
    if (sample[i] === 0x00) nullCount++;
  }
  if (totalChecked > 0 && nullCount > totalChecked * 0.25) {
    const decoded = new TextDecoder('utf-16le').decode(buffer);
    return decoded.replace(/^\uFEFF/, '').replace(/\0/g, '');
  }

  return new TextDecoder('utf-8').decode(buffer);
}

function normalizeHeaderName(name: string): string {
  return name.replace(/["]/g, '').replace(/\0/g, '').trim();
}

export async function parseProgressCSV(
  file: File
): Promise<ParseResult<ProgressRecord>> {
  console.log(`[csv-parser] Parsing progress CSV: ${file.name}`);

  try {
    const text = await readFileAsTextSafe(file);

    return new Promise((resolve) => {
      Papa.parse(text, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          const errors: ValidationError[] = [];
          const records: ProgressRecord[] = [];
          const warnings: string[] = [];
          const allRows = results.data as string[][];
          const totalRows = allRows.length;

          if (allRows.length < 2) {
            resolve({
              success: false,
              data: [],
              errors: [{ row: 0, column: 'CSV', message: 'El archivo no tiene suficientes filas', value: undefined }],
              warnings: [],
              stats: { totalRows: 0, validRows: 0, invalidRows: 1 },
            });
            return;
          }

          // Header row: col 0 = (empty / student name placeholder), col 1 = "Dirección de correo", col 2+ = activity status/date pairs
          const rawHeaders = allRows[0];
          const activityHeaders: string[] = [];

          for (let i = 0; i < rawHeaders.length; i++) {
            const h = normalizeHeaderName(rawHeaders[i] ?? '');
            activityHeaders.push(h);
          }

          const dataRows = allRows.slice(1);
          let validRows = 0;
          let invalidRows = 0;

          for (let rowIdx = 0; rowIdx < dataRows.length; rowIdx++) {
            const row = dataRows[rowIdx];
            const rowIndex = rowIdx + 2;

            try {
              if (!row || row.length < 2) continue;

              const email = String(row[1] ?? '').trim();

              if (!email) {
                errors.push({
                  row: rowIndex,
                  column: 'Dirección de correo',
                  message: 'Email es requerido',
                  value: email,
                });
                invalidRows++;
                continue;
              }

              // Process activity pairs starting at col 2
              for (let i = 2; i < row.length - 1; i += 2) {
                const statusColumn = activityHeaders[i];
                const status = String(row[i] ?? '').trim();
                const dateStr = String(row[i + 1] ?? '').trim();
                const isCompleted = status.includes('Finalizado');
                if (!isCompleted) continue;

                const completionDate = dateStr ? parseSpanishDate(dateStr) : null;
                const approved = status.includes('ha alcanzado');

                records.push({
                  id: crypto.randomUUID(),
                  studentId: '',
                  studentEmail: email,
                  activityName: statusColumn || `Actividad #${Math.floor(i / 2)}`,
                  moduleNumber: extractModuleNumber(statusColumn || '') ?? undefined,
                  completed: isCompleted,
                  completionDate: completionDate ?? undefined,
                  score: approved ? 100 : undefined,
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
          }

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
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return {
      success: false,
      data: [],
      errors: [{ row: 0, column: 'general', message: `Error al leer archivo: ${message}`, value: undefined }],
      warnings: [],
      stats: { totalRows: 0, validRows: 0, invalidRows: 1 },
    };
  }
}
