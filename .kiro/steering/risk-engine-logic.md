# Risk Engine Logic Steering

## Propósito
El motor de riesgo es el núcleo analítico de EduTrack TA. Su función es transformar datos crudos de dedicación, asistencia y progreso en un score de riesgo accionable. Toda modificación a este módulo debe mantener la función `calculateRisk` como una función **pura y determinística**.

## Principio de Diseño
- `features/risk-engine/lib/calculator.ts` — función pura sin side effects, sin imports de React ni Zustand
- `features/risk-engine/model/riskStore.ts` — Zustand store que orquesta la ejecución y cachea resultados
- `features/risk-engine/config/thresholds.ts` — todos los umbrales configurables aquí, nunca hardcodeados en la lógica

## Algoritmo de Cálculo de Riesgo

### Inputs requeridos (RiskInput)
```typescript
interface RiskInput {
  student: Student;
  attendance: AttendanceRecord[];
  progress: ProgressRecord[];
  dedication: DedicationRecord[];
  syllabus: SyllabusModule[];
  referenceDate: Date;            // fecha de referencia para corte de cálculo
}
```

### Proceso de Cálculo (en orden)

**Paso 1 — Horas esperadas vs reales**
- Filtrar módulos del syllabus cuyo `endDate <= referenceDate`
- Sumar sus `expectedHours` → `expectedHours`
- Sumar horas de `dedication` donde `date <= referenceDate` → `actualHours`
- `completionRate = (actualHours / expectedHours) * 100`
- Si `expectedHours === 0` → `completionRate = 100` (no penalizar sin syllabus)

**Paso 2 — Tasa de asistencia**
- Filtrar `attendance` donde `date <= referenceDate`
- `presentDays` = registros con status `'present'` o `'late'`
- `attendanceRate = (presentDays / totalDays) * 100`
- Si `totalDays === 0` → `attendanceRate = 100`

**Paso 3 — Completitud de actividades**
- `totalActivities` = suma de `activities.length` por módulo del syllabus
- `completedActivities` = registros de `progress` con `completed === true`
- `activityCompletion = (completedActivities / totalActivities) * 100`
- Si `totalActivities === 0` → `activityCompletion = 100`

**Paso 4 — Tendencia de velocidad (últimos 14 días)**
- `last14Days` = suma de horas en dedicación de los últimos 14 días
- `previous14Days` = suma de horas entre día -28 y día -15
- Si `last14Days < previous14Days * 0.7` → `velocityTrend = 'declining'`
- Si `last14Days > previous14Days * 1.3` → `velocityTrend = 'improving'`
- Resto → `velocityTrend = 'stable'`

**Paso 5 — Días sin actividad**
- Buscar la fecha más reciente en `dedication`
- `daysSinceLastActivity = diferencia en días entre esa fecha y referenceDate`
- Si no hay registros → `daysSinceLastActivity = 999`

### Tabla de Scoring (suma acumulativa)

| Condición | Puntos | Factor generado |
|-----------|--------|----------------|
| `completionRate < 50%` | +40 | hours / high |
| `completionRate < 75%` (y ≥ 50%) | +20 | hours / medium |
| `attendanceRate < 70%` | +30 | attendance / high |
| `attendanceRate < 85%` (y ≥ 70%) | +15 | attendance / medium |
| `activityCompletion < 50%` | +30 | activities / high |
| `activityCompletion < 75%` (y ≥ 50%) | +15 | activities / medium |
| `velocityTrend === 'declining'` | +10 | engagement / medium |
| `daysSinceLastActivity > 7` | +20 | engagement / high |

Score final: `Math.min(totalScore, 100)` — techo de 100

### Niveles de Riesgo

```typescript
export const RISK_THRESHOLDS = {
  hours:      { critical: 50, warning: 75 },
  attendance: { critical: 70, warning: 85 },
  activities: { critical: 50, warning: 75 },
  inactivity: { critical: 7 },
  totalScore: { high: 70, medium: 40 }
};
```

| Score | riskLevel |
|-------|-----------|
| < 40 | `'low'` |
| 40–69 | `'medium'` |
| ≥ 70 | `'high'` |

### Pesos de Factores

```typescript
export const FACTOR_WEIGHTS = {
  hours:      0.35,
  attendance: 0.25,
  activities: 0.25,
  engagement: 0.15
};
```

## Generación de Recomendaciones

Las recomendaciones se generan en `features/risk-engine/lib/recommendations.ts` basadas en los factores detectados:

```
riskLevel === 'high'               → "Contactar al estudiante de inmediato para evaluar situación"
factor.category === 'hours'        → "Revisar barreras de acceso a la plataforma"
                                     "Ofrecer sesión de mentoría personalizada"
factor.category === 'attendance'   → "Investigar causas de inasistencia"
                                     "Evaluar flexibilidad de horarios si aplica"
factor.category === 'engagement'   → "Verificar motivación y objetivos del estudiante"
                                     "Conectar con casos de éxito para inspiración"
```

## Hook useStudentRisk

```typescript
// features/risk-engine/model/useStudentRisk.ts
// - Lee datos de IndexedDB via api/ al montar
// - Ejecuta calculateRisk con useMemo (recalcula solo si cambian los datos)
// - Cachea resultado en riskStore para evitar recálculos en re-renders
// - Retorna: { riskOutput, isLoading, error }
// - NO calcular en el render directamente — siempre useMemo o selector de store
```

## Reglas Críticas
- `calculateRisk` debe producir el **mismo resultado** para los mismos inputs siempre
- Los umbrales **nunca** deben estar hardcodeados en `calculator.ts` — siempre leer de `thresholds.ts`
- La cobertura de tests de `calculator.ts` y `recommendations.ts` debe ser ≥ 90%
- Cualquier nuevo factor debe documentarse en esta sección antes de implementarse
