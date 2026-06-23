import { useEffect, useMemo, useState, useCallback } from 'react';
import { Calendar, MessageSquare } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Skeleton } from '@/shared/ui/skeleton';
import { useAttendanceStore } from '@/features/attendance';
import { generateAllClassDates, getMonthName, parseLocalDate } from '@/features/attendance/lib/generate-dates';
import { upsertAttendanceRecord, deleteAttendanceRecord } from '@/features/attendance/api/attendance-api';
import { AttendanceCommentModal } from '@/features/attendance/ui/attendance-comment-modal';
import { db } from '@/shared/lib/database';
import { toast } from '@/shared/ui/toast';
import type { Student } from '@/entities/student';
import type { AttendanceRecord } from '@/entities/attendance';

type AttendanceStatus = AttendanceRecord['status'] | null;

interface CellData {
  status: AttendanceStatus;
  notes?: string;
  recordId?: string;
}

const STATUS_CYCLE: AttendanceStatus[] = [null, 'present', 'absent', 'late', 'excused'];

function nextCycleStatus(current: AttendanceStatus): AttendanceStatus {
  const idx = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

const STATUS_CONFIG: Record<string, { label: string; short: string; color: string }> = {
  present: { label: 'Presente', short: 'P', color: 'bg-emerald-500 hover:bg-emerald-600' },
  absent: { label: 'Ausente', short: 'A', color: 'bg-rose-500 hover:bg-rose-600' },
  late: { label: 'Tarde', short: 'T', color: 'bg-amber-400 hover:bg-amber-500' },
  excused: { label: 'Justificado', short: 'J', color: 'bg-sky-400 hover:bg-sky-500' },
};

export function AttendancePage() {
  const currentMonth = useAttendanceStore((s) => s.currentMonth);
  const setMonth = useAttendanceStore((s) => s.setMonth);
  const activeCohortId = useAttendanceStore((s) => s.activeCohortId);
  const setActiveCohort = useAttendanceStore((s) => s.setActiveCohort);

  const [students, setStudents] = useState<Student[]>([]);
  const [allDates, setAllDates] = useState<string[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Map<string, Map<string, CellData>>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Comment modal state
  const [commentModal, setCommentModal] = useState<{
    studentId: string;
    date: string;
    studentName: string;
    currentComment?: string;
  } | null>(null);

  // Initialize cohort
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

  // Load all data
  useEffect(() => {
    if (!activeCohortId) return;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const [classDates, cohortStudents, allAttendance] = await Promise.all([
          generateAllClassDates(),
          db.students.where('cohortId').equals(activeCohortId!).sortBy('fullName' as never),
          db.attendance.toArray(),
        ] as const);

        if (cancelled) return;

        const dates = classDates.map(d => d.date);
        setAllDates(dates);
        setStudents(cohortStudents as Student[]);

        const map = new Map<string, Map<string, CellData>>();
        for (const student of cohortStudents) {
          const studentMap = new Map<string, CellData>();
          for (const date of dates) {
            studentMap.set(date, { status: null });
          }
          map.set((student as Student).id, studentMap);
        }

        for (const record of allAttendance) {
          const studentMap = map.get(record.studentId);
          if (studentMap && studentMap.has(record.date)) {
            studentMap.set(record.date, {
              status: record.status,
              notes: record.notes,
              recordId: record.id,
            });
          }
        }

        setAttendanceMap(map);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [activeCohortId]);

  // Dates for selected month
  const filteredDates = useMemo(() => {
    return allDates.filter(date => date.startsWith(currentMonth));
  }, [allDates, currentMonth]);

  // Day names for header
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Handle cell click - cycle status
  const handleCellClick = useCallback(async (studentId: string, date: string) => {
    const currentData = attendanceMap.get(studentId)?.get(date);
    const nextStatus = nextCycleStatus(currentData?.status ?? null);

    // Optimistic update
    const newMap = new Map(attendanceMap);
    const studentMap = new Map(newMap.get(studentId)!);
    studentMap.set(date, { status: nextStatus });
    newMap.set(studentId, studentMap);
    setAttendanceMap(newMap);

    try {
      if (nextStatus) {
        await upsertAttendanceRecord(studentId, date, nextStatus);
      } else {
        const recordId = currentData?.recordId;
        if (recordId) {
          await deleteAttendanceRecord(recordId);
        }
      }
    } catch (error) {
      // Revert on error
      const revertMap = new Map(attendanceMap);
      const revertStudentMap = new Map(revertMap.get(studentId)!);
      revertStudentMap.set(date, currentData ?? { status: null });
      revertMap.set(studentId, revertStudentMap);
      setAttendanceMap(revertMap);
      toast.error('Error al guardar asistencia');
    }
  }, [attendanceMap]);

  // Handle save comment
  const handleSaveComment = useCallback(async (comment: string) => {
    if (!commentModal) return;
    const { studentId, date } = commentModal;

    const currentData = attendanceMap.get(studentId)?.get(date);
    const status = currentData?.status;

    if (!status) {
      await upsertAttendanceRecord(studentId, date, 'present', comment || undefined);
    } else {
      await upsertAttendanceRecord(studentId, date, status, comment || undefined);
    }

    // Update map
    const newMap = new Map(attendanceMap);
    const studentMap = new Map(newMap.get(studentId)!);
    studentMap.set(date, { status: status ?? 'present', notes: comment || undefined, recordId: currentData?.recordId });
    newMap.set(studentId, studentMap);
    setAttendanceMap(newMap);

    toast.success('Comentario guardado');
  }, [commentModal, attendanceMap]);

  // Stats for current month
  const monthStats = useMemo(() => {
    const totals = { present: 0, absent: 0, late: 0, excused: 0, unset: 0 };
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const validDates = filteredDates.filter(d => d <= todayStr);
    const totalDays = validDates.length;
    if (totalDays === 0 || students.length === 0) return totals;

    for (const student of students) {
      let present = 0, absent = 0, late = 0, excused = 0, unset = 0;
      for (const date of validDates) {
        const cell = attendanceMap.get(student.id)?.get(date);
        if (cell?.status === 'present') present++;
        else if (cell?.status === 'absent') absent++;
        else if (cell?.status === 'late') late++;
        else if (cell?.status === 'excused') excused++;
        else unset++;
      }
      totals.present += Math.round((present / totalDays) * 100);
      totals.absent += Math.round((absent / totalDays) * 100);
      totals.late += Math.round((late / totalDays) * 100);
      totals.excused += Math.round((excused / totalDays) * 100);
      totals.unset += Math.round((unset / totalDays) * 100);
    }

    return {
      present: Math.round(totals.present / students.length),
      absent: Math.round(totals.absent / students.length),
      late: Math.round(totals.late / students.length),
      excused: Math.round(totals.excused / students.length),
      unset: Math.round(totals.unset / students.length),
    };
  }, [filteredDates, students, attendanceMap]);

  // Available months (May-August 2026 from cronograma)
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    for (const date of allDates) {
      months.add(date.slice(0, 7));
    }
    return Array.from(months).sort();
  }, [allDates]);

  if (!activeCohortId) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Calendar size={24} strokeWidth={1.5} />}
          title="Sin cohorte activa"
          description="Selecciona o crea una cohorte para gestionar asistencia."
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-100">Asistencia</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-400">Mes:</label>
          <select
            value={currentMonth}
            onChange={(e) => setMonth(e.target.value)}
            className="appearance-none px-3 py-1.5 rounded-md text-sm bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            aria-label="Seleccionar mes"
          >
            {availableMonths.map((month) => {
              const d = parseLocalDate(month + '-01');
              return (
                <option key={month} value={month}>
                  {getMonthName(d)} {d.getFullYear()}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${config.color.replace(' hover:bg-', '')}`} />
            <span className="text-slate-400">
              {config.label} (<span className="font-mono">{config.short}</span>)
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-slate-700" />
          <span className="text-slate-400">Sin registro (-)</span>
        </div>
        <span className="text-xs text-slate-600 ml-auto">
          Click para cambiar: <span className="font-mono">- → P → A → T → J → -</span>
        </span>
      </div>

      {/* Attendance grid */}
      <Card variant="default" padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="text" lines={1} />
            ))}
          </div>
        ) : (
          <div className="overflow-auto max-h-[70vh]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 sticky top-0 z-10">
                  <th className="sticky left-0 bg-slate-900 z-20 px-4 py-2 text-left font-medium text-slate-300 border-b border-slate-800 min-w-[180px]">
                    Estudiante
                  </th>
                  {filteredDates.map(date => {
                    const d = parseLocalDate(date);
                    return (
                      <th
                        key={date}
                        className="px-1 py-2 text-center font-medium text-slate-300 border-b border-slate-800 min-w-[40px]"
                      >
                        <div className="text-[10px] text-slate-500">{dayNames[d.getDay()]}</div>
                        <div className="text-sm">{d.getDate()}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id} className="border-b border-slate-800/50 hover:bg-slate-900/30">
                    <td className="sticky left-0 bg-slate-950 z-10 px-4 py-1.5 text-sm font-medium text-slate-200 border-r border-slate-800 whitespace-nowrap">
                      {student.fullName}
                    </td>
                    {filteredDates.map(date => {
                      const cellData = attendanceMap.get(student.id)?.get(date);
                      const status = cellData?.status;
                      const hasNotes = !!cellData?.notes;
                      const config = status ? STATUS_CONFIG[status] : null;

                      return (
                        <td key={date} className="px-1 py-1 text-center relative">
                          <div className="flex items-center justify-center gap-0.5">
                            <button
                              onClick={() => handleCellClick(student.id, date)}
                              className={`w-7 h-7 rounded-full text-xs font-medium transition-all ${
                                config
                                  ? `${config.color} text-white shadow-sm`
                                  : 'bg-slate-700/50 hover:bg-slate-600 text-slate-400'
                              }`}
                              title={`${student.fullName} — ${date}: ${config?.label ?? 'Sin registro'}`}
                            >
                              {config ? config.short : '-'}
                            </button>
                            <button
                              onClick={() => setCommentModal({
                                studentId: student.id,
                                date,
                                studentName: student.fullName,
                                currentComment: cellData?.notes,
                              })}
                              className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                                hasNotes
                                  ? 'text-indigo-400 hover:text-indigo-300'
                                  : 'text-slate-600 hover:text-slate-400'
                              }`}
                              title={hasNotes ? 'Editar comentario' : 'Agregar comentario'}
                            >
                              <MessageSquare size={10} strokeWidth={1.5} />
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Monthly summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {([
          ['Presentes', 'present', 'text-emerald-400'],
          ['Ausentes', 'absent', 'text-rose-400'],
          ['Tardes', 'late', 'text-amber-400'],
          ['Justificados', 'excused', 'text-sky-400'],
          ['Sin registro', 'unset', 'text-slate-500'],
        ] as const).map(([label, key, color]) => (
          <Card key={key} variant="default" padding="md" className="text-center">
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`text-2xl font-bold font-mono mt-1 ${color}`}>
              {monthStats[key as keyof typeof monthStats]}%
            </p>
          </Card>
        ))}
      </div>

      {/* Comment modal */}
      {commentModal && (
        <AttendanceCommentModal
          open
          onOpenChange={() => setCommentModal(null)}
          studentName={commentModal.studentName}
          date={commentModal.date}
          currentComment={commentModal.currentComment}
          onSave={handleSaveComment}
        />
      )}
    </div>
  );
}
