import { type HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

type BadgeStatus = 'active' | 'dropout' | 'inactive' | 'risk-low' | 'risk-medium' | 'risk-high';
type BadgeVariant = BadgeStatus | 'default' | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  label?: string;
}

const statusStyles: Record<BadgeVariant, string> = {
  active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  dropout: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  inactive: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  'risk-low': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'risk-medium': 'bg-amber-400/20 text-amber-300 border-amber-400/30',
  'risk-high': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  default: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
  info: 'bg-sky-400/20 text-sky-300 border-sky-400/30',
};

const statusLabels: Partial<Record<BadgeStatus, string>> = {
  active: 'Activo',
  dropout: 'Desertor',
  inactive: 'Inactivo',
  'risk-low': 'Riesgo Bajo',
  'risk-medium': 'Riesgo Medio',
  'risk-high': 'Riesgo Alto',
};

export function Badge({ variant = 'default', label, className, children, ...props }: BadgeProps) {
  const displayText =
    label ??
    (variant in statusLabels ? statusLabels[variant as BadgeStatus] : undefined) ??
    children;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        statusStyles[variant],
        className
      )}
      {...props}
    >
      {displayText}
    </span>
  );
}
