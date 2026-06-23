import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, UserCheck, AlertTriangle, CalendarCheck, MessageSquare } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/empty-state';
import { db } from '@/shared/lib/database';
import { calculateRisk } from '@/features/risk-engine';
import { relativeDate } from '@/shared/lib/date';
import type { Student } from '@/entities/student';
import type { AttendanceRecord } from '@/entities/attendance';
import type { SyllabusModule } from '@/entities/syllabus';
import type { Note } from '@/entities/note';
import type { RiskOutput } from '@/features/risk-engine';

// ── Types ─────────────────────────────────────────────────────────────────────

interface StudentWithRisk {
  student: Student;
  risk: RiskOutput;
}

interface DashboardData {
  students: Student[];
  studentRisks: StudentWithRisk[];
  attendance: AttendanceRecord[];
  recentNotes: Note[];
  syllabus: SyllabusModule[];
}

// ── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  isLoading: boolean;
}

function KpiCard({ label, value, icon, color, isLoading }: KpiCardProps) {
  return (
    <Card variant="default" padding="md">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          {isLoading ? (
            <Skeleton variant="text" width={60} height={32} className="mt-2" />
          ) : (
            <p className={`mt-1 text-3xl font-semibold font-mono ${color}`}>{value}</p>
          )}
        </div>
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-lg ${color
            .replace('text-', 'bg-')
            .replace('-400', '-500/15')
            .replace('-300', '-500/15')}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ── Risk row helpers ──────────────────────────────────────────────────────────

function riskVariant(level: RiskOutput['riskLevel']): 'risk-high' | 'risk-medium' | 'risk-low' {
  if (level === 'high') return 'risk-high';
  if (level === 'medium') return 'risk-medium';
  return 'risk-low';
}

function riskLabel(level: RiskOutput['riskLevel']): string {
  if (level === 'high') return 'Alto';
  if (level === 'medium') return 'Medio';
  return 'Bajo';
}

// ── Priority badge helper ─────────────────────────────────────────────────────

function priorityVariant(
  p: Note['priority']
): 'risk-high' | 'risk-medium' | 'risk-low' | 'info' {
  if (p === 'urgent' || p === 'high') return 'risk-high';
  if (p === 'medium') return 'risk-medium';
  return 'risk-low';
}

// ── Main component ────────────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        const [
          students,
          allAttendance,
          allProgress,
          allDedication,
          allSyllabus,
          allNotes,
        ] = await Promise.all([
          db.students.toArray(),
          db.attendance.toArray(),
          db.progress.toArray(),
          db.dedication.toArray(),
          db.syllabus.toArray(),
          db.notes.orderBy('createdAt').reverse().limit(5).toArray(),
        ]);

        students.sort((a, b) =>
          a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' })
        );

        const referenceDate = new Date();

        const studentRisks: StudentWithRisk[] = students
          .filter((s) => s.status === 'active')
          .map((student) => {
            const risk = calculateRisk({
              student,
              attendance: allAttendance.filter((a) => a.studentId === student.id),
              progress: allProgress.filter((p) => p.studentId === student.id),
              dedication: allDedication.filter((d) => d.studentId === student.id),
              syllabus: allSyllabus.filter((m) => m.cohortId === student.cohortId),
              referenceDate,
              allCohortProgress: allProgress,
            });
            return { student, risk };
          });

        if (!cancelled) {
          setData({
            students,
            studentRisks,
            attendance: allAttendance,
            recentNotes: allNotes,
            syllabus: allSyllabus.sort((a, b) => a.moduleNumber - b.moduleNumber),
          });
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
  }, []);

  // ── Derived metrics ─────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    if (!data) return null;

    const active = data.students.filter((s) => s.status === 'active').length;
    const highRisk = data.studentRisks.filter((sr) => sr.risk.riskLevel === 'high').length;

    const totalPresent = data.attendance.filter(
      (a) => a.status === 'present' || a.status === 'late'
    ).length;
    const attendanceRate =
      data.attendance.length > 0
        ? Math.round((totalPresent / data.attendance.length) * 100)
        : 0;

    return {
      total: data.students.length,
      active,
      highRisk,
      attendanceRate,
    };
  }, [data]);

  const statusChartData = useMemo(() => {
    if (!data) return [];
    const active = data.students.filter((s) => s.status === 'active').length;
    const dropout = data.students.filter((s) => s.status === 'dropout').length;
    const inactive = data.students.filter((s) => s.status === 'inactive').length;
    return [
      { name: 'Activos', value: active, color: '#10b981' },
      { name: 'Desertores', value: dropout, color: '#f43f5e' },
      { name: 'Inactivos', value: inactive, color: '#64748b' },
    ];
  }, [data]);

  const topRiskStudents = useMemo(() => {
    if (!data) return [];
    return [...data.studentRisks]
      .sort((a, b) => b.risk.riskScore - a.risk.riskScore)
      .slice(0, 5);
  }, [data]);

  // ── Error state ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<AlertTriangle size={24} strokeWidth={1.5} />}
          title="Error al cargar el dashboard"
          description={error}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Vista General de Cohorte</h2>
        <p className="mt-1 text-sm text-slate-400">Cohorte 2026-A — Programación Web</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Estudiantes"
          value={kpis?.total ?? 0}
          icon={<Users size={20} strokeWidth={1.5} />}
          color="text-sky-400"
          isLoading={isLoading}
        />
        <KpiCard
          label="Estudiantes Activos"
          value={kpis?.active ?? 0}
          icon={<UserCheck size={20} strokeWidth={1.5} />}
          color="text-emerald-400"
          isLoading={isLoading}
        />
        <KpiCard
          label="En Riesgo Alto"
          value={kpis?.highRisk ?? 0}
          icon={<AlertTriangle size={20} strokeWidth={1.5} />}
          color="text-rose-400"
          isLoading={isLoading}
        />
        <KpiCard
          label="Asistencia Promedio"
          value={isLoading ? '—' : `${kpis?.attendanceRate ?? 0}%`}
          icon={<CalendarCheck size={20} strokeWidth={1.5} />}
          color="text-amber-400"
          isLoading={isLoading}
        />
      </div>

      {/* Chart + Risk Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution chart */}
        <Card variant="default" padding="lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">
            Distribución por Estado
          </h3>
          {isLoading ? (
            <Skeleton variant="rectangular" height={200} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusChartData} barCategoryGap="30%">
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
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
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Top risk students */}
        <Card variant="default" padding="lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">
            Estudiantes en Mayor Riesgo
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="text" lines={1} />
              ))}
            </div>
          ) : topRiskStudents.length === 0 ? (
            <EmptyState
              title="Sin datos de riesgo"
              description="No hay estudiantes activos con datos suficientes."
            />
          ) : (
            <div className="space-y-2">
              {topRiskStudents.map(({ student, risk }) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {student.fullName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{student.email}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <span className="text-xs font-mono text-slate-400">
                      {risk.riskScore}pts
                    </span>
                    <Badge variant={riskVariant(risk.riskLevel)}>
                      {riskLabel(risk.riskLevel)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent notes */}
      <Card variant="default" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300">Notas Recientes</h3>
          <MessageSquare size={16} strokeWidth={1.5} className="text-slate-500" />
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="text" lines={2} />
            ))}
          </div>
        ) : data?.recentNotes.length === 0 ? (
          <EmptyState title="Sin notas recientes" description="Aún no hay notas registradas." />
        ) : (
          <div className="space-y-3">
            {data?.recentNotes.map((note) => {
              const student = data.students.find(s => s.id === note.studentId);
              return (
                <div
                  key={note.id}
                  className="flex items-start gap-3 py-2 border-b border-slate-800 last:border-0 cursor-pointer hover:bg-slate-800/30 rounded-lg px-2 -mx-2 transition-colors"
                  onClick={() => navigate(`/students/${note.studentId}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">{note.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {student?.fullName && <span className="text-indigo-400">{student.fullName}</span>}
                      {note.content && <span> — {note.content}</span>}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{relativeDate(note.createdAt)}</p>
                  </div>
                  <Badge variant={priorityVariant(note.priority)}>
                    {note.priority === 'urgent' ? 'Urgente' : note.priority === 'high' ? 'Alta' : note.priority === 'medium' ? 'Media' : 'Baja'}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
