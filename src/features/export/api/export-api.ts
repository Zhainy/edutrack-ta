import { db } from '@/shared/lib/database';
import { calculateRisk } from '@/features/risk-engine';
import type { Student } from '@/entities';

export interface ExportData {
  headers: string[];
  rows: string[][];
}

export async function getAttendanceExportData(cohortId: string): Promise<ExportData> {
  const students = await db.students.where('cohortId').equals(cohortId).toArray();
  const attendance = await db.attendance.toArray();

  const headers = [
    'Nombre',
    'Rut',
    'Email',
    'Estado',
    'Total Clases',
    'Presentes',
    'Ausentes',
    'Tardanzas',
    'Justificados',
    '% Asistencia',
  ];

  const rows = students.map((s) => {
    const records = attendance.filter((a) => a.studentId === s.id);
    const total = records.length;
    const present = records.filter((a) => a.status === 'present').length;
    const absent = records.filter((a) => a.status === 'absent').length;
    const late = records.filter((a) => a.status === 'late').length;
    const excused = records.filter((a) => a.status === 'excused').length;
    const rate = total > 0 ? ((present + late) / total) * 100 : 0;

    return [
      s.fullName,
      s.metadata?.rut ?? '—',
      s.email ?? '—',
      statusLabel(s.status),
      String(total),
      String(present),
      String(absent),
      String(late),
      String(excused),
      `${rate.toFixed(1)}%`,
    ];
  });

  return { headers, rows };
}

export async function getProgressExportData(cohortId: string): Promise<ExportData> {
  const students = await db.students.where('cohortId').equals(cohortId).toArray();
  const progress = await db.progress.toArray();
  const syllabus = await db.syllabus.where('cohortId').equals(cohortId).toArray();

  const headers = [
    'Nombre',
    'Email',
    'Actividades Completadas',
    'Actividades Totales',
    '% Progreso',
    'Última Actividad',
  ];

  const rows = students.map((s) => {
    const records = progress.filter((p) => p.studentId === s.id);
    const completed = records.filter((p) => p.completed).length;
    const total = syllabus.reduce((sum, m) => sum + m.activities.length, 0) || records.length;
    const pct = total > 0 ? (completed / total) * 100 : 0;
    const dates = records
      .filter((p) => p.completionDate)
      .map((p) => p.completionDate!)
      .sort()
      .reverse();
    const lastActivity = dates.length > 0 ? dates[0] : '—';

    return [
      s.fullName,
      s.email ?? '—',
      String(completed),
      String(total),
      `${pct.toFixed(1)}%`,
      lastActivity,
    ];
  });

  return { headers, rows };
}

export async function getRiskExportData(cohortId: string): Promise<ExportData> {
  const students = await db.students.where('cohortId').equals(cohortId).toArray();
  const allAttendance = await db.attendance.toArray();
  const allDedication = await db.dedication.toArray();
  const allProgress = await db.progress.toArray();
  const syllabus = await db.syllabus.where('cohortId').equals(cohortId).toArray();

  const headers = [
    'Nombre',
    'Rut',
    'Email',
    'Estado',
    '% Asistencia',
    '% Horas',
    '% Progreso',
    'Riesgo',
    'Nivel',
    'Factores',
  ];

  const rows = await Promise.all(
    students.map(async (s) => {
      const attendance = allAttendance.filter((a) => a.studentId === s.id);
      const dedication = allDedication.filter((d) => d.studentId === s.id);
      const progress = allProgress.filter((p) => p.studentId === s.id);

      const risk = calculateRisk({
        student: s,
        attendance,
        progress,
        dedication,
        syllabus,
        referenceDate: new Date(),
        allCohortProgress: allProgress,
      });

      const totalHours = dedication.reduce((sum, d) => sum + d.hours, 0);
      const presentClasses = attendance.filter(
        (a) => a.status === 'present' || a.status === 'late'
      ).length;
      const attRate = attendance.length > 0 ? (presentClasses / attendance.length) * 100 : 0;
      const completed = progress.filter((p) => p.completed).length;
      const totalAct =
        syllabus.reduce((sum, m) => sum + m.activities.length, 0) || progress.length;
      const progPct = totalAct > 0 ? (completed / totalAct) * 100 : 0;

      return [
        s.fullName,
        s.metadata?.rut ?? '—',
        s.email ?? '—',
        statusLabel(s.status),
        `${attRate.toFixed(1)}%`,
        `${totalHours.toFixed(1)}h`,
        `${progPct.toFixed(1)}%`,
        String(risk.riskScore),
        riskLevelLabel(risk.riskLevel),
        risk.factors
          .slice(0, 3)
          .map((f) => f.description)
          .join('; '),
      ];
    })
  );

  return { headers, rows };
}

export async function getAttendancePrintData(
  cohortId: string,
  cohortName: string
): Promise<{
  title: string;
  subtitle: string;
  tables: Array<{ caption: string; headers: string[]; rows: string[][] }>;
}> {
  const data = await getAttendanceExportData(cohortId);
  return {
    title: 'Reporte de Asistencia',
    subtitle: `${cohortName} — Generado el ${new Date().toLocaleDateString('es-CL')}`,
    tables: [{ caption: 'Resumen de Asistencia por Estudiante', ...data }],
  };
}

export async function getProgressPrintData(
  cohortId: string,
  cohortName: string
): Promise<{
  title: string;
  subtitle: string;
  tables: Array<{ caption: string; headers: string[]; rows: string[][] }>;
}> {
  const data = await getProgressExportData(cohortId);
  return {
    title: 'Reporte de Progreso',
    subtitle: `${cohortName} — Generado el ${new Date().toLocaleDateString('es-CL')}`,
    tables: [{ caption: 'Progreso por Estudiante', ...data }],
  };
}

export async function getRiskPrintData(
  cohortId: string,
  cohortName: string
): Promise<{
  title: string;
  subtitle: string;
  tables: Array<{ caption: string; headers: string[]; rows: string[][] }>;
}> {
  const data = await getRiskExportData(cohortId);
  return {
    title: 'Reporte de Riesgo',
    subtitle: `${cohortName} — Generado el ${new Date().toLocaleDateString('es-CL')}`,
    tables: [{ caption: 'Evaluación de Riesgo por Estudiante', ...data }],
  };
}

function statusLabel(status: Student['status']): string {
  const map: Record<Student['status'], string> = {
    active: 'Activo',
    dropout: 'Desertor',
    inactive: 'Inactivo',
    replacement: 'Reemplazo',
  };
  return map[status] ?? status;
}

function riskLevelLabel(level: string): string {
  const map: Record<string, string> = {
    low: 'Bajo',
    medium: 'Medio',
    high: 'Alto',
  };
  return map[level] ?? level;
}
