import { useEffect, useState } from 'react';
import { Calendar, BarChart3, List } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { useAttendanceStore, AttendanceTaker } from '@/features/attendance';
import { db } from '@/shared/lib/database';
import type { AttendanceRecord } from '@/entities/attendance';

type Tab = 'register' | 'report' | 'history';

interface StudentStats {
  studentId: string;
  fullName: string;
  totalDays: number;
  presentDays: number;
  attendanceRate: number;
}

export function AttendancePage() {
  const currentMonth = useAttendanceStore((s) => s.currentMonth);
  const setMonth = useAttendanceStore((s) => s.setMonth);
  const activeCohortId = useAttendanceStore((s) => s.activeCohortId);
  const setActiveCohort = useAttendanceStore((s) => s.setActiveCohort);
  const loadRecords = useAttendanceStore((s) => s.loadRecords);
  const cohorts = useAttendanceStore((s) => s.students);

  const [tab, setTab] = useState<Tab>('register');
  const [stats, setStats] = useState<StudentStats[]>([]);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('edutrack-active-cohort');
    if (stored && stored !== activeCohortId) {
      setActiveCohort(stored);
    } else if (!activeCohortId && stored) {
      setActiveCohort(stored);
    } else if (!activeCohortId) {
      void (async () => {
        const all = await db.cohorts.toArray();
        if (all.length > 0) setActiveCohort(all[0].id);
      })();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeCohortId) void loadRecords();
  }, [activeCohortId, currentMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tab !== 'register' && activeCohortId) {
      void loadStats();
      void loadHistory();
    }
  }, [tab, activeCohortId, currentMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStats = async () => {
    if (!activeCohortId) return;
    const students = await db.students.where('cohortId').equals(activeCohortId).toArray();
    const nameToId = new Map(students.map(s => [s.fullName.toLowerCase(), s.id]));

    const year = parseInt(currentMonth.slice(0, 4), 10);
    const month = parseInt(currentMonth.slice(5, 7), 10);
    const endDay = new Date(year, month, 0).getDate();
    const startDate = `${currentMonth}-01`;
    const endDate = `${currentMonth}-${endDay}`;

    const allRecords = await db.attendance
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();

    const ids = new Set(students.map(s => s.id));
    const cohortRecords = allRecords.filter(r =>
      (r.studentId && ids.has(r.studentId)) ||
      (r.studentName && nameToId.has(r.studentName.toLowerCase()))
    );

    const grouped = new Map<string, AttendanceRecord[]>();
    for (const r of cohortRecords) {
      const sid = r.studentId || nameToId.get(r.studentName?.toLowerCase() || '');
      if (!sid) continue;
      if (!grouped.has(sid)) grouped.set(sid, []);
      grouped.get(sid)!.push(r);
    }

    console.log('[Attendance] loadStats:', {
      students: students.length,
      allRecords: allRecords.length,
      cohortRecords: cohortRecords.length,
      grouped: grouped.size,
    });

    const result: StudentStats[] = [];
    for (const s of students) {
      const records = grouped.get(s.id) || [];
      const totalDays = records.length;
      const presentDays = records.filter(r => r.status === 'present').length;
      result.push({
        studentId: s.id,
        fullName: s.fullName,
        totalDays,
        presentDays,
        attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
      });
    }
    result.sort((a, b) => a.attendanceRate - b.attendanceRate);
    setStats(result);
  };

  const loadHistory = async () => {
    if (!activeCohortId) return;
    const students = await db.students.where('cohortId').equals(activeCohortId).toArray();
    const nameToId = new Map(students.map(s => [s.fullName.toLowerCase(), s.id]));

    const year = parseInt(currentMonth.slice(0, 4), 10);
    const month = parseInt(currentMonth.slice(5, 7), 10);
    const endDay = new Date(year, month, 0).getDate();
    const startDate = `${currentMonth}-01`;
    const endDate = `${currentMonth}-${endDay}`;

    const allRecords = await db.attendance
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();

    const ids = new Set(students.map(s => s.id));
    const cohortRecords = allRecords.filter(r =>
      (r.studentId && ids.has(r.studentId)) ||
      (r.studentName && nameToId.has(r.studentName.toLowerCase()))
    );

    console.log('[Attendance] loadHistory:', {
      allRecords: allRecords.length,
      cohortRecords: cohortRecords.length,
    });

    cohortRecords.sort((a, b) => b.date.localeCompare(a.date));
    setHistory(cohortRecords);
  };

  const monthOptions: string[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthOptions.push(d.toISOString().slice(0, 7));
  }

  const tabs: { key: Tab; label: string; icon: typeof Calendar }[] = [
    { key: 'register', label: 'Registrar', icon: Calendar },
    { key: 'report', label: 'Reporte', icon: BarChart3 },
    { key: 'history', label: 'Historial', icon: List },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-100">Asistencia</h1>
        <div className="flex items-center gap-2">
          <select
            value={currentMonth}
            onChange={(e) => setMonth(e.target.value)}
            className="appearance-none px-3 py-1.5 rounded-md text-sm bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            aria-label="Seleccionar mes"
          >
            {monthOptions.map((m) => {
              const [y, mo] = m.split('-');
              const label = new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString('es-CL', {
                year: 'numeric',
                month: 'long',
              });
              return (
                <option key={m} value={m}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-slate-700 bg-slate-800/50 p-0.5 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === t.key
                ? 'bg-slate-700 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <t.icon size={14} strokeWidth={1.5} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'register' && <AttendanceTaker />}

      {tab === 'report' && (
        <Card variant="default" padding="none" className="overflow-hidden">
          {stats.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<BarChart3 size={24} strokeWidth={1.5} />}
                title="Sin datos"
                description="No hay registros de asistencia para este mes."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Estudiante</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Total Días</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Presentes</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Asistencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {stats.map((s) => (
                    <tr key={s.studentId} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3 text-slate-200">{s.fullName}</td>
                      <td className="px-4 py-3 text-center text-slate-400">{s.totalDays}</td>
                      <td className="px-4 py-3 text-center text-slate-400">{s.presentDays}</td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-mono text-sm ${
                            s.attendanceRate >= 85
                              ? 'text-emerald-400'
                              : s.attendanceRate >= 70
                                ? 'text-amber-400'
                                : 'text-rose-400'
                          }`}
                        >
                          {s.attendanceRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'history' && (
        <Card variant="default" padding="none" className="overflow-hidden">
          {history.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<List size={24} strokeWidth={1.5} />}
                title="Sin historial"
                description="No hay registros de asistencia para este mes."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Estudiante</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {history.map((r) => {
                    const student = cohorts.find((c) => c.id === r.studentId);
                    const statusColors: Record<string, string> = {
                      present: 'text-emerald-400',
                      absent: 'text-rose-400',
                      late: 'text-amber-400',
                      excused: 'text-sky-400',
                    };
                    const statusLabels: Record<string, string> = {
                      present: 'Presente',
                      absent: 'Ausente',
                      late: 'Tarde',
                      excused: 'Justificado',
                    };
                    return (
                      <tr key={r.id} className="hover:bg-slate-800/30">
                        <td className="px-4 py-3 text-slate-400 font-mono text-xs">{r.date}</td>
                        <td className="px-4 py-3 text-slate-200">{student?.fullName ?? r.studentId}</td>
                        <td className={`px-4 py-3 text-center font-medium ${statusColors[r.status] ?? 'text-slate-500'}`}>
                          {statusLabels[r.status] ?? r.status}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
