import { useEffect } from 'react';
import { Sparkles, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { useAiRecommendations } from '../hooks/use-ai-recommendations';
import { isAIAvailable } from '@/shared/config/feature-flags';
import type { RiskOutput } from '@/features/risk-engine/types';

interface AiRecommendationsProps {
  studentName: string;
  risk: RiskOutput;
}

export function AiRecommendations({ studentName, risk }: AiRecommendationsProps) {
  const { recommendations, isLoading, error, generate, reset } = useAiRecommendations();

  const available = isAIAvailable();

  useEffect(() => {
    return () => reset();
  }, [reset]);

  if (!available) return null;

  const handleGenerate = () => {
    generate({
      studentName,
      riskScore: risk.riskScore,
      riskLevel: risk.riskLevel,
      factors: risk.factors,
      metrics: risk.metrics,
    });
  };

  return (
    <Card variant="default" padding="lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Sparkles size={14} strokeWidth={1.5} className="text-indigo-400" />
          Recomendaciones IA
        </h4>
        {!recommendations && !isLoading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerate}
            leftIcon={<Sparkles size={14} />}
          >
            Generar
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-300">
          <AlertCircle size={14} strokeWidth={1.5} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading && (
        <div className="space-y-2">
          <div className="h-4 bg-slate-800/50 rounded animate-pulse w-full" />
          <div className="h-4 bg-slate-800/50 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-slate-800/50 rounded animate-pulse w-5/6" />
          <div className="h-4 bg-slate-800/50 rounded animate-pulse w-2/3" />
        </div>
      )}

      {recommendations && !isLoading && (
        <div className="space-y-2">
          <ul className="space-y-2">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <ChevronRight size={16} strokeWidth={1.5} className="mt-0.5 text-indigo-400 flex-shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerate}
            leftIcon={<RefreshCw size={14} />}
            className="mt-2"
          >
            Regenerar
          </Button>
        </div>
      )}
    </Card>
  );
}
