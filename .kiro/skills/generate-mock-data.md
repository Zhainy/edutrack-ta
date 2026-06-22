# Skill: generate-mock-data

## Descripción
Genera datos mock realistas para testing y desarrollo local. Crea factories tipadas con TypeScript para cada entidad del sistema (Student, AttendanceRecord, ProgressRecord, DedicationRecord, SyllabusModule, Note) y opcionalmente los precarga en IndexedDB para desarrollo.

## Uso
```
/kiro skill:generate-mock-data [--entity <entidad>] [--count <cantidad>] [--seed <cohort-id>]
```

## Argumentos
- `--entity`: entidad a generar (optional). Valores: `all`, `students`, `attendance`, `progress`, `dedication`, `syllabus`, `notes`. Default: `all`
- `--count`: cantidad de registros a generar (optional). Default: 20 para students, proporcional para el resto
- `--seed`: cohortId a usar como base para las relaciones (optional). Si no se provee, genera un cohort nuevo

## Ejemplos
```
/kiro skill:generate-mock-data
/kiro skill:generate-mock-data --entity students --count 30
/kiro skill:generate-mock-data --entity attendance --seed cohort-2026-a
```

## Output Esperado

Crea o actualiza el archivo `src/shared/lib/mocks/`:

```
src/shared/lib/mocks/
├── factories.ts        # Factory functions tipadas por entidad
├── scenarios.ts        # Escenarios predefinidos (cohorte sana, cohorte en crisis, etc.)
└── index.ts            # Re-exports
```

### Contenido de factories.ts

```typescript
import { faker } from '@faker-js/faker/locale/es';
import type { Student, AttendanceRecord, DedicationRecord } from '@/entities';

/**
 * Genera un estudiante mock con datos realistas en español
 */
export function createMockStudent(overrides: Partial<Student> = {}): Student {
  return {
    id: crypto.randomUUID(),
    cohortId: overrides.cohortId ?? crypto.randomUUID(),
    externalId: faker.internet.email(),
    fullName: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    status: 'active',
    enrollmentDate: faker.date.past({ years: 1 }).toISOString().split('T')[0],
    tags: [],
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Genera registros de asistencia para un estudiante en un rango de fechas
 */
export function createMockAttendance(
  studentId: string,
  options: { days: number; absentRate?: number } = { days: 30 }
): AttendanceRecord[] {
  // genera un registro por día hábil con la tasa de ausencia especificada
  // ...
}

/**
 * Genera registros de dedicación con variabilidad realista
 */
export function createMockDedication(
  studentId: string,
  options: { days: number; avgHours?: number; declining?: boolean }
): DedicationRecord[] {
  // genera horas con variación ±30% del promedio
  // si declining=true, reduce gradualmente las horas en los últimos 14 días
  // ...
}
```

### Escenarios predefinidos (scenarios.ts)

```typescript
/**
 * Cohorte saludable: 20 estudiantes activos con buen progreso
 * Útil para: desarrollo del dashboard, tests de UI base
 */
export async function seedHealthyCohort(): Promise<void> { ... }

/**
 * Cohorte en crisis: mezcla de riesgos (5 high, 8 medium, 7 low)
 * Útil para: testing del motor de riesgo, testing de alertas
 */
export async function seedCrisisCohort(): Promise<void> { ... }

/**
 * Estudiante individual con todos sus datos para testing de perfil
 * Útil para: dashboard individual, testing de CRM
 */
export async function seedStudentProfile(studentId?: string): Promise<Student> { ... }
```

## Validaciones
- [ ] Las factories no usan `any` — todos los tipos heredan de las interfaces de entities/
- [ ] Los datos generados pasan la validación de los schemas Zod de cada entidad
- [ ] Las fechas generadas son ISO 8601 (YYYY-MM-DD)
- [ ] Las horas generadas son decimales con máximo 2 dígitos (`parseFloat(h.toFixed(2))`)
- [ ] Los emails generados están en lowercase
- [ ] Los escenarios de crisis generan datos que activan el motor de riesgo correctamente
- [ ] Las factories aceptan `overrides` para permitir customización en tests específicos
- [ ] El archivo solo se usa en tests y desarrollo — nunca se importa en código de producción
