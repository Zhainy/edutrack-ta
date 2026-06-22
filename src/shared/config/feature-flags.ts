/**
 * Feature Flag System for EduTrack TA
 *
 * Enables toggling optional features without affecting the core app.
 * All flags are driven by Vite environment variables (VITE_* prefix).
 */

export const FEATURE_FLAGS = {
  /** Enables the AI assistant feature (Groq). Default: false */
  ENABLE_AI: import.meta.env.VITE_ENABLE_AI === 'true',
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Returns true if the given feature flag is enabled.
 */
export function isFeatureEnabled(feature: FeatureFlag): boolean {
  return Boolean(FEATURE_FLAGS[feature]);
}

/**
 * Returns true only when the AI feature is both enabled AND the Groq
 * API key is present. Use this before rendering any AI-related UI.
 */
export function isAIAvailable(): boolean {
  if (!FEATURE_FLAGS.ENABLE_AI) return false;

  const hasGroqKey = Boolean(import.meta.env.VITE_GROQ_API_KEY);
  if (!hasGroqKey) {
    console.warn('⚠️ AI feature is enabled but VITE_GROQ_API_KEY is not configured');
    return false;
  }

  return true;
}

/**
 * Returns the Groq API key string, or null if it is not set.
 * Never log or expose the returned value in the UI.
 */
export function getGroqAPIKey(): string | null {
  return import.meta.env.VITE_GROQ_API_KEY ?? null;
}

export interface AIStatus {
  enabled: boolean;
  available: boolean;
  hasApiKey: boolean;
  provider: 'groq' | null;
}

/**
 * Returns the full AI configuration status.
 * Useful for displaying setup instructions in the Settings page.
 */
export function getAIStatus(): AIStatus {
  const hasGroqKey = Boolean(import.meta.env.VITE_GROQ_API_KEY);

  return {
    enabled: FEATURE_FLAGS.ENABLE_AI,
    available: isAIAvailable(),
    hasApiKey: hasGroqKey,
    provider: hasGroqKey ? 'groq' : null,
  };
}
