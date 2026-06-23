import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/empty-state';

const COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f43f5e',
};

const LABELS: Record<string, string> = {
  low: 'Riesgo Bajo',
  medium: 'Riesgo Medio',
  high: 'Riesgo Alto',
};

interface RiskDistributionChartProps {
  data?: Record<string, number> | null;
  isLoading: boolean;
}

export function RiskDistributionChart({ data, isLoading }: RiskDistributionChartProps) {
  const chartData = data
    ? Object.entries(data).map(([key, value]) => ({
        name: LABELS[key] ?? key,
        value,
        color: COLORS[key as keyof typeof COLORS] ?? '#64748b',
      }))
    : [];

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card variant="default" padding="lg">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">
        Distribución de Riesgo
      </h3>
      {isLoading ? (
        <Skeleton variant="rectangular" height={220} />
      ) : chartData.length === 0 || total === 0 ? (
        <EmptyState
          title="Sin datos"
          description="No hay estudiantes con evaluación de riesgo."
        />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value} estudiantes`, '']}
              contentStyle={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f1f5f9',
                fontSize: 13,
              }}
            />
            <Legend
              formatter={(value: string) => (
                <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
