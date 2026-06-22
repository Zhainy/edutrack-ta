# Architecture Steering

## Patrón: Feature-Sliced Design (FSD)

La arquitectura sigue estrictamente Feature-Sliced Design. Cada capa tiene una responsabilidad única y las importaciones fluyen en una sola dirección.

### Capas (de mayor a menor abstracción)

```
app/        ← Configuración global, providers, router
pages/      ← Páginas completas (ensamblan widgets)
widgets/    ← Bloques de UI independientes y compuestos
features/   ← Lógica de negocio por módulo
entities/   ← Modelos de negocio puros
shared/     ← Recursos reutilizables sin lógica de dominio
```

### Reglas de Importación (CRÍTICAS — no violar)

- Una capa **SOLO** puede importar de capas **inferiores** en la lista anterior
- `features/` **NO** puede importar de otras `features/` directamente → usar `shared/` o eventos
- `entities/` **NO** puede importar de `features/`
- `shared/` **NO** puede importar de ninguna otra capa
- Los `widgets/` pueden componer múltiples `features/` y `entities/`
- Las `pages/` solo deben ensamblar widgets, no contener lógica de negocio

### Estructura de Directorios Completa

```
src/
├── app/
│   ├── providers/          # AppProvider, ThemeProvider, RouterProvider
│   ├── routers/            # Configuración de rutas con React Router 6
│   └── styles/             # globals.css (solo directivas Tailwind)
│
├── pages/
│   ├── dashboard/          # /dashboard — vista general de cohorte
│   ├── students/           # /students — lista y perfil
│   ├── ingestion/          # /ingestion — carga de archivos
│   ├── analytics/          # /analytics — reportes y gráficos
│   └── settings/           # /settings — configuración de cohorte
│
├── widgets/
│   ├── student-dashboard/  # Dashboard completo de estudiante individual
│   ├── cohort-overview/    # Vista general de cohorte con KPIs
│   └── risk-alerts-panel/  # Panel lateral de alertas de riesgo
│
├── features/
│   ├── students/           # CRUD y gestión de estudiantes
│   │   ├── model/          # studentStore.ts (Zustand)
│   │   ├── ui/             # StudentTable, StudentCard, StudentProfile
│   │   ├── api/            # Dexie.js queries para students
│   │   └── lib/            # Funciones puras de transformación
│   │
│   ├── ingestion/          # Carga y parsing de archivos
│   │   ├── model/          # ingestionStore.ts
│   │   ├── ui/             # FileUpload, ColumnMapper, UploadLog
│   │   ├── lib/            # csvParser.ts, xlsxParser.ts, normalizer.ts
│   │   └── config/         # columnMappings.ts por tipo de archivo
│   │
│   ├── risk-engine/        # Motor de cálculo de riesgo
│   │   ├── model/          # riskStore.ts (cache de resultados)
│   │   ├── lib/            # calculator.ts (función pura), recommendations.ts
│   │   ├── config/         # thresholds.ts, factorWeights.ts
│   │   └── types/          # RiskInput, RiskOutput, RiskFactor, etc.
│   │
│   ├── analytics/          # Gráficos y métricas agregadas
│   │   ├── model/          # analyticsStore.ts
│   │   ├── ui/             # HoursChart, AttendanceHeatmap, RiskDistribution
│   │   └── lib/            # statsCalculator.ts, chartFormatters.ts
│   │
│   ├── crm/                # Notas y seguimiento
│   │   ├── model/          # crmStore.ts
│   │   ├── ui/             # NoteCard, NoteForm, TaskPanel, Timeline
│   │   ├── lib/            # noteSorter.ts, draftManager.ts
│   │   └── config/         # predefinedTags.ts
│   │
│   └── ai-assistant/       # OPCIONAL - Solo si VITE_ENABLE_AI=true y VITE_GROQ_API_KEY configurada
│       ├── model/
│       ├── ui/
│       ├── lib/
│       ├── config/
│       └── index.ts
│
├── entities/
│   ├── student/            # Tipos Student, Cohort + validaciones Zod
│   ├── attendance/         # Tipos AttendanceRecord + schema Zod
│   ├── progress/           # Tipos ProgressRecord + schema Zod
│   ├── dedication/         # Tipos DedicationRecord + schema Zod
│   ├── syllabus/           # Tipos SyllabusModule + schema Zod
│   └── note/               # Tipos Note + schema Zod
│
├── shared/
│   ├── ui/                 # Button, Card, Badge, Input, Modal, Drawer, Toast
│   ├── api/                # db.ts (instancia Dexie), baseQueries.ts
│   ├── config/             # appConfig.ts, routes.ts (constantes de rutas), feature-flags.ts
│   ├── lib/                # formatDate.ts, formatHours.ts, cn.ts (clsx+twMerge)
│   ├── hooks/              # useDebounce.ts, useLocalStorage.ts, usePagination.ts
│   └── types/              # Result<T>, Nullable<T>, tipos globales utilitarios
│
└── widgets/
    ├── student-dashboard/
    ├── cohort-overview/
    └── risk-alerts-panel/
```

### Estructura Interna de Feature (template obligatorio)

```
features/[nombre]/
├── model/
│   └── [nombre]Store.ts    # Zustand store con slice pattern
├── ui/
│   ├── [Componente].tsx    # Componentes visuales del feature
│   └── index.ts            # Re-exports públicos de UI
├── api/
│   └── [nombre]Api.ts      # Acceso a Dexie.js — funciones async tipadas
├── lib/
│   └── [logica].ts         # Funciones puras — sin imports de React ni Zustand
├── config/                 # (opcional) constantes y configuración
├── types/                  # (opcional) tipos propios si son muchos
└── index.ts                # Public API del feature — SOLO exportar lo necesario
```

## Flujo de Datos

```
Usuario → UI (widgets/pages)
         → feature/ui (componente)
         → feature/model (Zustand action)
         → shared/api (Dexie.js query)
         → IndexedDB
         ↑
         Datos suben por selectores de Zustand
```

Para el motor de riesgo el flujo es:
```
feature/model → feature/api (lee IndexedDB)
              → feature/lib/calculator.ts (función pura)
              → feature/model (guarda resultado en store)
              → UI consume via selector
```

## Convención de Public API (index.ts)

Cada feature, entity y shared segment debe tener un `index.ts` que actúa como barrera de abstracción:

### Feature Flags

- `VITE_ENABLE_AI`: Habilita/deshabilita feature de IA (default: false)
- `VITE_GROQ_API_KEY`: API key de Groq (obligatoria si VITE_ENABLE_AI=true)
- Implementación: `shared/config/feature-flags.ts`
- Si `VITE_ENABLE_AI=false` → no se carga el módulo `ai-assistant`
- Si `VITE_GROQ_API_KEY` no configurada → se muestra mensaje de configuración
- **NO hay fallback** a otros proveedores de IA
- Las features opcionales deben ser completamente aisladas (no afectan el core)

```typescript
// features/students/index.ts — solo exportar lo que otras capas necesitan
export { StudentTable } from './ui/StudentTable';
export { useStudentStore } from './model/studentStore';
export type { StudentFilters } from './types';
// NO exportar internals como api/ o lib/ directamente
```

## Configuración de IndexedDB (Dexie.js)

```typescript
// shared/api/db.ts
import Dexie, { type Table } from 'dexie';

export class EduTrackDatabase extends Dexie {
  cohorts!: Table<Cohort>;
  students!: Table<Student>;
  attendance!: Table<AttendanceRecord>;
  progress!: Table<ProgressRecord>;
  dedication!: Table<DedicationRecord>;
  syllabus!: Table<SyllabusModule>;
  notes!: Table<Note>;
  uploadLogs!: Table<UploadLog>;

  constructor() {
    super('edutrack-ta');
    this.version(1).stores({
      cohorts:    '++id, name, startDate',
      students:   '++id, cohortId, externalId, status',
      attendance: '++id, studentId, date, [studentId+date]',
      progress:   '++id, studentId, activityName, [studentId+activityName]',
      dedication: '++id, studentId, date, [studentId+date+platform]',
      syllabus:   '++id, cohortId, moduleNumber, [cohortId+moduleNumber]',
      notes:      '++id, studentId, type, priority, isCompleted',
      uploadLogs: '++id, cohortId, fileType, uploadedAt',
    });
  }
}

export const db = new EduTrackDatabase();
```
