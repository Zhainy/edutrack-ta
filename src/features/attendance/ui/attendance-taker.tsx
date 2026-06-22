import { useCallback, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/empty-state';
import { useAttendanceStore } from '../model/attendance-store';
import type { AttendanceRecord } from '@/entities/attendance';

const STATUS_COLORS: Record<AttendanceRecord['status'], string> = {
  present: 'bg-emerald-500 ring-2 ring-emerald-300/50',
  absent: 'bg-rose-500 ring-2 ring-rose-300/50',
  late: 'bg-amber-400 ring-2 ring-amber-200/50',
  excused: 'bg-sky-400 ring-2 ring-sky-200/50',
};

const STATUS_LABELS: Record<string, string> = {
  present: 'Presente',
  absent: 'Ausente',
  late: 'Tarde',
  excused: 'Justificado',
};

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  return `${parts[2]}/${parts[1]}`;
}

export function AttendanceTaker() {
  const records = useAttendanceStore((s) => s.records);
  const students = useAttendanceStore((s) => s.students);
  const dates = useAttendanceStore((s) => s.dates);
  const isLoading = useAttendanceStore((s) => s.isLoading);
  const markAttendance = useAttendanceStore((s) => s.markAttendance);
  const markAllPresent = useAttendanceStore((s) => s.markAllPresent);

  const gridRef = useRef<HTMLDivElement>(null);

  const getStatus = useCallback(
    (studentId: string, date: string): AttendanceRecord['status'] | undefined => {
      return records.find((r) => r.studentId === studentId && r.date === date)?.status;
    },
    [records]
  );

  const handleCellClick = useCallback(
    (studentId: string, date: string) => {
      void markAttendance(studentId, date);
    },
    [markAttendance]
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        <Skeleton variant="text" lines={8} />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle2 size={24} strokeWidth={1.5} />}
        title="Sin estudiantes"
        description="No hay estudiantes registrados en este curso."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-400">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={cn('w-3 h-3 rounded-full', STATUS_COLORS[key as AttendanceRecord['status']])} />
            {label}
          </div>
        ))}
        <span className="ml-auto text-slate-500">Click en círculo para cambiar: — → Verde → Rojo → Amarillo → Azul</span>
      </div>

      {/* Scrollable grid */}
      <div
        ref={gridRef}
        className="overflow-auto rounded-lg border border-slate-800 max-h-[70vh]"
      >
        <table className="w-full border-collapse">
          {/* Header row: dates */}
          <thead>
            <tr className="sticky top-0 z-10 bg-slate-900">
              <th className="sticky left-0 z-20 bg-slate-900 px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase border-b border-slate-800 min-w-[180px]">
                Estudiante
              </th>
              {dates.map((date) => (
                <th
                  key={date}
                  className="px-2 py-2 text-center text-xs font-medium text-slate-500 border-b border-slate-800 border-l border-slate-800/50 min-w-[44px]"
                >
                  {formatDate(date)}
                </th>
              ))}
              {dates.length === 0 && (
                <th className="px-4 py-2 text-center text-xs text-slate-600 border-b border-slate-800">
                  Sin registros de asistencia este mes
                </th>
              )}
            </tr>
          </thead>

          {/* Body: students */}
          <tbody>
            {students.map((student, si) => (
              <tr
                key={student.id}
                className={cn(
                  'hover:bg-slate-800/30 transition-colors',
                  si % 2 === 0 ? 'bg-slate-900/50' : 'bg-slate-950/30'
                )}
              >
                {/* Student name — sticky left */}
                <td className="sticky left-0 z-10 px-3 py-2 text-sm text-slate-200 border-b border-slate-800/50 bg-inherit truncate max-w-[180px]">
                  {student.fullName}
                </td>

                {/* Circle cells */}
                {dates.map((date) => {
                  const status = getStatus(student.id, date);
                  return (
                    <td
                      key={`${student.id}-${date}`}
                      className="px-2 py-2 text-center border-b border-slate-800/50 border-l border-slate-800/30"
                    >
                      <button
                        onClick={() => handleCellClick(student.id, date)}
                        title={`${student.fullName} — ${formatDate(date)}${status ? ` (${STATUS_LABELS[status]})` : ''}`}
                        className="group relative inline-flex items-center justify-center"
                      >
                        <span
                          className={cn(
                            'inline-block w-6 h-6 rounded-full transition-all duration-150 cursor-pointer',
                            status
                              ? STATUS_COLORS[status]
                              : 'bg-slate-700 hover:bg-slate-600',
                            'hover:scale-110 active:scale-95'
                          )}
                        />
                        {/* Next status indicator on hover */}
                        {!status && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions row */}
      {dates.length > 0 && (
        <div className="flex gap-2">
          {dates.map((date) => (
            <Button
              key={date}
              variant="secondary"
              size="sm"
              onClick={() => markAllPresent(date, students.map((s) => s.id))}
              leftIcon={<CheckCircle2 size={14} strokeWidth={1.5} />}
            >
              Marcar todos presentes ({formatDate(date)})
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
