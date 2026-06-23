import { db } from '@/shared/lib/database';
import { calculateRisk } from '@/features/risk-engine';
import type { Student, AttendanceRecord } from '@/entities';

export interface CohortAnalytics {
  totalStudents: number;
  activeStudents: number;
  dropoutStudents: number;
  averageAttendance: number;
  averageHours: number;
  averageRiskScore: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  weeklyAttendance: Array<{
    week: string;
    date: string;
    attendanceRate: number;
    presentCount: number;
    totalClasses: number;
  }>;
  topPerformers: Array<{
    student: Student;
    attendance: number;
    hours: number;
    riskScore: number;
  }>;
  atRiskStudents: Array<{
    student: Student;
    attendance: number;
    hours: number;
    riskScore: number;
    mainFactor: string;
  }>;
}

export async function getCohortAnalytics(cohortId: string): Promise<CohortAnalytics> {
  const students = await db.students
    .where('cohortId')
    .equals(cohortId)
    .toArray();

  const allAttendance = await db.attendance.toArray();
  const allDedication = await db.dedication.toArray();
  const allProgress = await db.progress.toArray();
  const syllabus = await db.syllabus
    .where('cohortId')
    .equals(cohortId)
    .toArray();

  const studentMetrics = await Promise.all(
    students.map(async (student) => {
      const attendance = allAttendance.filter(a => a.studentId === student.id);
      const dedication = allDedication.filter(d => d.studentId === student.id);
      const progress = allProgress.filter(p => p.studentId === student.id);

      const risk = calculateRisk({
        student,
        attendance,
        progress,
        dedication,
        syllabus,
        referenceDate: new Date(),
        allCohortProgress: allProgress,
      });

      const totalHours = dedication.reduce((sum, d) => sum + d.hours, 0);
      const presentClasses = attendance.filter(a =>
        a.status === 'present' || a.status === 'late'
      ).length;
      const attendanceRate = attendance.length > 0
        ? (presentClasses / attendance.length) * 100
        : 0;

      return {
        student,
        risk,
        totalHours,
        attendanceRate,
      };
    })
  );

  const riskDistribution = {
    low: studentMetrics.filter(m => m.risk.riskLevel === 'low').length,
    medium: studentMetrics.filter(m => m.risk.riskLevel === 'medium').length,
    high: studentMetrics.filter(m => m.risk.riskLevel === 'high').length,
  };

  const weeklyAttendance = calculateWeeklyAttendance(allAttendance, students);

  const averageAttendance = studentMetrics.length > 0
    ? studentMetrics.reduce((sum, m) => sum + m.attendanceRate, 0) / studentMetrics.length
    : 0;

  const averageHours = studentMetrics.length > 0
    ? studentMetrics.reduce((sum, m) => sum + m.totalHours, 0) / studentMetrics.length
    : 0;

  const averageRiskScore = studentMetrics.length > 0
    ? studentMetrics.reduce((sum, m) => sum + m.risk.riskScore, 0) / studentMetrics.length
    : 0;

  const topPerformers = [...studentMetrics]
    .sort((a, b) => b.attendanceRate - a.attendanceRate || a.risk.riskScore - b.risk.riskScore)
    .slice(0, 5)
    .map(m => ({
      student: m.student,
      attendance: m.attendanceRate,
      hours: m.totalHours,
      riskScore: m.risk.riskScore,
    }));

  const atRiskStudents = [...studentMetrics]
    .sort((a, b) => b.risk.riskScore - a.risk.riskScore || a.attendanceRate - b.attendanceRate)
    .slice(0, 5)
    .map(m => ({
      student: m.student,
      attendance: m.attendanceRate,
      hours: m.totalHours,
      riskScore: m.risk.riskScore,
      mainFactor: m.risk.factors[0]?.description || 'Sin factores',
    }));

  return {
    totalStudents: students.length,
    activeStudents: students.filter(s => s.status === 'active' || s.status === 'replacement').length,
    dropoutStudents: students.filter(s => s.status === 'dropout').length,
    averageAttendance,
    averageHours,
    averageRiskScore,
    riskDistribution,
    weeklyAttendance,
    topPerformers,
    atRiskStudents,
  };
}

function calculateWeeklyAttendance(
  attendance: AttendanceRecord[],
  _students: Student[]
): CohortAnalytics['weeklyAttendance'] {
  const weeklyData = new Map<string, {
    present: number;
    total: number;
    firstDate: string;
  }>();

  for (const record of attendance) {
    const date = new Date(record.date);
    const weekKey = getWeekKey(date);

    if (!weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, {
        present: 0,
        total: 0,
        firstDate: record.date,
      });
    }

    const week = weeklyData.get(weekKey)!;
    week.total++;

    if (record.status === 'present' || record.status === 'late') {
      week.present++;
    }
  }

  return Array.from(weeklyData.entries())
    .map(([week, data]) => ({
      week,
      date: data.firstDate,
      attendanceRate: data.total > 0 ? (data.present / data.total) * 100 : 0,
      presentCount: data.present,
      totalClasses: data.total,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1));
  return d.toISOString().split('T')[0];
}
