import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { ParseResult, ValidationError } from '../types';

export interface RawStudentImport {
  rut?: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  [key: string]: unknown;
}

const HEADER_MAP: Record<string, string> = {
  rut: 'rut',
  r_u_t: 'rut',
  'r.u.t': 'rut',
  run: 'rut',
  nombre: 'nombre',
  nombres: 'nombre',
  nombre_completo: 'nombre',
  fullname: 'nombre',
  full_name: 'nombre',
  name: 'nombre',
  email: 'email',
  correo: 'email',
  mail: 'email',
  e_mail: 'email',
  telefono: 'telefono',
  fono: 'telefono',
  teléfono: 'telefono',
  celular: 'telefono',
  phone: 'telefono',
  movil: 'telefono',
  móvil: 'telefono',
};

function mapHeaders(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (const h of headers) {
    const key = h.trim().toLowerCase().replace(/[\s_-]+/g, '_');
    mapping[h] = HEADER_MAP[key] ?? key;
  }
  return mapping;
}

export async function parseStudentCSV(file: File): Promise<ParseResult<RawStudentImport>> {
  const text = await file.text();

  return new Promise((resolve) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      delimiter: '',
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        const errors: ValidationError[] = [];
        const rows: RawStudentImport[] = [];
        const warnings: string[] = [];
        const headers = results.meta.fields ?? [];
        const headerMapping = mapHeaders(headers);

        for (let i = 0; i < results.data.length; i++) {
          const rawRow = results.data[i] as Record<string, string>;
          const rowNum = i + 2;
          const mapped: RawStudentImport = {};

          for (const [orig, target] of Object.entries(headerMapping)) {
            const val = rawRow[orig];
            if (val !== undefined && val !== null && String(val).trim() !== '') {
              mapped[target] = String(val).trim();
            }
          }

          if (!mapped.nombre || !mapped.nombre.trim()) {
            errors.push({
              row: rowNum,
              column: 'nombre',
              message: `Nombre requerido en fila ${rowNum}`,
              value: mapped.nombre,
            });
          }

          if (!mapped.email || !mapped.email.trim()) {
            errors.push({
              row: rowNum,
              column: 'email',
              message: `Email requerido en fila ${rowNum}`,
              value: mapped.email,
            });
          }

          rows.push(mapped);
        }

        const errorRows = new Set(errors.map((e) => e.row));

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

function cleanName(name: string): string {
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
    .replace(/[\uFF95]/g, 'Ú')
    .replace(/[\uFF84]/g, 'é')
    .replace(/[\uFF9D]/g, 'ü')
    .trim();
}

export async function parseStudentXLSX(file: File): Promise<ParseResult<RawStudentImport>> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array', codepage: 65001, cellStyles: true });
    // Prefer "Lista" sheet if present, otherwise use first sheet
    const sheetName = workbook.SheetNames.includes('Lista')
      ? 'Lista'
      : workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      return {
        success: false,
        data: [],
        errors: [{
          row: 0,
          column: 'general',
          message: 'No se encontraron hojas en el archivo',
          value: undefined,
        }],
        warnings: [],
        stats: { totalRows: 0, validRows: 0, invalidRows: 1 },
      };
    }

    const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
      defval: '',
      raw: false,
    });

    const errors: ValidationError[] = [];
    const rows: RawStudentImport[] = [];
    const warnings: string[] = [];
    const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
    const headerMapping = mapHeaders(headers);

    for (let i = 0; i < jsonData.length; i++) {
      const rawRow = jsonData[i];
      const rowNum = i + 2;
      const mapped: RawStudentImport = {};

      for (const [orig, target] of Object.entries(headerMapping)) {
        const val = rawRow[orig];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          mapped[target] = cleanName(String(val).trim());
        }
      }

      if (!mapped.nombre || !mapped.nombre.trim()) {
        errors.push({
          row: rowNum,
          column: 'nombre',
          message: `Nombre requerido en fila ${rowNum}`,
          value: mapped.nombre,
        });
      }

      if (!mapped.email || !mapped.email.trim()) {
        errors.push({
          row: rowNum,
          column: 'email',
          message: `Email requerido en fila ${rowNum}`,
          value: mapped.email,
        });
      }

      rows.push(mapped);
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
    const message = err instanceof Error ? err.message : 'Error desconocido al leer XLSX';
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
