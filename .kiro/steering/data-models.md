# Data Models Steering

## Entidades Principales

```typescript
// entities/student/types.ts
export interface Student {
  id: string;
  cohortId: string;
  externalId: string;       // ID único en sistema externo (email, código, etc.)
  fullName: string;
  email?: string;
  status: 'active' | 'dropout' | 'inactive';
  enrollmentDate: string;   // ISO 8601: YYYY-MM-DD
  tags: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Cohort {
  id: string;
  name: string;
  description?: string;
  startDate: string;        // ISO 8601: YYYY-MM-DD
  endDate: string;          // ISO 8601: YYYY-MM-DD
  syllabusUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// entities/attendance/types.ts
export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;             // ISO 8601: YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  uploadedAt: string;
}

// entities/progress/types.ts
export interface ProgressRecord {
  id: string;
  studentId: string;
  activityName: string;
  moduleNumber?: number;
  completed: boolean;
  completionDate?: string;  // ISO 8601: YYYY-MM-DD
  score?: number;           // decimal 0-100
  uploadedAt: string;
}

// entities/dedication/types.ts
export interface DedicationRecord {
  id: string;
  studentId: string;
  date: string;             // ISO 8601: YYYY-MM-DD
  hours: number;            // decimal con 2 dígitos (ej: 1.50)
  platform: string;         // 'main' por defecto, permite múltiples plataformas
  uploadedAt: string;
}

// entities/syllabus/types.ts
export interface SyllabusModule {
  id: string;
  cohortId: string;
  moduleNumber: number;     // único por cohorte
  moduleName: string;
  startDate: string;        // ISO 8601: YYYY-MM-DD
  endDate: string;          // ISO 8601: YYYY-MM-DD
  expectedHours: number;    // horas totales esperadas en este módulo
  activities: string[];     // lista de nombres de actividades esperadas
  createdAt: string;
}

// entities/note/types.ts
export interface Note {
  id: string;
  studentId: string;
  type: 'context' | 'action' | 'alert' | 'general';
  title: string;
  content?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;         // ISO 8601: YYYY-MM-DD
  isCompleted: boolean;
  completedAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// features/ingestion/types.ts
export interface UploadLog {
  id: string;
  cohortId: string;
  fileName: string;
  fileType: 'attendance' | 'progress' | 'dedication' | 'syllabus';
  fileSize: number;         // bytes
  recordsCount: number;
  status: 'success' | 'partial' | 'failed';
  errorMessage?: string;
  uploadedBy?: string;
  uploadedAt: string;
}
```

## Reglas de Negocio

1. **Student** debe tener `externalId` único por cohorte — restricción `UNIQUE(cohortId, externalId)`
2. **Attendance** no puede tener duplicados — restricción `UNIQUE(studentId, date)`
3. **Progress** se identifica por par único — restricción `UNIQUE(studentId, activityName)`
4. **Dedication** permite múltiples plataformas por día — restricción `UNIQUE(studentId, date, platform)`
5. **Note** debe tener `type` y `priority` siempre definidos (no nullable)
6. **SyllabusModule** define el cronograma esperado — restricción `UNIQUE(cohortId, moduleNumber)`

## Relaciones

```
Cohort 1:N Student
Cohort 1:N SyllabusModule
Student 1:N AttendanceRecord
Student 1:N ProgressRecord
Student 1:N DedicationRecord
Student 1:N Note
Cohort 1:N UploadLog
```

## Claves e Identificadores

- Usar **UUIDs** (`crypto.randomUUID()`) para IDs internos generados en el frontend
- `externalId` para matching con sistemas externos (LMS, planillas, etc.) — puede ser email, código de alumno, etc.
- `cohortId` como FK en Student y SyllabusModule
- `studentId` como FK en AttendanceRecord, ProgressRecord, DedicationRecord, Note

## Normalización de Datos (aplicar en ingestion/lib/normalizer.ts)

| Campo | Normalización |
|-------|--------------|
| Fechas | ISO 8601: `YYYY-MM-DD` — usar `date-fns/parse` con formato del archivo |
| Nombres | `trim()` + conservar capitalización original |
| Emails | `trim().toLowerCase()` |
| Horas | `parseFloat(value).toFixed(2)` como número |
| Actividades | `trim()` — conservar nombre exacto del syllabus |
| Status de asistencia | Mapear variantes: "P"/"presente"/"present" → `'present'` |
| IDs externos | `String(value).trim()` |

## Schemas Zod (por entidad)

Cada entidad en `entities/[nombre]/` debe tener su schema Zod en `schema.ts`:

```typescript
// entities/student/schema.ts
import { z } from 'zod';

export const StudentSchema = z.object({
  id: z.string().uuid(),
  cohortId: z.string().uuid(),
  externalId: z.string().min(1),
  fullName: z.string().min(1).max(255),
  email: z.string().email().optional(),
  status: z.enum(['active', 'dropout', 'inactive']),
  enrollmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tags: z.array(z.string()),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Los schemas de ingestion son más permisivos para aceptar datos crudos
// luego se transforman al schema estricto tras normalización
```

## IndexedDB — Tablas e Índices (Dexie.js)

```typescript
// Tabla          Índices primarios              Índices compuestos
cohorts:          ++id, name, startDate
students:         ++id, cohortId, externalId,    [cohortId+externalId]
                  status
attendance:       ++id, studentId, date          [studentId+date]
progress:         ++id, studentId,               [studentId+activityName]
                  moduleNumber
dedication:       ++id, studentId, date          [studentId+date+platform]
syllabus:         ++id, cohortId,                [cohortId+moduleNumber]
                  moduleNumber
notes:            ++id, studentId, type,
                  priority, isCompleted
uploadLogs:       ++id, cohortId, fileType,
                  uploadedAt
```

Los índices compuestos permiten queries eficientes como:
- `db.attendance.where('[studentId+date]').equals([id, fecha])` para verificar duplicados
- `db.students.where('[cohortId+externalId]').equals([cohortId, extId])` para upsert
