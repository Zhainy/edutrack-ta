import { create } from 'zustand';
import { RISK_THRESHOLDS } from '@/features/risk-engine';

export interface TaProfile {
  name: string;
  email: string;
  role: string;
  phone: string;
}

export interface RiskThresholds {
  hours: { critical: number; warning: number };
  attendance: { critical: number; warning: number };
  activities: { critical: number; warning: number };
  inactivity: { critical: number };
  totalScore: { high: number; medium: number };
}

export interface Preferences {
  dateFormat: string;
  language: 'es' | 'en';
}

interface SettingsState {
  profile: TaProfile;
  riskThresholds: RiskThresholds;
  preferences: Preferences;
  updateProfile: (updates: Partial<TaProfile>) => void;
  updateRiskThresholds: (updates: Partial<RiskThresholds>) => void;
  updatePreferences: (updates: Partial<Preferences>) => void;
  resetRiskThresholds: () => void;
}

const PROFILE_KEY = 'edutrack-settings-profile';
const PREFERENCES_KEY = 'edutrack-settings-preferences';
const THRESHOLDS_KEY = 'edutrack-settings-thresholds';

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

const DEFAULT_PROFILE: TaProfile = {
  name: '',
  email: '',
  role: '',
  phone: '',
};

const DEFAULT_PREFERENCES: Preferences = {
  dateFormat: 'dd/MM/yyyy',
  language: 'es',
};

export const useSettingsStore = create<SettingsState>((set) => ({
  profile: loadJSON(PROFILE_KEY, DEFAULT_PROFILE),
  riskThresholds: loadJSON(THRESHOLDS_KEY, { ...RISK_THRESHOLDS }),
  preferences: loadJSON(PREFERENCES_KEY, DEFAULT_PREFERENCES),

  updateProfile: (updates) => {
    set((state) => {
      const profile = { ...state.profile, ...updates };
      saveJSON(PROFILE_KEY, profile);
      return { profile };
    });
  },

  updateRiskThresholds: (updates) => {
    set((state) => {
      const riskThresholds = { ...state.riskThresholds, ...updates };
      saveJSON(THRESHOLDS_KEY, riskThresholds);
      return { riskThresholds };
    });
  },

  updatePreferences: (updates) => {
    set((state) => {
      const preferences = { ...state.preferences, ...updates };
      saveJSON(PREFERENCES_KEY, preferences);
      return { preferences };
    });
  },

  resetRiskThresholds: () => {
    const defaults: RiskThresholds = { ...RISK_THRESHOLDS };
    saveJSON(THRESHOLDS_KEY, defaults);
    set({ riskThresholds: defaults });
  },
}));
