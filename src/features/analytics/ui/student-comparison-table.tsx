import { Badge } from '@/shared/ui/badge';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/empty-state';
import type { Student } from '@/entities';

interface StudentRow {
  student: Student;
  attendance: number;
  hours: number;
  riskScore: number;
  mainFactor?: string;
}

interface StudentComparisonTableProps {
  title: string;
  data?: StudentRow[] | null;
  isLoading: boolean;
  variant: 'top' | 'risk';
}

function riskBadge(score: number): 'risk-low' | 'risk-medium' | 'risk-high' {
  if (score >= 70) return 'risk-high';
  if (score >= 40) return 'risk-medium';
  return 'risk-low';
}

export function StudentComparisonTable({
  title,
  data,
  isLoading,
  variant,
}: StudentComparisonTableProps) {
  return (
    <Card variant="default" padding="lg">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">{title}</h3>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="text" lines={1} />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="Sin datos"
          description={
            variant === 'top'
              ? 'No hay estudiantes con datos suficientes.'
              : 'No hay estudiantes en riesgo.'
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-2 pr-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Estudiante
                </th>
                <th className="text-right py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Asistencia
                </th>
                <th className="text-right py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Horas
                </th>
                <th className="text-right py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Riesgo
                </th>
                {variant === 'risk' && (
                  <th className="text-right py-2 pl-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Factor Principal
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={row.student.id}
                  className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30"
                >
                  <td className="py-2 pr-3">
                    <p className="text-sm font-medium text-slate-200 truncate max-w-[160px]">
                      {row.student.fullName}
                    </p>
                    {row.student.email && (
                      <p className="text-xs text-slate-500 truncate max-w-[160px]">
                        {row.student.email}
                      </p>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-300">
                    {Math.round(row.attendance)}%
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-300">
                    {Math.round(row.hours)}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <Badge variant={riskBadge(row.riskScore)}>
                      {row.riskScore}pts
                    </Badge>
                  </td>
                  {variant === 'risk' && (
                    <td className="py-2 pl-3 text-right text-xs text-slate-400 max-w-[120px] truncate">
                      {row.mainFactor ?? '—'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
