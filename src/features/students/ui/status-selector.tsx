import { useState } from 'react';
import { updateStudentStatus } from '@/features/students/api/students-api';
import { toast } from '@/shared/ui/toast';
import type { StudentStatus } from '@/entities/student';

interface StatusSelectorProps {
  studentId: string;
  currentStatus: StudentStatus;
  onChange?: (newStatus: StudentStatus) => void;
  size?: 'sm' | 'md';
}

const statusConfig: Record<StudentStatus, { label: string; color: string }> = {
  active: { label: 'Activo', color: 'bg-emerald-500' },
  dropout: { label: 'Desertor', color: 'bg-rose-500' },
  inactive: { label: 'Inactivo', color: 'bg-amber-400' },
  replacement: { label: 'Reemplazo', color: 'bg-sky-400' },
};

export function StatusSelector({ studentId, currentStatus, onChange, size = 'md' }: StatusSelectorProps) {
  const [isChanging, setIsChanging] = useState(false);

  const handleChange = async (newStatus: StudentStatus) => {
    if (newStatus === currentStatus) return;
    try {
      setIsChanging(true);
      await updateStudentStatus(studentId, newStatus);
      toast.success(`Estado actualizado a ${statusConfig[newStatus].label}`);
      onChange?.(newStatus);
    } catch (error) {
      toast.error('Error al actualizar estado');
      console.error(error);
    } finally {
      setIsChanging(false);
    }
  };

  const heightClass = size === 'sm' ? 'h-7 text-xs' : 'h-9 text-sm';

  return (
    <select
      value={currentStatus}
      onChange={(e) => handleChange(e.target.value as StudentStatus)}
      disabled={isChanging}
      className={`
        ${heightClass} px-3 py-1.5 rounded-md font-medium
        text-white border-0 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950
        ${statusConfig[currentStatus].color}
      `}
    >
      {Object.entries(statusConfig).map(([value, config]) => (
        <option key={value} value={value} className="bg-slate-800 text-slate-100">
          {config.label}
        </option>
      ))}
    </select>
  );
}
