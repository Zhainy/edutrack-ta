import * as XLSX from 'xlsx';
import type { ParseResult, ValidationError } from '../types';
import type { SyllabusModule } from '@/entities/syllabus';

function parseDate(dateStr: string): string {
  if (!dateStr) return '';
  const m = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) {
    const d = m[1], month = m[2], y = m[3];
    return `${y}-${month.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return dateStr;
}

interface RawModuleEntry {
  moduleNumber: number;
  moduleName: string;
  learningOutcome: string;
  day: number;
  syncHours: number;
  asyncHours: number;
  date: string;
  schedule: string;
}

export async function parseSyllabusXLSX(file: File, cohortId?: string): Promise<ParseResult<SyllabusModule>> {
  console.log(`[syllabus-parser] Parsing syllabus XLSX: ${file.name}`);

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
    const moduleEntries: RawModuleEntry[] = [];
    let currentModule: { number: number; name: string } | null = null;

    for (let r = 28; r < data.length; r++) {
      const row = data[r];
      if (!row || row.length < 4) continue;

      const colA = String(row[0] ?? '').trim();
      const colB = String(row[1] ?? '').trim();
      const colC = String(row[2] ?? '').trim();  // Learning outcome
      const colD = String(row[3] ?? '').trim();  // Day
      const colE = String(row[4] ?? '').trim();  // Sync hours
      const colF = String(row[5] ?? '').trim();  // Async hours
      const colG = String(row[6] ?? '').trim();  // Date
      const colH = String(row[7] ?? '').trim();  // Schedule

      const moduleMatch = colA.match(/M[oó]dulo\s*N[°º]\s*(\d+)/i);
      if (moduleMatch) {
        currentModule = {
          number: parseInt(moduleMatch[1], 10),
          name: colB || '',
        };
      }

      if (!currentModule) continue;

      // Skip rows without a date (total/summary rows, empty rows)
      if (!colG) continue;

      const day = parseInt(colD, 10);
      const syncHours = parseFloat(colE.replace(',', '.')) || 0;
      const asyncHours = parseFloat(colF.replace(',', '.')) || 0;

      moduleEntries.push({
        moduleNumber: currentModule.number,
        moduleName: currentModule.name,
        learningOutcome: colC,
        day: isNaN(day) ? 0 : day,
        syncHours,
        asyncHours,
        date: parseDate(colG),
        schedule: colH,
      });
    }

    // ── Group by module and accumulate ───────────────────────────────────
    const moduleMap = new Map<number, RawModuleEntry[]>();
    for (const entry of moduleEntries) {
      const arr = moduleMap.get(entry.moduleNumber) ?? [];
      arr.push(entry);
      moduleMap.set(entry.moduleNumber, arr);
    }

    const modules: SyllabusModule[] = [];
    for (const [modNum, entries] of moduleMap) {
      const name = entries.find((e) => e.moduleName)?.moduleName ?? `Módulo ${modNum}`;
      const dates = entries.map((e) => e.date).filter(Boolean);
      const totalSync = entries.reduce((s, e) => s + e.syncHours, 0);
      const totalAsync = entries.reduce((s, e) => s + e.asyncHours, 0);
      const totalHours = Math.round((totalSync + totalAsync) * 100) / 100;

      modules.push({
        id: crypto.randomUUID(),
        cohortId: cohortId ?? '',
        moduleNumber: modNum,
        moduleName: name,
        startDate: dates[0] ?? '',
        endDate: dates[dates.length - 1] ?? '',
        expectedHours: totalHours,
        activities: entries.map((e) => {
          const parts: string[] = [];
          if (e.day) parts.push(`Día ${e.day}`);
          if (e.learningOutcome) parts.push(e.learningOutcome);
          if (e.schedule) parts.push(e.schedule);
          if (e.date) parts.push(e.date);
          if (e.syncHours > 0) parts.push(`${e.syncHours}h sinc.`);
          if (e.asyncHours > 0) parts.push(`${e.asyncHours}h asinc.`);
          return parts.join(' — ');
        }),
        createdAt: new Date().toISOString(),
      });
    }

    modules.sort((a, b) => a.moduleNumber - b.moduleNumber);

    if (modules.length === 0) {
      errors.push({
        row: 0,
        column: 'general',
        message: 'No se encontraron módulos en el archivo',
        value: undefined,
      });
    }

    return {
      success: errors.length === 0,
      data: modules,
      errors,
      warnings: [],
      stats: {
        totalRows: modules.length,
        validRows: modules.length,
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
