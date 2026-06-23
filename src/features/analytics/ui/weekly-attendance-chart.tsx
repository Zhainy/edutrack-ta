import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/empty-state';

interface WeekData {
  week: string;
  date: string;
  attendanceRate: number;
  presentCount: number;
  totalClasses: number;
}

interface WeeklyAttendanceChartProps {
  data?: WeekData[] | null;
  isLoading: boolean;
}

export function WeeklyAttendanceChart({ data, isLoading }: WeeklyAttendanceChartProps) {
  const sorted = useMemo(() => {
    if (!data) return [];
    return [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data]);

  const chartData = useMemo(() => {
    return sorted.map((d) => ({
      ...d,
      weekLabel: `Sem ${d.week.slice(5)}`,
      rate: Math.round(d.attendanceRate),
    }));
  }, [sorted]);

  return (
    <Card variant="default" padding="lg">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">
        Asistencia Semanal
      </h3>
      {isLoading ? (
        <Skeleton variant="rectangular" height={220} />
      ) : chartData.length === 0 ? (
        <EmptyState
          title="Sin datos"
          description="Aún no hay registros de asistencia."
        />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="weekLabel"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              unit="%"
            />
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f1f5f9',
                fontSize: 13,
              }}
              labelFormatter={(label: string) => label}
              formatter={(value: number) => [`${value}%`, 'Asistencia']}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={{ fill: '#38bdf8', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
