import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  CalendarDays,
  ChevronRight,
  Edit3,
  Trash2,
  MessageSquare,
  UserCheck,
  FileText,
  GraduationCap,
} from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/empty-state';
import { Modal } from '@/shared/ui/modal';
import { toast } from '@/shared/ui/toast';
import { cn } from '@/shared/lib/utils';
import { formatDate, toISODate } from '@/shared/lib/date';
import { db } from '@/shared/lib/database';
import { calculateRisk } from '@/features/risk-engine';
import { getPendingActivities } from '@/features/students/lib/pending-activities';
import type { Student } from '@/entities/student';
import type { PendingActivity } from '@/features/students/lib/pending-activities';
import type { AttendanceRecord } from '@/entities/attendance';
import type { ProgressRecord } from '@/entities/progress';
import type { DedicationRecord } from '@/entities/dedication';
import type { SyllabusModule } from '@/entities/syllabus';
import type { Note } from '@/entities/note';
import type { RiskOutput } from '@/features/risk-engine';

// ── Helpers ──────────────────────────────────────────────────────────────

function statusVariant(s: Student['status']): 'active' | 'dropout' | 'inactive' {
  return s;
}

function riskBadgeVariant(l: RiskOutput['riskLevel']): 'risk-high' | 'risk-medium' | 'risk-low' {
  if (l === 'high') return 'risk-high';
  if (l === 'medium') return 'risk-medium';
  return 'risk-low';
}

function riskLabel(l: RiskOutput['riskLevel']): string {
  if (l === 'high') return 'Alto';
  if (l === 'medium') return 'Medio';
  return 'Bajo';
}

function noteTypeIcon(type: Note['type']) {
  switch (type) {
    case 'alert':
      return <AlertCircle size={14} strokeWidth={1.5} className="text-rose-400" />;
    case 'action':
      return <CheckCircle2 size={14} strokeWidth={1.5} className="text-amber-400" />;
    case 'context':
      return <FileText size={14} strokeWidth={1.5} className="text-sky-400" />;
    default:
      return <MessageSquare size={14} strokeWidth={1.5} className="text-slate-400" />;
  }
}

function noteTypeLabel(type: Note['type']): string {
  switch (type) {
    case 'alert':
      return 'Alerta';
    case 'action':
      return 'Acción';
    case 'context':
      return 'Contexto';
    default:
      return 'General';
  }
}

function priorityBadgeVariant(
  p: Note['priority']
): 'risk-high' | 'risk-medium' | 'risk-low' | 'info' {
  if (p === 'urgent' || p === 'high') return 'risk-high';
  if (p === 'medium') return 'risk-medium';
  return 'risk-low';
}

const ATTENDANCE_LABELS: Record<AttendanceRecord['status'], string> = {
  present: 'Presente',
  late: 'Tarde',
  absent: 'Ausente',
  excused: 'Justificado',
};

// ── KPI Card ─────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function KpiCard({ label, value, icon, color }: KpiCardProps) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-lg',
          color.replace('text-', 'bg-').replace(/-(\d+)$/, '-$1/15')
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className={cn('text-xl font-semibold font-mono', color)}>{value}</p>
      </div>
    </div>
  );
}

// ── Tab: Resumen ─────────────────────────────────────────────────────────

function RiskGauge({ score }: { score: number }) {
  const color =
    score >= 70 ? 'text-rose-400' : score >= 40 ? 'text-amber-400' : 'text-emerald-400';

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-900 border border-slate-800">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
        Score de Riesgo
      </p>
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 264} 264`}
            className={color}
          />
        </svg>
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center text-3xl font-bold font-mono',
            color
          )}
        >
          {score}
        </span>
      </div>
      <Badge variant={riskBadgeVariant(score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low')}>
        {riskLabel(score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low')}
      </Badge>
    </div>
  );
}

function ResumenTab({ risk }: { risk: RiskOutput | null }) {
  if (!risk) {
    return (
      <EmptyState
        icon={<AlertTriangle size={24} strokeWidth={1.5} />}
        title="Sin datos de riesgo"
        description="Este estudiante no tiene datos suficientes para calcular riesgo."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Score + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <RiskGauge score={risk.riskScore} />
        <KpiCard
          label="Horas Completadas"
          value={`${Math.round(risk.metrics.completionRate)}%`}
          icon={<Clock size={20} strokeWidth={1.5} />}
          color={
            risk.metrics.completionRate < 50
              ? 'text-rose-400'
              : risk.metrics.completionRate < 75
                ? 'text-amber-400'
                : 'text-emerald-400'
          }
        />
        <KpiCard
          label="Asistencia"
          value={`${Math.round(risk.metrics.attendanceRate)}%`}
          icon={<UserCheck size={20} strokeWidth={1.5} />}
          color={
            risk.metrics.attendanceRate < 70
              ? 'text-rose-400'
              : risk.metrics.attendanceRate < 85
                ? 'text-amber-400'
                : 'text-emerald-400'
          }
        />
        <KpiCard
          label="Actividades"
          value={`${Math.round(risk.metrics.activityCompletion)}%`}
          icon={<GraduationCap size={20} strokeWidth={1.5} />}
          color={
            risk.metrics.activityCompletion < 50
              ? 'text-rose-400'
              : risk.metrics.activityCompletion < 75
                ? 'text-amber-400'
                : 'text-emerald-400'
          }
        />
      </div>

      {/* Tendencia */}
      <Card variant="default" padding="md">
        <div className="flex items-center gap-2">
          {risk.metrics.velocityTrend === 'improving' ? (
            <TrendingUp size={20} strokeWidth={1.5} className="text-emerald-400" />
          ) : risk.metrics.velocityTrend === 'declining' ? (
            <TrendingDown size={20} strokeWidth={1.5} className="text-rose-400" />
          ) : (
            <Minus size={20} strokeWidth={1.5} className="text-slate-400" />
          )}
          <div>
            <p className="text-sm font-medium text-slate-200">Tendencia de Dedicación</p>
            <p className="text-xs text-slate-500">
              {risk.metrics.velocityTrend === 'improving'
                ? 'Mejorando — aumento de horas en los últimos 14 días'
                : risk.metrics.velocityTrend === 'declining'
                  ? 'Declinando — reducción de horas en los últimos 14 días'
                  : 'Estable — sin cambios significativos'}
            </p>
          </div>
        </div>
      </Card>

      {/* Factores de Riesgo */}
      <Card variant="default" padding="lg">
        <h4 className="text-sm font-semibold text-slate-300 mb-3">Factores de Riesgo</h4>
        {risk.factors.length === 0 ? (
          <p className="text-sm text-slate-500">Sin factores de riesgo detectados.</p>
        ) : (
          <div className="space-y-2">
            {risk.factors.map((factor, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-800"
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-6 h-6 rounded-full mt-0.5 flex-shrink-0',
                    factor.severity === 'high'
                      ? 'bg-rose-500/20 text-rose-400'
                      : factor.severity === 'medium'
                        ? 'bg-amber-400/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                  )}
                >
                  {factor.severity === 'high' ? (
                    <AlertCircle size={12} strokeWidth={1.5} />
                  ) : (
                    <AlertTriangle size={12} strokeWidth={1.5} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200">{factor.description}</p>
                  <p className="text-xs text-slate-500 mt-0.5 capitalize">
                    {factor.category} · Peso: {Math.round(factor.weight * 100)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recomendaciones */}
      {risk.recommendations.length > 0 && (
        <Card variant="default" padding="lg">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Recomendaciones</h4>
          <ul className="space-y-2">
            {risk.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                <ChevronRight size={16} strokeWidth={1.5} className="mt-0.5 text-indigo-400 flex-shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

// ── Tab: Asistencia ──────────────────────────────────────────────────────

function AsistenciaTab({ studentId }: { studentId: string }) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await db.attendance
        .where('studentId')
        .equals(studentId)
        .sortBy('date');
      if (!cancelled) {
        setRecords(data.reverse());
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const weeklyData = useMemo(() => {
    const weeks: Record<string, { present: number; late: number; absent: number; total: number }> =
      {};
    records.forEach((r) => {
      const weekStart = getWeekStart(r.date);
      if (!weeks[weekStart]) {
        weeks[weekStart] = { present: 0, late: 0, absent: 0, total: 0 };
      }
      weeks[weekStart][r.status === 'present' ? 'present' : r.status === 'late' ? 'late' : 'absent']++;
      weeks[weekStart].total++;
    });
    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-10)
      .map(([week, counts]) => ({
        week: formatDate(week, "d/M"),
        Presente: counts.present,
        Tarde: counts.late,
        Ausente: counts.absent,
      }));
  }, [records]);

  const counts = useMemo(() => {
    const present = records.filter((r) => r.status === 'present').length;
    const late = records.filter((r) => r.status === 'late').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const excused = records.filter((r) => r.status === 'excused').length;
    const total = records.length || 1;
    return {
      present,
      late,
      absent,
      excused,
      rate: Math.round(((present + late) / total) * 100),
    };
  }, [records]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="text" lines={1} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
          <p className="text-2xl font-bold font-mono text-emerald-400">{counts.present}</p>
          <p className="text-xs text-slate-500 mt-1">Presente</p>
        </div>
        <div className="p-3 rounded-lg bg-amber-400/10 border border-amber-400/20 text-center">
          <p className="text-2xl font-bold font-mono text-amber-400">{counts.late}</p>
          <p className="text-xs text-slate-500 mt-1">Tarde</p>
        </div>
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center">
          <p className="text-2xl font-bold font-mono text-rose-400">{counts.absent}</p>
          <p className="text-xs text-slate-500 mt-1">Ausente</p>
        </div>
        <div className="p-3 rounded-lg bg-slate-800 border border-slate-700 text-center">
          <p className="text-2xl font-bold font-mono text-slate-300">{counts.rate}%</p>
          <p className="text-xs text-slate-500 mt-1">Asistencia</p>
        </div>
      </div>

      {/* Weekly chart */}
      {weeklyData.length > 0 && (
        <Card variant="default" padding="lg">
          <h4 className="text-sm font-semibold text-slate-300 mb-4">Asistencia por Semana</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                  fontSize: 13,
                }}
                cursor={{ fill: '#334155', opacity: 0.4 }}
              />
              <Bar dataKey="Presente" stackId="a" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Tarde" stackId="a" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Ausente" stackId="a" fill="#f43f5e" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Records table */}
      <Card variant="default" padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8">
                    <EmptyState title="Sin registros" description="No hay datos de asistencia." />
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-300 font-mono">
                      {formatDate(r.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                          r.status === 'present'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : r.status === 'late'
                              ? 'bg-amber-400/20 text-amber-300'
                              : r.status === 'absent'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-slate-500/20 text-slate-300'
                        )}
                      >
                        {r.status === 'present' && <CheckCircle2 size={12} strokeWidth={1.5} />}
                        {r.status === 'late' && <Clock size={12} strokeWidth={1.5} />}
                        {r.status === 'absent' && <XCircle size={12} strokeWidth={1.5} />}
                        {ATTENDANCE_LABELS[r.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{r.notes ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return toISODate(d);
}

// ── Tab: Progreso ────────────────────────────────────────────────────────

function ProgresoTab({
  studentId,
  syllabus,
}: {
  studentId: string;
  syllabus: SyllabusModule[];
}) {
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await db.progress.where('studentId').equals(studentId).toArray();
      if (!cancelled) {
        setProgress(data);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const stats = useMemo(() => {
    const total = progress.length;
    const completed = progress.filter((p) => p.completed).length;
    return { total, completed, rate: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [progress]);

  const modulesWithProgress = useMemo(() => {
    return syllabus.map((mod) => {
      const moduleProgress = progress.filter((p) => p.moduleNumber === mod.moduleNumber);
      const completed = moduleProgress.filter((p) => p.completed).length;
      const total = moduleProgress.length;
      return {
        ...mod,
        activities: moduleProgress.map((p) => ({
          name: p.activityName,
          completed: p.completed,
          score: p.score,
          completionDate: p.completionDate,
        })),
        completed,
        total,
        rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  }, [syllabus, progress]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="text" lines={3} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <Card variant="default" padding="md">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-300">Progreso General</p>
          <p className="text-sm font-mono text-slate-400">
            {stats.completed}/{stats.total} actividades
          </p>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all"
            style={{ width: `${stats.rate}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">{stats.rate}% completado</p>
      </Card>

      {/* Per module */}
      {modulesWithProgress.map((mod) => (
        <Card key={mod.id} variant="default" padding="md">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Módulo {mod.moduleNumber}: {mod.moduleName}
              </p>
              <p className="text-xs text-slate-500">
                {formatDate(mod.startDate)} — {formatDate(mod.endDate)}
              </p>
            </div>
            <p className="text-sm font-mono text-slate-400">
              {mod.completed}/{mod.total}
            </p>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-3">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                mod.rate === 100
                  ? 'bg-emerald-500'
                  : mod.rate >= 50
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
              )}
              style={{ width: `${mod.rate}%` }}
            />
          </div>
          <div className="space-y-1">
            {mod.activities.map((act) => (
              <div
                key={act.name}
                className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {act.completed ? (
                    <CheckCircle2 size={14} strokeWidth={1.5} className="text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Clock size={14} strokeWidth={1.5} className="text-slate-600 flex-shrink-0" />
                  )}
                  <span
                    className={cn(
                      'text-sm truncate',
                      act.completed ? 'text-slate-300' : 'text-slate-500'
                    )}
                  >
                    {act.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {act.score !== undefined && (
                    <span className="text-xs font-mono text-slate-400">{act.score}pts</span>
                  )}
                  {act.completionDate && (
                    <span className="text-xs text-slate-600">{formatDate(act.completionDate)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {modulesWithProgress.length === 0 && (
        <EmptyState
          icon={<FileText size={24} strokeWidth={1.5} />}
          title="Sin syllabus"
          description="No hay módulos definidos para esta cohorte."
        />
      )}
    </div>
  );
}

// ── Tab: Dedicación ──────────────────────────────────────────────────────

function DedicacionTab({
  studentId,
  syllabus,
}: {
  studentId: string;
  syllabus: SyllabusModule[];
}) {
  const [dedication, setDedication] = useState<DedicationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await db.dedication
        .where('studentId')
        .equals(studentId)
        .sortBy('date');
      if (!cancelled) {
        setDedication(data);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const chartData = useMemo(() => {
    const sorted = [...dedication].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sorted.slice(-30).map((d) => ({
      date: formatDate(d.date, 'd/M'),
      horas: d.hours,
    }));
  }, [dedication]);

  const totals = useMemo(() => {
    const actualHours = dedication.reduce((sum, d) => sum + d.hours, 0);
    const expectedHours = syllabus
      .filter((m) => new Date(m.endDate) <= new Date())
      .reduce((sum, m) => sum + m.expectedHours, 0);
    return { actualHours: Math.round(actualHours * 100) / 100, expectedHours };
  }, [dedication, syllabus]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} variant="text" lines={3} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4">
        <KpiCard
          label="Horas Acumuladas"
          value={totals.actualHours}
          icon={<Clock size={20} strokeWidth={1.5} />}
          color="text-sky-400"
        />
        <KpiCard
          label="Horas Esperadas"
          value={totals.expectedHours}
          icon={<CalendarDays size={20} strokeWidth={1.5} />}
          color="text-slate-400"
        />
      </div>

      {/* Line chart */}
      {chartData.length > 0 && (
        <Card variant="default" padding="lg">
          <h4 className="text-sm font-semibold text-slate-300 mb-4">Horas por Día (Últimos 30 días)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                unit="h"
              />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                  fontSize: 13,
                }}
                cursor={{ stroke: '#334155', strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="horas"
                stroke="#818cf8"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#818cf8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {chartData.length === 0 && (
        <EmptyState
          icon={<Clock size={24} strokeWidth={1.5} />}
          title="Sin datos de dedicación"
          description="No hay registros de horas dedicadas."
        />
      )}
    </div>
  );
}

// ── Tab: Notas y Seguimiento ────────────────────────────────────────────

function NotasTab({ studentId }: { studentId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // New note form
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formType, setFormType] = useState<Note['type']>('general');
  const [formPriority, setFormPriority] = useState<Note['priority']>('medium');
  const [formDueDate, setFormDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadNotes = useCallback(async () => {
    const data = await db.notes
      .where('studentId')
      .equals(studentId)
      .reverse()
      .sortBy('createdAt');
    setNotes(data);
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      if (typeFilter !== 'all' && n.type !== typeFilter) return false;
      if (priorityFilter !== 'all' && n.priority !== priorityFilter) return false;
      return true;
    });
  }, [notes, typeFilter, priorityFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    setSubmitting(true);
    const now = new Date().toISOString();
    const note: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      studentId,
      type: formType,
      priority: formPriority,
      title: formTitle.trim(),
      content: formContent.trim() || undefined,
      dueDate: formDueDate || undefined,
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
    };
    await db.notes.put(note);
    toast.success('Nota agregada');
    setFormTitle('');
    setFormContent('');
    setFormType('general');
    setFormPriority('medium');
    setFormDueDate('');
    setShowForm(false);
    setSubmitting(false);
    void loadNotes();
  };

  const handleDelete = async (id: string) => {
    await db.notes.delete(id);
    toast.success('Nota eliminada');
    void loadNotes();
  };

  const handleToggleComplete = async (note: Note) => {
    if (note.isCompleted) {
      await db.notes.update(note.id, {
        isCompleted: false,
        completedAt: undefined,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await db.notes.update(note.id, {
        isCompleted: true,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    void loadNotes();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="text" lines={2} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* New note button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {filteredNotes.length} {filteredNotes.length === 1 ? 'nota' : 'notas'}
        </p>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={16} strokeWidth={1.5} />}
          onClick={() => setShowForm(true)}
        >
          Nueva Nota
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="flex rounded-lg border border-slate-700 bg-slate-800/50 p-0.5">
          {(['all', 'alert', 'action', 'context', 'general'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
                typeFilter === t
                  ? 'bg-slate-700 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              {t === 'all' ? 'Todas' : noteTypeLabel(t)}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg border border-slate-700 bg-slate-800/50 p-0.5">
          {(['all', 'urgent', 'high', 'medium', 'low'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
                priorityFilter === p
                  ? 'bg-slate-700 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              {p === 'all' ? 'Todas' : p === 'urgent' ? 'Urgente' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {filteredNotes.length === 0 ? (
          <EmptyState
            icon={<MessageSquare size={24} strokeWidth={1.5} />}
            title="Sin notas"
            description={
              notes.length === 0
                ? 'Aún no hay notas registradas para este estudiante.'
                : 'No hay notas que coincidan con los filtros.'
            }
            action={
              <Button variant="primary" size="sm" leftIcon={<Plus size={16} strokeWidth={1.5} />} onClick={() => setShowForm(true)}>
                Crear primera nota
              </Button>
            }
          />
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={cn(
                'flex items-start gap-3 p-4 rounded-xl border transition-colors',
                note.isCompleted
                  ? 'bg-slate-900/50 border-slate-800/50 opacity-60'
                  : 'bg-slate-900 border-slate-800'
              )}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 flex-shrink-0 mt-0.5">
                {noteTypeIcon(note.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p
                      className={cn(
                        'text-sm font-medium',
                        note.isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'
                      )}
                    >
                      {note.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">{noteTypeLabel(note.type)}</span>
                      <Badge variant={priorityBadgeVariant(note.priority)}>{note.priority}</Badge>
                      <span className="text-xs text-slate-600">{formatDate(note.createdAt)}</span>
                      {note.dueDate && (
                        <span className="text-xs text-slate-600">
                          Vence: {formatDate(note.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleToggleComplete(note)}
                      className="p-1.5 rounded-md text-slate-500 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                      aria-label={note.isCompleted ? 'Reabrir nota' : 'Marcar como completada'}
                    >
                      <CheckCircle2 size={14} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      aria-label="Eliminar nota"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
                {note.content && (
                  <p className="text-sm text-slate-400 mt-2 whitespace-pre-wrap">{note.content}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New note modal */}
      <Modal
        open={showForm}
        onOpenChange={setShowForm}
        title="Nueva Nota"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={submitting} disabled={!formTitle.trim()}>
              Guardar Nota
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título"
            placeholder="Título de la nota"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-400">Contenido</label>
            <textarea
              className="w-full rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-sm px-3 py-2 h-24 resize-none transition-colors focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
              placeholder="Descripción detallada..."
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Tipo"
              value={formType}
              onValueChange={(v) => setFormType(v as Note['type'])}
              options={[
                { value: 'general', label: 'General' },
                { value: 'context', label: 'Contexto' },
                { value: 'action', label: 'Acción' },
                { value: 'alert', label: 'Alerta' },
              ]}
            />
            <Select
              label="Prioridad"
              value={formPriority}
              onValueChange={(v) => setFormPriority(v as Note['priority'])}
              options={[
                { value: 'low', label: 'Baja' },
                { value: 'medium', label: 'Media' },
                { value: 'high', label: 'Alta' },
                { value: 'urgent', label: 'Urgente' },
              ]}
            />
          </div>
          <Input
            label="Fecha de vencimiento (opcional)"
            type="date"
            value={formDueDate}
            onChange={(e) => setFormDueDate(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}

// ── Tab: Actividades Pendientes ─────────────────────────────────────────

function PendientesTab({ studentId }: { studentId: string }) {
  const [activities, setActivities] = useState<PendingActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await getPendingActivities(studentId);
      if (!cancelled) {
        setActivities(data);
        setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [studentId]);

  const overdue = activities.filter(a => a.isOverdue);
  const upcoming = activities.filter(a => !a.isOverdue);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} variant="text" lines={1} />)}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle2 size={24} strokeWidth={1.5} />}
        title="¡Al día!"
        description="No hay actividades pendientes para este estudiante."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center">
          <p className="text-2xl font-bold font-mono text-rose-400">{overdue.length}</p>
          <p className="text-xs text-slate-500 mt-1">Atrasadas</p>
        </div>
        <div className="p-3 rounded-lg bg-amber-400/10 border border-amber-400/20 text-center">
          <p className="text-2xl font-bold font-mono text-amber-400">{upcoming.length}</p>
          <p className="text-xs text-slate-500 mt-1">Por vencer</p>
        </div>
      </div>

      {/* Overdue list */}
      {overdue.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-rose-400">Atrasadas</h4>
          {overdue.map((a, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{a.activityName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Módulo {a.moduleNumber}: {a.moduleName}
                  </p>
                </div>
                <Badge variant="risk-high">
                  {a.daysOverdue}d atrasado
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Esperado: {formatDate(a.expectedDate)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming list */}
      {upcoming.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-amber-400">Próximas</h4>
          {upcoming.map((a, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-amber-400/10 border border-amber-400/30"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{a.activityName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Módulo {a.moduleNumber}: {a.moduleName}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Esperado: {formatDate(a.expectedDate)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page component ────────────────────────────────────────────────

type TabValue = 'resumen' | 'asistencia' | 'progreso' | 'dedicacion' | 'notas' | 'pendientes';

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [syllabus, setSyllabus] = useState<SyllabusModule[]>([]);
  const [risk, setRisk] = useState<RiskOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('resumen');

  // Edit/Create student modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editStatus, setEditStatus] = useState<Student['status']>('active');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        const [studentData, allAttendance, allProgress, allDedication, allSyllabus] =
          await Promise.all([
            db.students.get(id!),
            db.attendance.where('studentId').equals(id!).toArray(),
            db.progress.where('studentId').equals(id!).toArray(),
            db.dedication.where('studentId').equals(id!).toArray(),
            db.syllabus.toArray(),
          ]);

        if (!studentData) {
          if (!cancelled) {
            setError('Estudiante no encontrado');
            setIsLoading(false);
          }
          return;
        }

        const cohortSyllabus = allSyllabus.filter(
          (m) => m.cohortId === studentData.cohortId
        );

        let riskResult: RiskOutput | null = null;
        if (studentData.status === 'active') {
          riskResult = calculateRisk({
            student: studentData,
            attendance: allAttendance,
            progress: allProgress,
            dedication: allDedication,
            syllabus: cohortSyllabus,
            referenceDate: new Date(),
            allCohortProgress: allProgress,
          });
        }

        if (!cancelled) {
          setStudent(studentData);
          setSyllabus(cohortSyllabus);
          setRisk(riskResult);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar datos');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !editName.trim()) return;
    setSaving(true);
    const updated: Student = {
      ...student,
      fullName: editName.trim(),
      email: editEmail.trim() || undefined,
      status: editStatus,
      tags: editTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      updatedAt: new Date().toISOString(),
    };
    await db.students.put(updated);
    setStudent(updated);
    toast.success('Estudiante actualizado');
    setShowEditModal(false);
    setSaving(false);
  };

  const openEditModal = () => {
    if (!student) return;
    setEditName(student.fullName);
    setEditEmail(student.email || '');
    setEditTags(student.tags.join(', '));
    setEditStatus(student.status);
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (!student) return;
    await db.students.delete(student.id);
    toast.success('Estudiante eliminado');
    navigate('/students');
  };

  // ── Error state ──────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6">
        <Link
          to="/students"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-4 transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Volver a estudiantes
        </Link>
        <EmptyState
          icon={<AlertTriangle size={24} strokeWidth={1.5} />}
          title="Error"
          description={error}
        />
      </div>
    );
  }

  // ── Loading state ────────────────────────────────────────────────────
  if (isLoading || !student) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton variant="text" width={200} height={24} />
        <div className="flex gap-4">
          <Skeleton variant="circular" width={64} height={64} />
          <div className="space-y-2">
            <Skeleton variant="text" width={240} height={20} />
            <Skeleton variant="text" width={180} height={16} />
          </div>
        </div>
        <Skeleton variant="rectangular" height={400} />
      </div>
    );
  }

  const avatarLetters = student.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const tabs: { value: TabValue; label: string }[] = [
    { value: 'resumen', label: 'Resumen' },
    { value: 'asistencia', label: 'Asistencia' },
    { value: 'progreso', label: 'Progreso' },
    { value: 'dedicacion', label: 'Dedicación' },
    { value: 'pendientes', label: 'Pendientes' },
    { value: 'notas', label: 'Notas' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Back button */}
      <Link
        to="/students"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Volver a estudiantes
      </Link>

      {/* Student Header */}
      <Card variant="default" padding="lg">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Avatar */}
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/20 flex-shrink-0">
            <span className="text-xl font-bold text-indigo-300">{avatarLetters}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className="text-xl font-semibold text-slate-100 truncate">
                {student.fullName}
              </h1>
              <Badge variant={statusVariant(student.status)}>
                {student.status === 'active'
                  ? 'Activo'
                  : student.status === 'dropout'
                    ? 'Desertor'
                    : 'Inactivo'}
              </Badge>
            </div>
            {student.email && (
              <p className="text-sm text-slate-400 mt-1">{student.email}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {student.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="secondary" size="sm" leftIcon={<Edit3 size={16} strokeWidth={1.5} />} onClick={openEditModal}>
              Editar
            </Button>
            <Button variant="danger" size="sm" leftIcon={<Trash2 size={16} strokeWidth={1.5} />} onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        </div>
      </Card>

      {/* Main content: Tabs */}
      <Tabs.Root
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
        className="flex flex-col lg:flex-row gap-6"
      >
        {/* Sidebar */}
        <div className="lg:w-56 flex-shrink-0">
          <Tabs.List
            className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0"
            aria-label="Información del estudiante"
          >
            {tabs.map((tab) => (
              <Tabs.Trigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                  activeTab === tab.value
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                )}
              >
                {tab.label}
              </Tabs.Trigger>
            ))}

            {/* Quick info card */}
            <div className="hidden lg:block mt-6 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                Info Rápida
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-500">Desde</p>
                  <p className="text-sm text-slate-300">{formatDate(student.enrollmentDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Cohorte</p>
                  <p className="text-sm text-slate-300">{student.cohortId.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">ID</p>
                  <p className="text-sm font-mono text-slate-300 text-xs truncate">
                    {student.externalId}
                  </p>
                </div>
                {risk && (
                  <div>
                    <p className="text-xs text-slate-500">Riesgo</p>
                    <Badge variant={riskBadgeVariant(risk.riskLevel)}>
                      {riskLabel(risk.riskLevel)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </Tabs.List>
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          <Tabs.Content value="resumen" className="animate-fade-in">
            <ResumenTab risk={risk} />
          </Tabs.Content>
          <Tabs.Content value="asistencia" className="animate-fade-in">
            <AsistenciaTab studentId={student.id} />
          </Tabs.Content>
          <Tabs.Content value="progreso" className="animate-fade-in">
            <ProgresoTab studentId={student.id} syllabus={syllabus} />
          </Tabs.Content>
          <Tabs.Content value="dedicacion" className="animate-fade-in">
            <DedicacionTab studentId={student.id} syllabus={syllabus} />
          </Tabs.Content>
          <Tabs.Content value="pendientes" className="animate-fade-in">
            <PendientesTab studentId={student.id} />
          </Tabs.Content>
          <Tabs.Content value="notas" className="animate-fade-in">
            <NotasTab studentId={student.id} />
          </Tabs.Content>
        </div>
      </Tabs.Root>

      {/* Edit Modal */}
      <Modal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        title="Editar Estudiante"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSaveEdit} isLoading={saving} disabled={!editName.trim()}>
              Guardar Cambios
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Nombre completo"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
          />
          <Select
            label="Estado"
            value={editStatus}
            onValueChange={(v) => setEditStatus(v as Student['status'])}
            options={[
              { value: 'active', label: 'Activo' },
              { value: 'dropout', label: 'Desertor' },
              { value: 'inactive', label: 'Inactivo' },
            ]}
          />
          <Input
            label="Tags (separados por coma)"
            placeholder="ej: Trabajando, Sin internet"
            value={editTags}
            onChange={(e) => setEditTags(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}
