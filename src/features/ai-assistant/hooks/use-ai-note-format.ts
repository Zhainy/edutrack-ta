import { useState, useCallback } from 'react';
import { createCompletion } from '../api/groq-api';
import {
  NOTE_FORMAT_SYSTEM_PROMPT,
  buildNoteFormatPrompt,
} from '../lib/prompts';

export function useAiNoteFormat() {
  const [formattedContent, setFormattedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const format = useCallback(async (informalContent: string) => {
    if (!informalContent.trim()) {
      setError('No hay contenido para formatear');
      return;
    }

    setIsLoading(true);
    setError(null);
    setFormattedContent(null);

    try {
      const response = await createCompletion({
        messages: [
          { role: 'system', content: NOTE_FORMAT_SYSTEM_PROMPT },
          { role: 'user', content: buildNoteFormatPrompt(informalContent) },
        ],
        temperature: 0.5,
        maxTokens: 512,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Respuesta vacía de la IA');
      }

      setFormattedContent(content.trim());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al formatear nota';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setFormattedContent(null);
    setError(null);
  }, []);

  return { formattedContent, isLoading, error, format, reset };
}
