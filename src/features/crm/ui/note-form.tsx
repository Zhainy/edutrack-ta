import { useState } from 'react';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
import { AiNoteFormatButton } from '@/features/ai-assistant/ui/ai-note-format-button';
import type { Note } from '@/entities/note';
import type { Student } from '@/entities/student';

interface NoteFormProps {
  students: Student[];
  initialNote?: Note | null;
  preselectedStudentId?: string;
  onSave: (note: Note) => void;
  onCancel: () => void;
}

export function NoteForm({ students, initialNote, preselectedStudentId, onSave, onCancel }: NoteFormProps) {
  const [studentId, setStudentId] = useState(preselectedStudentId || initialNote?.studentId || '');
  const [type, setType] = useState<Note['type']>(initialNote?.type || 'general');
  const [priority, setPriority] = useState<Note['priority']>(initialNote?.priority || 'medium');
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [dueDate, setDueDate] = useState(initialNote?.dueDate || '');

  const studentOptions = [
    { value: '', label: 'Seleccionar estudiante...', disabled: true },
    ...students.map(s => ({
      value: s.id,
      label: `${s.fullName}${s.email ? ` (${s.email})` : ''}`,
    })),
  ];

  const showStudentSelector = !preselectedStudentId || students.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !studentId) return;

    const now = new Date().toISOString();
    const note: Note = initialNote
      ? {
          ...initialNote,
          type,
          priority,
          title: title.trim(),
          content: content.trim() || undefined,
          dueDate: dueDate || undefined,
          updatedAt: now,
        }
      : {
          id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          studentId,
          type,
          priority,
          title: title.trim(),
          content: content.trim() || undefined,
          dueDate: dueDate || undefined,
          isCompleted: false,
          createdAt: now,
          updatedAt: now,
        };
    onSave(note);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showStudentSelector ? (
        <Select
          label="Estudiante"
          value={studentId}
          onValueChange={setStudentId}
          options={studentOptions}
          required
        />
      ) : (
        <input type="hidden" name="studentId" value={studentId} />
      )}
      <Input
        label="Título"
        placeholder="Título de la nota"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-400">Contenido</label>
        <textarea
          className="w-full rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-sm px-3 py-2 h-24 resize-none transition-colors focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
          placeholder="Descripción detallada..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <AiNoteFormatButton
          content={content}
          onApplyFormatted={(formatted) => setContent(formatted)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-400">Tipo</label>
        <div className="flex gap-2">
          {(['general', 'context', 'action', 'alert'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                type === t
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'general' ? 'General' : t === 'context' ? 'Contexto' : t === 'action' ? 'Acción' : 'Alerta'}
            </button>
          ))}
        </div>
      </div>
      <Select
        label="Prioridad"
        value={priority}
        onValueChange={(v) => setPriority(v as Note['priority'])}
        options={[
          { value: 'low', label: 'Baja' },
          { value: 'medium', label: 'Media' },
          { value: 'high', label: 'Alta' },
          { value: 'urgent', label: 'Urgente' },
        ]}
      />
      <Input
        label="Fecha de vencimiento (opcional)"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit" disabled={!title.trim() || !studentId}>
          {initialNote ? 'Guardar Cambios' : 'Guardar Nota'}
        </Button>
      </div>
    </form>
  );
}
