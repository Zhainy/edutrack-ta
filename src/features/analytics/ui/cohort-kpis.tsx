import { Users, UserCheck, UserX, AlertTriangle, CalendarCheck, Brain } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

interface KpiItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

interface CohortKpisProps {
  items: KpiItem[];
  isLoading: boolean;
}

function KpiCard({ label, value, icon, color, isLoading }: KpiItem & { isLoading: boolean }) {
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
            .replace('-400', '-500/15')}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function CohortKpis({ items, isLoading }: CohortKpisProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <KpiCard key={item.label} {...item} isLoading={isLoading} />
      ))}
    </div>
  );
}

export function buildKpiItems(data: {
  totalStudents: number;
  activeStudents: number;
  dropoutStudents: number;
  averageAttendance: number;
  averageHours: number;
  averageRiskScore: number;
} | null) {
  if (!data) return [];

  return [
    {
      label: 'Total Estudiantes',
      value: data.totalStudents,
      icon: <Users size={20} strokeWidth={1.5} />,
      color: 'text-sky-400',
    },
    {
      label: 'Estudiantes Activos',
      value: data.activeStudents,
      icon: <UserCheck size={20} strokeWidth={1.5} />,
      color: 'text-emerald-400',
    },
    {
      label: 'Desertores',
      value: data.dropoutStudents,
      icon: <UserX size={20} strokeWidth={1.5} />,
      color: 'text-rose-400',
    },
    {
      label: 'Asistencia Promedio',
      value: `${Math.round(data.averageAttendance)}%`,
      icon: <CalendarCheck size={20} strokeWidth={1.5} />,
      color: 'text-amber-400',
    },
  ];
}

export function buildExtendedKpiItems(data: {
  totalStudents: number;
  activeStudents: number;
  dropoutStudents: number;
  averageAttendance: number;
  averageHours: number;
  averageRiskScore: number;
} | null) {
  if (!data) return [];

  return [
    {
      label: 'Total Estudiantes',
      value: data.totalStudents,
      icon: <Users size={20} strokeWidth={1.5} />,
      color: 'text-sky-400',
    },
    {
      label: 'Activos',
      value: data.activeStudents,
      icon: <UserCheck size={20} strokeWidth={1.5} />,
      color: 'text-emerald-400',
    },
    {
      label: 'Desertores',
      value: data.dropoutStudents,
      icon: <UserX size={20} strokeWidth={1.5} />,
      color: 'text-rose-400',
    },
    {
      label: 'Asistencia',
      value: `${Math.round(data.averageAttendance)}%`,
      icon: <CalendarCheck size={20} strokeWidth={1.5} />,
      color: 'text-amber-400',
    },
    {
      label: 'Horas Promedio',
      value: `${Math.round(data.averageHours)}h`,
      icon: <Brain size={20} strokeWidth={1.5} />,
      color: 'text-purple-400',
    },
    {
      label: 'Riesgo Promedio',
      value: `${Math.round(data.averageRiskScore)}/100`,
      icon: <AlertTriangle size={20} strokeWidth={1.5} />,
      color: 'text-rose-400',
    },
  ];
}
