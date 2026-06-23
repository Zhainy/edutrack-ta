import { useMemo } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquare } from 'lucide-react';
import type { Note } from '@/entities/note';
import { NoteCard } from './note-card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Skeleton } from '@/shared/ui/skeleton';

interface NoteTimelineProps {
  notes: Note[];
  studentsMap: Map<string, string>;
  isLoading: boolean;
  onToggleComplete: (id: string, current: boolean) => void;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

function formatGroupDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();
    if (isToday) return 'Hoy';
    if (isYesterday) return 'Ayer';
    return format(date, "EEEE d 'de' MMMM", { locale: es });
  } catch {
    return dateStr;
  }
}

export function NoteTimeline({
  notes,
  studentsMap,
  isLoading,
  onToggleComplete,
  onEdit,
  onDelete,
}: NoteTimelineProps) {
  const grouped = useMemo(() => {
    const groups: Record<string, Note[]> = {};
    for (const note of notes) {
      const dateKey = note.createdAt.slice(0, 10);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(note);
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [notes]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="text" lines={3} />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare size={24} strokeWidth={1.5} />}
        title="Sin notas"
        description="No hay notas que coincidan con los filtros."
      />
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-700/50" />

      <div className="space-y-1">
        {grouped.map(([dateKey, dayNotes]) => (
          <div key={dateKey}>
            {/* Date header */}
            <div className="flex items-center gap-3 py-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 z-10">
                <span className="text-xs font-bold text-slate-400">
                  {format(parseISO(dateKey), 'd', { locale: es })}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-300 capitalize">
                {formatGroupDate(dateKey)}
              </h3>
            </div>

            {/* Notes for this day */}
            <div className="ml-14 space-y-3 pb-4">
              {dayNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  studentName={studentsMap.get(note.studentId) || note.studentName}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
