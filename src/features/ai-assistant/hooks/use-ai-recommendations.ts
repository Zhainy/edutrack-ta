import { useState, useCallback } from 'react';
import { createCompletion } from '../api/groq-api';
import {
  RECOMMENDATIONS_SYSTEM_PROMPT,
  buildRecommendationsPrompt,
} from '../lib/prompts';

interface UseAiRecommendationsOptions {
  studentName: string;
  riskScore: number;
  riskLevel: string;
  factors: { category: string; severity: string; description: string }[];
  metrics: {
    completionRate: number;
    attendanceRate: number;
    activityCompletion: number;
    velocityTrend: string;
    daysSinceLastActivity: number;
  };
}

export function useAiRecommendations() {
  const [recommendations, setRecommendations] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (options: UseAiRecommendationsOptions) => {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const response = await createCompletion({
        messages: [
          { role: 'system', content: RECOMMENDATIONS_SYSTEM_PROMPT },
          {
            role: 'user',
            content: buildRecommendationsPrompt(
              options.studentName,
              options.riskScore,
              options.riskLevel,
              options.factors,
              options.metrics,
            ),
          },
        ],
        temperature: 0.7,
        maxTokens: 1024,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Respuesta vacía de la IA');
      }

      const parsed = content
        .split('\n')
        .map((l) => l.replace(/^[\d*•\-\s]+/, '').trim())
        .filter((l) => l.length > 10);

      setRecommendations(parsed.length > 0 ? parsed : [content]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al generar recomendaciones';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setRecommendations(null);
    setError(null);
  }, []);

  return { recommendations, isLoading, error, generate, reset };
}
