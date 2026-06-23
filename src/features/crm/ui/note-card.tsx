import { AlertCircle, CheckCircle2, FileText, MessageSquare, Trash2, CheckCheck, CalendarDays } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { formatDate, relativeDate } from '@/shared/lib/date';
import type { Note } from '@/entities/note';
import { useNavigate } from 'react-router-dom';

interface NoteCardProps {
  note: Note;
  studentName?: string;
  onToggleComplete: (id: string, current: boolean) => void;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

function noteTypeIcon(type: Note['type']) {
  switch (type) {
    case 'alert':
      return <AlertCircle size={16} strokeWidth={1.5} className="text-rose-400" />;
    case 'action':
      return <CheckCircle2 size={16} strokeWidth={1.5} className="text-amber-400" />;
    case 'context':
      return <FileText size={16} strokeWidth={1.5} className="text-sky-400" />;
    default:
      return <MessageSquare size={16} strokeWidth={1.5} className="text-slate-400" />;
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

function typeBadgeColor(type: Note['type']): string {
  switch (type) {
    case 'alert':
      return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    case 'action':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    case 'context':
      return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
    default:
      return 'bg-slate-600/30 text-slate-300 border-slate-600/40';
  }
}

export function NoteCard({ note, studentName, onToggleComplete, onEdit, onDelete }: NoteCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      variant="default"
      padding="md"
      className={cn(
        'border-l-4 transition-all',
        note.isCompleted && 'opacity-60',
        note.type === 'alert' && 'border-l-rose-500/60',
        note.type === 'action' && 'border-l-amber-500/60',
        note.type === 'context' && 'border-l-sky-500/60',
        note.type === 'general' && 'border-l-slate-600/60'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-800 flex-shrink-0 mt-0.5">
          {noteTypeIcon(note.type)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header: type badge + priority + date */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', typeBadgeColor(note.type))}>
              {noteTypeLabel(note.type)}
            </span>
            <Badge variant={priorityBadgeVariant(note.priority)}>
              {note.priority === 'urgent' ? 'Urgente' : note.priority === 'high' ? 'Alta' : note.priority === 'medium' ? 'Media' : 'Baja'}
            </Badge>
            <span className="text-xs text-slate-600">{relativeDate(note.createdAt)}</span>
            {note.isCompleted && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                <CheckCheck size={12} strokeWidth={1.5} />
                Completada
              </span>
            )}
          </div>

          {/* Student name & title */}
          {studentName && (
            <button
              onClick={() => navigate(`/students/${note.studentId}`)}
              className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 transition-colors text-left"
            >
              {studentName}
            </button>
          )}
          <p className={cn('text-sm font-medium mt-1', note.isCompleted ? 'text-slate-500 line-through' : 'text-slate-200')}>
            {note.title}
          </p>

          {/* Content */}
          {note.content && (
            <p className="text-sm text-slate-400 mt-2 whitespace-pre-wrap">{note.content}</p>
          )}

          {/* Footer: due date */}
          <div className="flex items-center gap-3 mt-3">
            {note.dueDate && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <CalendarDays size={12} strokeWidth={1.5} />
                Vence: {formatDate(note.dueDate)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleComplete(note.id, note.isCompleted)}
            aria-label={note.isCompleted ? 'Reabrir nota' : 'Marcar como completada'}
          >
            <CheckCheck size={14} strokeWidth={1.5} className={note.isCompleted ? 'text-emerald-400' : 'text-slate-500'} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(note)}
            aria-label="Editar nota"
          >
            <FileText size={14} strokeWidth={1.5} className="text-slate-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(note.id)}
            aria-label="Eliminar nota"
          >
            <Trash2 size={14} strokeWidth={1.5} className="text-slate-500 hover:text-rose-400" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
