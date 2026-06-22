# Spec: Risk Engine

## Overview
Motor de cálculo de riesgo de deserción/reprobación para EduTrack TA. Evalúa múltiples dimensiones del desempeño estudiantil (horas dedicadas, asistencia, completitud de actividades, tendencia de engagement) y genera un score de riesgo (0-100) con factores detallados y recomendaciones accionables para el TA.

## Requirements

### Functional Requirements
- [ ] REQ-001: El sistema debe calcular un score de riesgo (0-100) para cada estudiante activo, donde mayor valor indica mayor riesgo
- [ ] REQ-002: El cálculo debe evaluar 4 dimensiones: horas dedicadas vs esperadas, tasa de asistencia, completitud de actividades, engagement reciente
- [ ] REQ-003: Los umbrales de riesgo deben ser configurables en `features/risk-engine/config/thresholds.ts`
- [ ] REQ-004: El sistema debe generar factores de riesgo detallados con category, severity, description y weight
- [ ] REQ-005: El sistema debe generar recomendaciones accionables basadas en los factores detectados
- [ ] REQ-006: El sistema debe calcular la tendencia de velocidad comparando los últimos 14 días vs los 14 días anteriores
- [ ] REQ-007: El sistema debe detectar inactividad mayor a 7 días y marcarlo como factor crítico
- [ ] REQ-008: La función `calculateRisk` debe ser pura (sin side effects) y completamente testeable
- [ ] REQ-009: El hook `useStudentRisk(studentId)` debe cachear resultados y recalcular solo cuando cambien los datos fuente
- [ ] REQ-010: El sistema debe clasificar el riskLevel en 3 niveles: 'low' (< 40), 'medium' (40-69), 'high' (>= 70)

### Non-Functional Requirements
- [ ] NFR-001: El cálculo de riesgo para un estudiante no debe tardar más de 50ms
- [ ] NFR-002: El recálculo masivo de una cohorte de 100 estudiantes no debe tardar más de 500ms
- [ ] NFR-003: Los resultados del motor deben tener cobertura de tests >= 90% (lógica crítica)
- [ ] NFR-004: La función `calculateRisk` debe producir resultados determinísticos para los mismos inputs

## Acceptance Criteria

### Scenario: Estudiante con horas muy bajas recibe riesgo alto
**Given** un estudiante tiene 20 horas dedicadas sobre 50 horas esperadas hasta la fecha (40%)
**When** se ejecuta `calculateRisk` con sus datos
**Then** el factor 'hours' tiene severity 'high', se suman 40 puntos al score, y si no hay otros factores el riskLevel es 'medium'

### Scenario: Score acumulado determina riesgo alto
**Given** un estudiante tiene: horas al 60% (+20pts), asistencia al 65% (+30pts), sin actividad en 10 días (+20pts)
**When** se ejecuta `calculateRisk`
**Then** el totalScore es 70, riskLevel es 'high', y las recomendaciones incluyen "Contactar al estudiante de inmediato"

### Scenario: Tendencia decreciente agrega factor de engagement
**Given** un estudiante dedicó 5 horas en los últimos 14 días y 20 horas en los 14 días anteriores (25% del ritmo previo)
**When** se ejecuta `calculateRisk`
**Then** se agrega factor de categoría 'engagement' con severity 'medium' y se suman 10 puntos al score

### Scenario: Estudiante saludable tiene riesgo bajo
**Given** un estudiante tiene 90% de horas, 92% de asistencia, 80% de actividades, activo ayer
**When** se ejecuta `calculateRisk`
**Then** no se generan factores de riesgo, el score es 0, y el riskLevel es 'low'

### Scenario: Recomendaciones específicas por factor
**Given** un estudiante tiene factor 'attendance' detectado
**When** se llama a `generateRecommendations`
**Then** las recomendaciones incluyen "Investigar causas de inasistencia" y "Evaluar flexibilidad de horarios si aplica"

### Scenario: Hook cachea resultado y no recalcula innecesariamente
**Given** `useStudentRisk('student-123')` ya calculó el riesgo
**When** se re-renderiza el componente sin cambios en los datos fuente
**Then** el hook retorna el valor cacheado sin ejecutar `calculateRisk` nuevamente

## Technical Constraints
- Stack: Vitest para tests, funciones puras en TypeScript strict, Zustand para cache de resultados
- Patrones: `features/risk-engine/lib/calculator.ts` (función pura), `features/risk-engine/model/` (Zustand store), `features/risk-engine/config/thresholds.ts`
- La función `calculateRisk` NO debe tener imports de Zustand ni React — debe ser una función pura testeble en Node.js

## Dependencies
- Depende de: `002-file-ingestion` (necesita attendance, progress, dedication cargados), `006-syllabus-management` (necesita expectedHours por módulo)
- Bloquea a: `004-analytics-dashboard` (necesita riskScore para gráficos), `001-student-management` (necesita riskLevel para badges)

## Data Models

```typescript
// features/risk-engine/types.ts
export interface RiskInput {
  student: Student;
  attendance: AttendanceRecord[];
  progress: ProgressRecord[];
  dedication: DedicationRecord[];
  syllabus: SyllabusModule[];
  referenceDate: Date;
}

export interface RiskOutput {
  riskScore: number;        // 0-100, mayor = más riesgo
  riskLevel: 'low' | 'medium' | 'high';
  metrics: RiskMetrics;
  factors: RiskFactor[];
  recommendations: string[];
}

export interface RiskMetrics {
  completionRate: number;       // % de horas completadas vs esperadas
  attendanceRate: number;       // % de asistencia
  activityCompletion: number;   // % de actividades completadas
  velocityTrend: 'improving' | 'stable' | 'declining';
  daysSinceLastActivity: number;
}

export interface RiskFactor {
  category: 'hours' | 'attendance' | 'activities' | 'engagement';
  severity: 'low' | 'medium' | 'high';
  description: string;
  weight: number; // 0-1
}

// features/risk-engine/config/thresholds.ts
export const RISK_THRESHOLDS = {
  hours: {
    critical: 50,   // < 50% = riesgo alto (+40 pts)
    warning: 75,    // < 75% = riesgo medio (+20 pts)
  },
  attendance: {
    critical: 70,   // < 70% = riesgo alto (+30 pts)
    warning: 85,    // < 85% = riesgo medio (+15 pts)
  },
  activities: {
    critical: 50,   // < 50% = riesgo alto (+30 pts)
    warning: 75,    // < 75% = riesgo medio (+15 pts)
  },
  inactivity: {
    critical: 7,    // > 7 días sin actividad (+20 pts)
  },
  totalScore: {
    high: 70,       // >= 70 = riesgo alto
    medium: 40,     // >= 40 = riesgo medio
  }
};

export const FACTOR_WEIGHTS = {
  hours: 0.35,
  attendance: 0.25,
  activities: 0.25,
  engagement: 0.15
};
```
