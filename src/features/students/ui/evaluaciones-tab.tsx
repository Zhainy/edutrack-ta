import { useEffect, useState } from 'react';
import { getStudentModuleGrades, getStudentAverage } from '@/features/students/api/students-api';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/empty-state';
import { ClipboardList } from 'lucide-react';
import type { ModuleGrade } from '@/entities/module-grade';

interface EvaluacionesTabProps {
  studentId: string;
}

function getGradeColor(grade: number | null, isPending: boolean): string {
  if (isPending || grade === null) return 'text-slate-400 bg-slate-800';
  if (grade >= 6) return 'text-emerald-400 bg-emerald-500/10';
  if (grade >= 5) return 'text-amber-400 bg-amber-400/10';
  return 'text-rose-400 bg-rose-500/10';
}

function getGradeLabel(grade: number | null, isPending: boolean): string {
  if (isPending || grade === null) return 'PENDIENTE';
  return grade.toFixed(1);
}

export function EvaluacionesTab({ studentId }: EvaluacionesTabProps) {
  const [grades, setGrades] = useState<ModuleGrade[]>([]);
  const [average, setAverage] = useState({ average: 0, completedModules: 0, totalModules: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [gradesData, avgData] = await Promise.all([
          getStudentModuleGrades(studentId),
          getStudentAverage(studentId),
        ]);
        if (!cancelled) {
          setGrades(gradesData);
          setAverage(avgData);
        }
      } catch (error) {
        console.error('Error loading grades:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [studentId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} variant="text" lines={1} />)}
      </div>
    );
  }

  if (grades.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList size={24} strokeWidth={1.5} />}
        title="Sin evaluaciones"
        description="No hay notas de módulo registradas para este estudiante."
      />
    );
  }

  const statusBadge = average.average >= 6
    ? 'active'
    : average.average >= 5
      ? 'risk-medium'
      : 'risk-high';

  const statusLabel = average.average >= 6
    ? 'Aprobado'
    : average.average >= 5
      ? 'En riesgo'
      : 'Reprobado';

  const avgColor = average.average >= 6
    ? 'text-emerald-400'
    : average.average >= 5
      ? 'text-amber-400'
      : 'text-rose-400';

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card variant="default" padding="md">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Promedio General</p>
          <p className={`text-2xl font-bold font-mono mt-1 ${avgColor}`}>
            {average.average.toFixed(2)}
          </p>
        </Card>
        <Card variant="default" padding="md">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Módulos Evaluados</p>
          <p className="text-2xl font-bold font-mono mt-1 text-slate-100">
            {average.completedModules} / {average.totalModules}
          </p>
        </Card>
        <Card variant="default" padding="md">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Estado</p>
          <div className="mt-2">
            <Badge variant={statusBadge}>{statusLabel}</Badge>
          </div>
        </Card>
      </div>

      {/* Grades table */}
      <Card variant="default" padding="lg">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Notas por Módulo</h3>
        <div className="space-y-2">
          {grades.map((grade) => (
            <div
              key={grade.id}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500 w-12 font-mono">M{grade.moduleNumber}</span>
                <span className="text-sm font-medium text-slate-200">
                  Módulo {grade.moduleNumber}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {grade.sentDate && (
                  <span className="text-xs text-slate-500">
                    Enviada: {new Date(grade.sentDate).toLocaleDateString('es-CL')}
                  </span>
                )}
                <span className={`px-3 py-1 rounded-md text-sm font-bold ${getGradeColor(grade.grade, grade.isPending)}`}>
                  {getGradeLabel(grade.grade, grade.isPending)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
