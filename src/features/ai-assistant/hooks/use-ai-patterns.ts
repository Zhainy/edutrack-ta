import { useState, useCallback } from 'react';
import { createCompletion } from '../api/groq-api';
import { PATTERNS_SYSTEM_PROMPT, buildPatternsPrompt } from '../lib/prompts';

export interface AiPattern {
  title: string;
  description: string;
  affectedCount: number;
  severity: 'high' | 'medium' | 'low';
  suggestedAction: string;
}

export interface AiPatternsResult {
  patterns: AiPattern[];
  summary: string;
  cohortHealth: 'good' | 'fair' | 'critical';
}

interface StudentBreakdown {
  status: string;
  riskLevel: string;
  attendanceRate: number;
  hoursCompletion: number;
  activityCompletion: number;
}

interface UseAiPatternsInput {
  totalStudents: number;
  activeStudents: number;
  dropoutCount: number;
  riskDistribution: { low: number; medium: number; high: number };
  avgAttendance: number;
  avgHoursCompletion: number;
  avgActivityCompletion: number;
  studentsBreakdown: StudentBreakdown[];
}

export function useAiPatterns() {
  const [result, setResult] = useState<AiPatternsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (input: UseAiPatternsInput) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await createCompletion({
        messages: [
          { role: 'system', content: PATTERNS_SYSTEM_PROMPT },
          {
            role: 'user',
            content: buildPatternsPrompt(
              input.totalStudents,
              input.activeStudents,
              input.dropoutCount,
              input.riskDistribution,
              input.avgAttendance,
              input.avgHoursCompletion,
              input.avgActivityCompletion,
              input.studentsBreakdown,
            ),
          },
        ],
        temperature: 0.5,
        maxTokens: 2048,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Respuesta vacía de la IA');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No se pudo parsear la respuesta JSON');
      }

      const parsed: AiPatternsResult = JSON.parse(jsonMatch[0]);
      setResult(parsed);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al analizar patrones';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, isLoading, error, analyze, reset };
}
