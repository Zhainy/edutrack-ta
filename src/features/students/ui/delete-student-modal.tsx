import { AlertTriangle } from 'lucide-react';
import { Modal, Button } from '@/shared/ui';

interface DeleteStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  onConfirm: () => void;
  isLoading?: boolean;
  isBulk?: boolean;
  count?: number;
}

export function DeleteStudentModal({
  open,
  onOpenChange,
  studentName,
  onConfirm,
  isLoading,
  isBulk,
  count,
}: DeleteStudentModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isBulk ? `Eliminar ${count} estudiantes` : 'Eliminar estudiante'}
      description={
        isBulk
          ? `¿Estás seguro de eliminar ${count} estudiantes?`
          : `¿Estás seguro de eliminar a "${studentName}"?`
      }
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} isLoading={isLoading}>
            {isLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={18} strokeWidth={1.5} className="text-rose-500" />
          <p className="text-sm text-slate-300">
            Esta acción eliminará permanentemente:
          </p>
        </div>
        <ul className="list-disc list-inside text-sm text-slate-400 space-y-1 ml-1">
          <li>Datos del estudiante</li>
          <li>Registros de asistencia</li>
          <li>Progreso de actividades</li>
          <li>Horas de dedicación</li>
          <li>Notas y comentarios</li>
          <li>Evaluaciones de módulo</li>
        </ul>
        <p className="text-sm text-rose-400 font-medium">
          Esta acción no se puede deshacer.
        </p>
      </div>
    </Modal>
  );
}
