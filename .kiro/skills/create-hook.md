# Skill: create-hook

## Descripción
Genera un custom hook de React con TypeScript, tipos de retorno explícitos, manejo de estados de loading/error y archivo de test con Vitest. El hook sigue las convenciones del proyecto: prefijo `use`, camelCase, sin lógica de UI (retorna datos y handlers, no JSX).

## Uso
```
/kiro skill:create-hook <nombreHook> [--in <capa/segmento>]
```

## Argumentos
- `nombreHook`: nombre en camelCase con prefijo `use` (required). Ejemplo: `useStudentRisk`
- `--in`: ruta relativa a `src/` donde crear el hook (optional). Por defecto: `shared/hooks/`

## Ejemplos
```
/kiro skill:create-hook useDebounce
/kiro skill:create-hook useStudentRisk --in features/risk-engine/model
/kiro skill:create-hook useCohortStats --in features/analytics/model
```

## Output Esperado

Para `/kiro skill:create-hook useStudentRisk --in features/risk-engine/model`:

```
src/features/risk-engine/model/
├── useStudentRisk.ts           # Hook principal
└── useStudentRisk.test.ts      # Tests con Vitest
```

### Contenido generado

**useStudentRisk.ts**
```typescript
import { useState, useEffect, useMemo } from 'react';
import type { RiskOutput } from '../types';

// TODO: importar dependencias específicas del hook

interface UseStudentRiskOptions {
  studentId: string;
  referenceDate?: Date;
}

interface UseStudentRiskReturn {
  riskOutput: RiskOutput | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Calcula y retorna el assessment de riesgo para un estudiante.
 * Cachea el resultado y solo recalcula cuando cambian los datos fuente.
 * 
 * @param options.studentId - ID del estudiante a evaluar
 * @param options.referenceDate - Fecha de referencia para el cálculo (default: hoy)
 */
export function useStudentRisk({
  studentId,
  referenceDate = new Date(),
}: UseStudentRiskOptions): UseStudentRiskReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [rawData, setRawData] = useState<unknown>(null);

  // TODO: cargar datos de IndexedDB

  const riskOutput = useMemo(() => {
    if (!rawData) return null;
    // TODO: ejecutar calculateRisk con rawData
    return null;
  }, [rawData, referenceDate]);

  const refetch = () => {
    // TODO: implementar refetch
  };

  return { riskOutput, isLoading, error, refetch };
}
```

**useStudentRisk.test.ts**
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStudentRisk } from './useStudentRisk';

// Mock de dependencias de IndexedDB
vi.mock('@/shared/api/db', () => ({
  db: {
    // TODO: mock de tablas Dexie
  },
}));

describe('useStudentRisk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state initially', () => {
    const { result } = renderHook(() =>
      useStudentRisk({ studentId: 'test-id' })
    );
    expect(result.current.isLoading).toBe(true);
    expect(result.current.riskOutput).toBeNull();
  });

  it('returns null riskOutput when no data found', async () => {
    const { result } = renderHook(() =>
      useStudentRisk({ studentId: 'non-existent-id' })
    );
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.riskOutput).toBeNull();
  });

  it('exposes refetch function', () => {
    const { result } = renderHook(() =>
      useStudentRisk({ studentId: 'test-id' })
    );
    expect(typeof result.current.refetch).toBe('function');
  });
});
```

## Validaciones
- [ ] El nombre comienza con `use` y está en camelCase
- [ ] La interface de retorno está named y completamente tipada
- [ ] No usa `any` — todos los tipos son explícitos o `unknown` con type guards
- [ ] Los estados de loading y error están siempre presentes en el retorno
- [ ] La lógica costosa usa `useMemo` o `useCallback`
- [ ] El archivo de test mockea las dependencias externas (Dexie, stores)
- [ ] El hook no retorna JSX ni importa componentes UI
