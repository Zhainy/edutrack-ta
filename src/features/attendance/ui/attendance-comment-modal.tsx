import { useState } from 'react';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { parseLocalDate } from '@/features/attendance/lib/generate-dates';

interface AttendanceCommentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  date: string;
  currentComment?: string;
  onSave: (comment: string) => void;
}

export function AttendanceCommentModal({
  open,
  onOpenChange,
  studentName,
  date,
  currentComment,
  onSave,
}: AttendanceCommentModalProps) {
  const [comment, setComment] = useState(currentComment || '');

  const handleSave = () => {
    onSave(comment);
    onOpenChange(false);
  };

  const d = parseLocalDate(date);
  const formattedDate = d.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Comentario de Asistencia"
      description={`${studentName} — ${formattedDate}`}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Guardar
          </Button>
        </>
      }
    >
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Agregar comentario sobre la asistencia..."
        rows={4}
        className="w-full rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-sm px-3 py-2 resize-none transition-colors focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
      />
    </Modal>
  );
}
