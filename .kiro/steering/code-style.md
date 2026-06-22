# Code Style Steering

## Convenciones de Nombres

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Componentes React | PascalCase | `StudentCard.tsx`, `RiskBadge.tsx` |
| Custom hooks | camelCase con prefijo `use` | `useStudentRisk.ts`, `useCohortStats.ts` |
| Utilidades/helpers | camelCase | `formatDate.ts`, `normalizeEmail.ts` |
| Tipos e Interfaces | PascalCase | `Student`, `RiskOutput`, `ButtonProps` |
| Zustand stores | camelCase con sufijo `Store` | `studentStore.ts`, `ingestionStore.ts` |
| Constantes | UPPER_SNAKE_CASE | `RISK_THRESHOLDS`, `PREDEFINED_TAGS` |
| Archivos de config | camelCase | `thresholds.ts`, `columnMappings.ts` |
| Enums | PascalCase | `RiskLevel`, `AttendanceStatus` |

## Estructura de Componentes React

```tsx
// 1. Imports — orden estricto:
//    a) react y react-dom
//    b) librerías externas (recharts, lucide-react, etc.)
//    c) shared/ (ui, hooks, lib, types)
//    d) entities/
//    e) features/ (solo la propia feature)
//    f) tipos locales

import { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { Badge } from '@/shared/ui';
import type { Student } from '@/entities/student';

// 2. Types/Interfaces locales al archivo
interface StudentCardProps {
  student: Student;
  onSelect: (id: string) => void;
}

// 3. Componente principal — siempre arrow function con tipos explícitos
export const StudentCard = ({ student, onSelect }: StudentCardProps) => {
  // hooks al inicio
  // lógica derivada con useMemo/useCallback
  // handlers
  // return JSX
  return (
    <div>...</div>
  );
};

// 4. Subcomponentes del mismo archivo (si aplica) — nombrados con prefijo del padre
const StudentCardActions = ({ ... }) => { ... };

// 5. Export default solo si el archivo es una página (pages/)
// Para features/ y shared/ usar named exports siempre
```

## Patrones Obligatorios

- **Feature-Sliced Design** — respetar las capas y reglas de importación sin excepción
- **Composition sobre inheritance** — componer comportamiento con hooks y componentes pequeños
- **Custom hooks para lógica reutilizable** — si la lógica se repite en 2+ componentes, extraer a hook
- **Zod para toda validación** — formularios, datos parseados de archivos, respuestas de API
- **Error Boundaries** en cada feature principal para aislar fallos
- **useMemo/useCallback** para valores costosos — no en cada función, solo donde el profiler indique

## Comentarios

```typescript
// ✅ JSDoc en funciones públicas exportadas
/**
 * Calcula el score de riesgo de deserción de un estudiante.
 * @param input - Datos del estudiante incluyendo asistencia, progreso y dedicación
 * @returns RiskOutput con score (0-100), nivel y factores detallados
 */
export function calculateRisk(input: RiskInput): RiskOutput { ... }

// ✅ TODO con formato estandarizado
// TODO(@usuario): Implementar cálculo de tendencia - #42

// ❌ Comentarios obvios — prohibidos
const count = students.length; // gets the length of the students array
```

## TypeScript

- `strict: true` en tsconfig — no excepciones
- Nunca usar `any` — usar `unknown` con type guards, o tipos específicos
- Preferir `interface` para objetos públicos de la API, `type` para unions/intersections
- Usar `as const` para objetos de configuración inmutables
- Los props de componentes siempre con interface named (no inline object type)

## Manejo de Errores

```typescript
// ✅ Result pattern para operaciones que pueden fallar
type Result<T, E = Error> = { ok: true; data: T } | { ok: false; error: E };

// ✅ Error Boundary por feature
// En cada features/[nombre]/ui/ incluir un ErrorBoundary wrapper

// ❌ No silenciar errores
try { ... } catch (_e) { } // PROHIBIDO
```

## Imports

- Usar path aliases: `@/` apunta a `src/`
- Ejemplo: `import { Button } from '@/shared/ui'` en lugar de `'../../../shared/ui'`
- Configurar en `vite.config.ts` y `tsconfig.json`
