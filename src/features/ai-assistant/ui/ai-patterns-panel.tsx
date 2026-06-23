import { Sparkles, AlertCircle, TrendingUp, Users, RefreshCw } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { EmptyState } from '@/shared/ui/empty-state';
import { useAiPatterns } from '../hooks/use-ai-patterns';
import { isAIAvailable } from '@/shared/config/feature-flags';
import type { Student } from '@/entities/student';
import type { RiskOutput } from '@/features/risk-engine/types';

interface AiPatternsPanelProps {
  students: Student[];
  riskData: Map<string, RiskOutput>;
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'high':
      return {
        border: 'border-rose-500/20',
        bg: 'bg-rose-500/10',
        text: 'text-rose-300',
        dot: 'bg-rose-500',
      };
    case 'medium':
      return {
        border: 'border-amber-400/20',
        bg: 'bg-amber-400/10',
        text: 'text-amber-300',
        dot: 'bg-amber-400',
      };
    default:
      return {
        border: 'border-emerald-500/20',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-300',
        dot: 'bg-emerald-500',
      };
  }
}

export function AiPatternsPanel({ students, riskData }: AiPatternsPanelProps) {
  const { result, isLoading, error, analyze } = useAiPatterns();

  const available = isAIAvailable();
  if (!available) return null;

  const handleAnalyze = () => {
    const activeStudents = students.filter(s => s.status === 'active' || s.status === 'replacement');
    const dropoutStudents = students.filter(s => s.status === 'dropout' || s.status === 'inactive');

    let low = 0, medium = 0, high = 0;
    let totalHoursCompletion = 0, totalActivityCompletion = 0, totalAttendanceRate = 0;
    const studentsBreakdown: { status: string; riskLevel: string; attendanceRate: number; hoursCompletion: number; activityCompletion: number }[] = [];

    for (const student of students) {
      const risk = riskData.get(student.id);
      if (!risk) continue;

      if (risk.riskLevel === 'low') low++;
      else if (risk.riskLevel === 'medium') medium++;
      else high++;

      totalHoursCompletion += risk.metrics.completionRate;
      totalActivityCompletion += risk.metrics.activityCompletion;
      totalAttendanceRate += risk.metrics.attendanceRate;

      if (risk.riskLevel === 'high' || risk.riskLevel === 'medium') {
        studentsBreakdown.push({
          status: student.status,
          riskLevel: risk.riskLevel,
          attendanceRate: risk.metrics.attendanceRate / 100,
          hoursCompletion: risk.metrics.completionRate / 100,
          activityCompletion: risk.metrics.activityCompletion / 100,
        });
      }
    }

    const studentCount = riskData.size;
    analyze({
      totalStudents: students.length,
      activeStudents: activeStudents.length,
      dropoutCount: dropoutStudents.length,
      riskDistribution: { low, medium, high },
      avgAttendance: studentCount > 0 ? totalAttendanceRate / studentCount : 0,
      avgHoursCompletion: studentCount > 0 ? totalHoursCompletion / studentCount : 0,
      avgActivityCompletion: studentCount > 0 ? totalActivityCompletion / studentCount : 0,
      studentsBreakdown,
    });
  };

  const healthConfig = {
    good: { label: 'Buena', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    fair: { label: 'Regular', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
    critical: { label: 'Crítica', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  };

  if (!result && !isLoading && !error) {
    return (
      <Card variant="default" padding="lg">
        <EmptyState
          icon={<Sparkles size={32} strokeWidth={1.5} />}
          title="Análisis de Patrones IA"
          description="Analiza los datos de la cohorte para detectar patrones de deserción y reprobación, y recibe recomendaciones preventivas."
          action={
            <Button variant="primary" onClick={handleAnalyze} leftIcon={<Sparkles size={16} />}>
              Analizar Patrones
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-300">
          <AlertCircle size={14} strokeWidth={1.5} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading && (
        <Card variant="default" padding="lg">
          <div className="space-y-3">
            <div className="h-5 bg-slate-800/50 rounded animate-pulse w-48" />
            <div className="h-4 bg-slate-800/50 rounded animate-pulse w-full" />
            <div className="h-4 bg-slate-800/50 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-slate-800/50 rounded animate-pulse w-5/6" />
            <div className="h-20 bg-slate-800/50 rounded animate-pulse w-full" />
          </div>
        </Card>
      )}

      {result && !isLoading && (
        <>
          <Card variant="default" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <TrendingUp size={16} strokeWidth={1.5} className="text-indigo-400" />
                Resumen de Análisis
              </h3>
              <Button variant="ghost" size="sm" onClick={handleAnalyze} leftIcon={<RefreshCw size={14} />}>
                Re-analizar
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${healthConfig[result.cohortHealth].bg} ${healthConfig[result.cohortHealth].border} ${healthConfig[result.cohortHealth].color}`}>
                Salud de la cohorte: {healthConfig[result.cohortHealth].label}
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">{result.summary}</p>
          </Card>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <AlertCircle size={16} strokeWidth={1.5} className="text-indigo-400" />
              Patrones Detectados ({result.patterns.length})
            </h3>
            {result.patterns.map((pattern, i) => {
              const colors = getSeverityColor(pattern.severity);
              return (
                <Card key={i} variant="default" padding="lg" className={colors.border}>
                  <div className="flex items-start gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${colors.bg} flex-shrink-0`}>
                      <Users size={16} strokeWidth={1.5} className={colors.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-slate-200">{pattern.title}</h4>
                        <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{pattern.description}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>Afecta a {pattern.affectedCount} estudiantes</span>
                        <Badge
                          variant={
                            pattern.severity === 'high'
                              ? 'risk-high'
                              : pattern.severity === 'medium'
                                ? 'risk-medium'
                                : 'risk-low'
                          }
                          label={
                            pattern.severity === 'high'
                              ? 'Crítico'
                              : pattern.severity === 'medium'
                                ? 'Moderado'
                                : 'Leve'
                          }
                        />
                      </div>
                      <p className="text-sm text-slate-300 mt-2">
                        <span className="text-indigo-400 font-medium">Acción sugerida:</span>{' '}
                        {pattern.suggestedAction}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
