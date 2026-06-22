import type { RiskInput, RiskOutput, RiskFactor, RiskMetrics } from '../types';
import { RISK_THRESHOLDS, FACTOR_WEIGHTS } from '../config/thresholds';

/**
 * Calculates the dropout/failure risk score for a student.
 * Pure deterministic function — same inputs always produce same output.
 */
export function calculateRisk(input: RiskInput): RiskOutput {
  const { attendance, progress, dedication, syllabus, referenceDate } = input;

  const factors: RiskFactor[] = [];
  let totalScore = 0;

  // ── Step 1: Hours completion rate ────────────────────────────────────────
  const refDateMs = referenceDate.getTime();

  const expectedHours = syllabus
    .filter((s) => new Date(s.endDate).getTime() <= refDateMs)
    .reduce((sum, s) => sum + s.expectedHours, 0);

  const actualHours = dedication
    .filter((d) => new Date(d.date).getTime() <= refDateMs)
    .reduce((sum, d) => sum + d.hours, 0);

  const completionRate = expectedHours > 0 ? (actualHours / expectedHours) * 100 : 100;

  if (completionRate < RISK_THRESHOLDS.hours.critical) {
    factors.push({
      category: 'hours',
      severity: 'high',
      description: `Progreso de horas muy bajo (${completionRate.toFixed(1)}%)`,
      weight: FACTOR_WEIGHTS.hours,
    });
    totalScore += 40;
  } else if (completionRate < RISK_THRESHOLDS.hours.warning) {
    factors.push({
      category: 'hours',
      severity: 'medium',
      description: `Progreso de horas por debajo del esperado (${completionRate.toFixed(1)}%)`,
      weight: FACTOR_WEIGHTS.hours,
    });
    totalScore += 20;
  }

  // ── Step 2: Attendance rate ───────────────────────────────────────────────
  const relevantAttendance = attendance.filter(
    (a) => new Date(a.date).getTime() <= refDateMs
  );
  const presentDays = relevantAttendance.filter(
    (a) => a.status === 'present' || a.status === 'late'
  ).length;
  const totalDays = relevantAttendance.length;
  const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 100;

  if (attendanceRate < RISK_THRESHOLDS.attendance.critical) {
    factors.push({
      category: 'attendance',
      severity: 'high',
      description: `Asistencia muy baja (${attendanceRate.toFixed(1)}%)`,
      weight: FACTOR_WEIGHTS.attendance,
    });
    totalScore += 30;
  } else if (attendanceRate < RISK_THRESHOLDS.attendance.warning) {
    factors.push({
      category: 'attendance',
      severity: 'medium',
      description: `Asistencia irregular (${attendanceRate.toFixed(1)}%)`,
      weight: FACTOR_WEIGHTS.attendance,
    });
    totalScore += 15;
  }

  // ── Step 3: Activity completion ───────────────────────────────────────────
  const totalActivities = syllabus.reduce((sum, s) => sum + s.activities.length, 0);
  const completedActivities = progress.filter((p) => p.completed).length;
  const activityCompletion =
    totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 100;

  if (activityCompletion < RISK_THRESHOLDS.activities.critical) {
    factors.push({
      category: 'activities',
      severity: 'high',
      description: `Baja completitud de actividades (${activityCompletion.toFixed(1)}%)`,
      weight: FACTOR_WEIGHTS.activities,
    });
    totalScore += 30;
  } else if (activityCompletion < RISK_THRESHOLDS.activities.warning) {
    factors.push({
      category: 'activities',
      severity: 'medium',
      description: `Completitud de actividades mejorable (${activityCompletion.toFixed(1)}%)`,
      weight: FACTOR_WEIGHTS.activities,
    });
    totalScore += 15;
  }

  // ── Step 4: Velocity trend (last 14 days vs previous 14 days) ────────────
  const msPerDay = 1000 * 60 * 60 * 24;

  const last14Hours = dedication
    .filter((d) => {
      const diff = (refDateMs - new Date(d.date).getTime()) / msPerDay;
      return diff >= 0 && diff <= 14;
    })
    .reduce((sum, d) => sum + d.hours, 0);

  const prev14Hours = dedication
    .filter((d) => {
      const diff = (refDateMs - new Date(d.date).getTime()) / msPerDay;
      return diff > 14 && diff <= 28;
    })
    .reduce((sum, d) => sum + d.hours, 0);

  let velocityTrend: RiskMetrics['velocityTrend'] = 'stable';
  if (last14Hours < prev14Hours * 0.7) {
    velocityTrend = 'declining';
    factors.push({
      category: 'engagement',
      severity: 'medium',
      description: 'Tendencia de dedicación decreciente',
      weight: FACTOR_WEIGHTS.engagement,
    });
    totalScore += 10;
  } else if (last14Hours > prev14Hours * 1.3) {
    velocityTrend = 'improving';
  }

  // ── Step 5: Days since last activity ─────────────────────────────────────
  const lastActivityMs =
    dedication.length > 0
      ? Math.max(...dedication.map((d) => new Date(d.date).getTime()))
      : null;

  const daysSinceLastActivity =
    lastActivityMs !== null
      ? Math.floor((refDateMs - lastActivityMs) / msPerDay)
      : 999;

  if (daysSinceLastActivity > RISK_THRESHOLDS.inactivity.critical) {
    factors.push({
      category: 'engagement',
      severity: 'high',
      description: `Sin actividad en los últimos ${daysSinceLastActivity} días`,
      weight: FACTOR_WEIGHTS.engagement,
    });
    totalScore += 20;
  }

  // ── Risk level ────────────────────────────────────────────────────────────
  const riskScore = Math.min(totalScore, 100);
  let riskLevel: RiskOutput['riskLevel'];
  if (riskScore >= RISK_THRESHOLDS.totalScore.high) {
    riskLevel = 'high';
  } else if (riskScore >= RISK_THRESHOLDS.totalScore.medium) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  // ── Recommendations ───────────────────────────────────────────────────────
  const recommendations: string[] = [];
  if (riskLevel === 'high') {
    recommendations.push('Contactar al estudiante de inmediato para evaluar situación');
  }
  if (factors.some((f) => f.category === 'hours')) {
    recommendations.push('Revisar barreras de acceso a la plataforma');
    recommendations.push('Ofrecer sesión de mentoría personalizada');
  }
  if (factors.some((f) => f.category === 'attendance')) {
    recommendations.push('Investigar causas de inasistencia');
    recommendations.push('Evaluar flexibilidad de horarios si aplica');
  }
  if (factors.some((f) => f.category === 'engagement')) {
    recommendations.push('Verificar motivación y objetivos del estudiante');
    recommendations.push('Conectar con casos de éxito para inspiración');
  }

  return {
    riskScore,
    riskLevel,
    metrics: {
      completionRate,
      attendanceRate,
      activityCompletion,
      velocityTrend,
      daysSinceLastActivity,
    },
    factors,
    recommendations,
  };
}
