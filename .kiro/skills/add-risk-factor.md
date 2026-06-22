# Skill: add-risk-factor

## Descripción
Agrega un nuevo factor de riesgo al motor de cálculo de EduTrack TA. Actualiza `thresholds.ts` con los umbrales del nuevo factor, agrega la lógica de cálculo en `calculator.ts`, actualiza `recommendations.ts` con la recomendación correspondiente, y genera los tests unitarios para el nuevo factor.

## Uso
```
/kiro skill:add-risk-factor <nombre-factor> --category <categoria> --points <puntos> --threshold <umbral>
```

## Argumentos
- `nombre-factor`: nombre descriptivo del factor en kebab-case (required). Ejemplo: `low-score-average`
- `--category`: categoría del factor (required). Valores: `hours`, `attendance`, `activities`, `engagement`
- `--points`: puntos que suma al score de riesgo cuando se activa (required). Número entero positivo
- `--threshold`: valor umbral que activa el factor (required). Número o descripción de condición

## Ejemplo
```
/kiro skill:add-risk-factor score-below-average --category activities --points 15 --threshold 60
```

## Output Esperado

El skill modifica y crea los siguientes archivos:

### 1. `features/risk-engine/config/thresholds.ts` (modificado)
```typescript
export const RISK_THRESHOLDS = {
  // ... thresholds existentes ...

  // NUEVO: agregado por skill add-risk-factor
  scoreBelowAverage: {
    critical: 60,  // < 60% del promedio de la cohorte = riesgo medio
  },
};
```

### 2. `features/risk-engine/lib/calculator.ts` (modificado)
```typescript
// Dentro de calculateRisk(), después de los factores existentes:

// Factor: Score por debajo del promedio de cohorte
if (input.cohortAverageScore !== undefined) {
  const relativeScore = (input.student.score / input.cohortAverageScore) * 100;
  if (relativeScore < RISK_THRESHOLDS.scoreBelowAverage.critical) {
    factors.push({
      category: 'activities',
      severity: 'medium',
      description: `Puntaje ${relativeScore.toFixed(1)}% por debajo del promedio de la cohorte`,
      weight: FACTOR_WEIGHTS.activities,
    });
    totalScore += 15;
  }
}
```

### 3. `features/risk-engine/lib/recommendations.ts` (modificado)
```typescript
// Agregar caso para el nuevo factor:
if (factors.some(f => f.description.includes('promedio de la cohorte'))) {
  recommendations.push('Revisar comprensión de los temas con el estudiante');
  recommendations.push('Considerar sesión de refuerzo grupal o individual');
}
```

### 4. `features/risk-engine/lib/calculator.test.ts` (nuevo o modificado)
```typescript
describe('Factor: score-below-average', () => {
  it('adds 15 points when student score is below threshold', () => {
    const input = buildMockRiskInput({
      // datos que activan el nuevo factor
    });
    const output = calculateRisk(input);
    expect(output.factors.some(f => f.category === 'activities')).toBe(true);
    expect(output.riskScore).toBeGreaterThanOrEqual(15);
  });

  it('does not activate when score is above threshold', () => {
    const input = buildMockRiskInput({
      // datos que NO activan el factor
    });
    const output = calculateRisk(input);
    // verificar que el factor no está presente
  });
});
```

## Validaciones
- [ ] El factor nuevo está documentado en `.kiro/steering/risk-engine-logic.md` (actualizar la tabla de scoring)
- [ ] El umbral está en `thresholds.ts` y no hardcodeado en `calculator.ts`
- [ ] La función `calculateRisk` sigue siendo pura (sin side effects)
- [ ] Se agregan tests unitarios que cubren: activación del factor, no-activación, impacto en score total
- [ ] La recomendación nueva es accionable y específica
- [ ] La cobertura de `calculator.ts` se mantiene ≥ 90% tras el cambio
- [ ] El peso del factor (weight) usa `FACTOR_WEIGHTS` del config, no un valor ad-hoc
