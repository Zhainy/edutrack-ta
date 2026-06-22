export const RISK_THRESHOLDS = {
  hours: {
    critical: 50,
    warning: 75,
  },
  attendance: {
    critical: 70,
    warning: 85,
  },
  activities: {
    critical: 50,
    warning: 75,
  },
  inactivity: {
    critical: 7,
  },
  totalScore: {
    high: 70,
    medium: 40,
  },
} as const;

export const FACTOR_WEIGHTS = {
  hours: 0.35,
  attendance: 0.25,
  activities: 0.25,
  engagement: 0.15,
} as const;
