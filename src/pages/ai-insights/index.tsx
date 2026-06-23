import { useEffect, useState, useMemo } from 'react';
import { Sparkles, Brain, Users, AlertTriangle } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { db } from '@/shared/lib/database';
import { calculateRisk } from '@/features/risk-engine';
import { AiPatternsPanel } from '@/features/ai-assistant/ui/ai-patterns-panel';
import { isAIAvailable } from '@/shared/config/feature-flags';
import type { Student } from '@/entities/student';
import type { RiskOutput } from '@/features/risk-engine/types';

export function AiInsightsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [riskData, setRiskData] = useState<Map<string, RiskOutput>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const allStudents = await db.students.toArray();
        if (cancelled) return;
        setStudents(allStudents);

        const allAttendance = await db.attendance.toArray();
        const allProgress = await db.progress.toArray();
        const allDedication = await db.dedication.toArray();
        const allSyllabus = await db.syllabus.toArray();
        if (cancelled) return;

        const riskMap = new Map<string, RiskOutput>();
        for (const student of allStudents) {
          const studentAttendance = allAttendance.filter(a => a.studentId === student.id);
          const studentProgress = allProgress.filter(p => p.studentId === student.id);
          const studentDedication = allDedication.filter(d => d.studentId === student.id);

          try {
            const risk = calculateRisk({
              student,
              attendance: studentAttendance,
              progress: studentProgress,
              dedication: studentDedication,
              syllabus: allSyllabus,
              referenceDate: new Date(),
              allCohortProgress: allProgress,
            });
            riskMap.set(student.id, risk);
          } catch {
            /* skip students with incomplete data */
          }
        }

        if (!cancelled) setRiskData(riskMap);
      } catch (err) {
        console.error('Error loading data for AI insights:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => {
    if (riskData.size === 0) return null;
    let low = 0, medium = 0, high = 0;
    for (const risk of riskData.values()) {
      if (risk.riskLevel === 'low') low++;
      else if (risk.riskLevel === 'medium') medium++;
      else high++;
    }
    return { total: riskData.size, low, medium, high };
  }, [riskData]);

  const available = isAIAvailable();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="text" width="200px" />
        <Skeleton variant="rectangular" width="100%" height="200px" />
        <Skeleton variant="text" lines={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <Brain size={22} strokeWidth={1.5} className="text-indigo-400" />
            AI Insights
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Análisis inteligente de patrones de deserción y reprobación
          </p>
        </div>
        {!available && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300">
            <AlertTriangle size={14} />
            Habilita VITE_ENABLE_AI y VITE_GROQ_API_KEY para usar esta función
          </div>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-300">
                <Users size={18} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">{stats.total}</p>
                <p className="text-xs text-slate-500">Estudiantes analizados</p>
              </div>
            </div>
          </Card>
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-300">
                <Sparkles size={18} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">{stats.low}</p>
                <p className="text-xs text-slate-500">Riesgo bajo</p>
              </div>
            </div>
          </Card>
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-400/10 text-amber-300">
                <AlertTriangle size={18} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">{stats.medium}</p>
                <p className="text-xs text-slate-500">Riesgo medio</p>
              </div>
            </div>
          </Card>
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-rose-500/10 text-rose-300">
                <AlertTriangle size={18} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">{stats.high}</p>
                <p className="text-xs text-slate-500">Riesgo alto</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <AiPatternsPanel students={students} riskData={riskData} />
    </div>
  );
}
