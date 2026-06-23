import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAttendanceStore } from '@/features/attendance';
import {
  getCohortAnalytics,
  RiskDistributionChart,
  WeeklyAttendanceChart,
  StudentComparisonTable,
  CohortKpis,
  buildExtendedKpiItems,
} from '@/features/analytics';
import { EmptyState } from '@/shared/ui/empty-state';
import type { CohortAnalytics } from '@/features/analytics';

export function AnalyticsPage() {
  const activeCohortId = useAttendanceStore((s) => s.activeCohortId);
  const [data, setData] = useState<CohortAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeCohortId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getCohortAnalytics(activeCohortId!);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar analítica');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [activeCohortId]);

  if (!activeCohortId) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<AlertTriangle size={24} strokeWidth={1.5} />}
          title="Sin cohorte seleccionada"
          description="Selecciona una cohorte en la página de asistencia para ver la analítica."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<AlertTriangle size={24} strokeWidth={1.5} />}
          title="Error al cargar analítica"
          description={error}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Analítica</h1>
        <p className="mt-1 text-sm text-slate-400">
          Métricas y reportes de la cohorte
        </p>
      </div>

      <CohortKpis
        items={buildExtendedKpiItems(data)}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskDistributionChart
          data={data?.riskDistribution}
          isLoading={isLoading}
        />
        <WeeklyAttendanceChart
          data={data?.weeklyAttendance}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudentComparisonTable
          title="Mejores Rendimientos"
          data={data?.topPerformers}
          isLoading={isLoading}
          variant="top"
        />
        <StudentComparisonTable
          title="Estudiantes en Riesgo"
          data={data?.atRiskStudents}
          isLoading={isLoading}
          variant="risk"
        />
      </div>
    </div>
  );
}
