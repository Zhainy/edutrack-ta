import { getGroqAPIKey } from '@/shared/config/feature-flags';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqCompletionOptions {
  messages: GroqMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class GroqApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'GroqApiError';
  }
}

function getApiKey(): string {
  const key = getGroqAPIKey();
  if (!key) {
    throw new GroqApiError(
      'API key de Groq no configurada. Configura VITE_GROQ_API_KEY en .env.local',
      undefined,
      'MISSING_API_KEY',
    );
  }
  return key;
}

async function request<T>(endpoint: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${GROQ_API_URL}/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getApiKey()}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new GroqApiError(
      body?.error?.message || `Error en Groq API: ${res.status}`,
      res.status,
      body?.error?.code,
    );
  }

  return res.json();
}

export interface GroqCompletionResponse {
  id: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function createCompletion(
  options: GroqCompletionOptions,
): Promise<GroqCompletionResponse> {
  return request<GroqCompletionResponse>('', {
    method: 'POST',
    body: JSON.stringify({
      model: options.model || DEFAULT_MODEL,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
    }),
  });
}

export async function createCompletionStream(
  options: GroqCompletionOptions,
  onChunk: (text: string) => void,
  onDone?: (fullText: string) => void,
): Promise<void> {
  const res = await fetch(`${GROQ_API_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: options.model || DEFAULT_MODEL,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
      stream: true,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new GroqApiError(
      body?.error?.message || `Error en Groq API: ${res.status}`,
      res.status,
      body?.error?.code,
    );
  }

  const reader = res.body?.getReader();
  if (!reader) throw new GroqApiError('No se pudo leer el stream');

  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            onChunk(delta);
          }
        } catch {
          /* skip malformed chunks */
        }
      }
    }

    if (buffer.trim()) {
      const trimmed = buffer.trim();
      if (trimmed.startsWith('data: ')) {
        const data = trimmed.slice(6);
        if (data !== '[DONE]') {
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullText += delta;
              onChunk(delta);
            }
          } catch {
            /* skip */
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  onDone?.(fullText);
}
