# PROMPT PARA KIRO - Generación de Código Base

## 🎯 Contexto

Ya tienes la configuración completa del proyecto:
- ✅ `AGENT.MD` v1.1.0 (especificaciones completas)
- ✅ `.kiro/` sincronizado (specs, steering, hooks, skills)
- ✅ Feature flags implementados (`shared/config/feature-flags.ts`)
- ✅ Stack definido: React + TypeScript + Tailwind + Dexie + Zustand

Tu tarea ahora es **generar el código base funcional** del proyecto EduTrack TA. Al finalizar, la app debe:
- Correr con `npm run dev` sin errores
- Mostrar el layout principal con navegación funcional
- Tener datos mock cargados en IndexedDB
- Estar en dark mode por defecto
- Respetar la paleta de colores del AGENT.MD

## 📚 Documentación de Referencia

Antes de generar código, lee en este orden:
1. `AGENT.MD` (especificaciones completas)
2. `.kiro/steering/tech-stack.md` (stack y restricciones)
3. `.kiro/steering/architecture.md` (arquitectura FSD)
4. `.kiro/steering/ui-design.md` (paleta y componentes)
5. `.kiro/steering/code-style.md` (convenciones)
6. `.kiro/steering/data-models.md` (modelos de datos)
7. `shared/config/feature-flags.ts` (feature flags)

**Si hay conflicto entre archivos, la prioridad es:**
AGENT.MD > tech-stack.md > architecture.md > ui-design.md > code-style.md

---

## 📋 Plan de Ejecución (8 Fases)

Ejecuta las fases en orden. Al finalizar cada fase:
1. Reporta los archivos creados
2. Confirma que no hay errores de TypeScript
3. Espera confirmación antes de continuar con la siguiente fase

Si alcanzas límites de contexto, detente y espera la instrucción "continúa con la fase X".

---

### 🔧 FASE 1: Configuración del Proyecto

Genera los archivos de configuración raíz:

```
/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.cjs
├── .prettierrc
├── index.html
└── README.md
```

#### `package.json` - Dependencias REQUERIDAS

```json
{
  "name": "edutrack-ta",
  "version": "1.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "zustand": "^4.5.4",
    "dexie": "^4.0.8",
    "dexie-react-hooks": "^1.1.7",
    "papaparse": "^5.4.1",
    "xlsx": "^0.18.5",
    "date-fns": "^3.6.0",
    "zod": "^3.23.8",
    "react-hook-form": "^7.52.1",
    "@hookform/resolvers": "^3.9.0",
    "recharts": "^2.12.7",
    "@tanstack/react-table": "^8.20.0",
    "@tanstack/react-virtual": "^3.8.4",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.2",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.4.0",
    "lucide-react": "^0.427.0",
    "sonner": "^1.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/papaparse": "^5.3.14",
    "@typescript-eslint/eslint-plugin": "^7.18.0",
    "@typescript-eslint/parser": "^7.18.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-react-refresh": "^0.4.9",
    "postcss": "^8.4.41",
    "prettier": "^3.3.3",
    "tailwindcss": "^3.4.9",
    "typescript": "^5.5.4",
    "vite": "^5.4.0",
    "vitest": "^2.0.5",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.8",
    "jsdom": "^24.1.1"
  }
}
```

#### `vite.config.ts`
- Alias `@/` → `src/`
- Plugin React
- Configuración de Vitest con jsdom
- Path resolution para tests

#### `tailwind.config.js`
**COPIAR EXACTAMENTE** la paleta del AGENT.MD:
- `darkMode: 'class'`
- Fondos: slate-950, slate-900, slate-800
- Primario: indigo-500, cyan-600
- Texto: slate-100, slate-400, slate-500
- Semáforo: emerald-500, amber-400, rose-500, sky-400
- Fuentes: Inter, JetBrains Mono

#### `tsconfig.json`
- Strict mode habilitado
- Path alias `@/*` → `./src/*`
- Target ES2022, Module ESNext

#### `.eslintrc.cjs`
- Parser: `@typescript-eslint/parser`
- Plugins: react-hooks, react-refresh, @typescript-eslint
- Regla: react-hooks/exhaustive-deps como error

#### `.prettierrc`
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

#### `index.html`
- Título: "EduTrack TA - Sistema de Seguimiento Estudiantil"
- Clase `dark` en `<html>` por defecto
- Fuente Inter desde Google Fonts
- Div root con id="root"

#### `README.md`
- Descripción del proyecto
- Requisitos (Node 20+)
- Scripts disponibles
- Link a AGENT.MD

**Validación Fase 1:**
- [ ] `npm install` funciona sin errores
- [ ] `npm run typecheck` pasa
- [ ] `npm run lint` pasa

---

### 📁 FASE 2: Estructura de Carpetas FSD

Crea la estructura de directorios con archivos `index.ts` de exportación:

```
src/
├── main.tsx
├── App.tsx
├── vite-env.d.ts
│
├── app/
│   ├── providers/
│   │   ├── index.ts
│   │   └── app-providers.tsx
│   ├── routers/
│   │   ├── index.ts
│   │   └── app-router.tsx
│   └── styles/
│       ├── index.css
│       └── globals.css
│
├── pages/
│   ├── dashboard/index.tsx
│   ├── students/
│   │   ├── index.tsx
│   │   └── [id]/index.tsx
│   ├── ingestion/index.tsx
│   ├── analytics/index.tsx
│   ├── crm/index.tsx
│   └── settings/index.tsx
│
├── widgets/
│   ├── layout/
│   │   ├── main-layout.tsx
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   ├── student-dashboard/
│   ├── cohort-overview/
│   └── risk-alerts-panel/
│
├── features/
│   ├── students/
│   │   ├── model/
│   │   ├── ui/
│   │   ├── api/
│   │   ├── lib/
│   │   └── index.ts
│   ├── ingestion/
│   │   ├── model/
│   │   ├── ui/
│   │   ├── api/
│   │   ├── lib/
│   │   ├── config/
│   │   └── index.ts
│   ├── risk-engine/
│   │   ├── model/
│   │   ├── ui/
│   │   ├── lib/
│   │   ├── config/
│   │   ├── types/
│   │   └── index.ts
│   ├── analytics/
│   │   ├── model/
│   │   ├── ui/
│   │   ├── lib/
│   │   └── index.ts
│   ├── crm/
│   │   ├── model/
│   │   ├── ui/
│   │   ├── lib/
│   │   └── index.ts
│   ├── syllabus/
│   │   ├── model/
│   │   ├── ui/
│   │   ├── api/
│   │   └── index.ts
│   └── ai-assistant/
│       ├── model/
│       ├── ui/
│       ├── lib/
│       ├── config/
│       └── index.ts
│
├── entities/
│   ├── student/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── attendance/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── progress/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── dedication/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── syllabus/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── note/
│   │   ├── types.ts
│   │   └── index.ts
│   └── cohort/
│       ├── types.ts
│       └── index.ts
│
└── shared/
    ├── ui/
    │   ├── button.tsx
    │   ├── card.tsx
    │   ├── badge.tsx
    │   ├── input.tsx
    │   ├── select.tsx
    │   ├── modal.tsx
    │   ├── toast.tsx
    │   ├── skeleton.tsx
    │   ├── empty-state.tsx
    │   └── index.ts
    ├── lib/
    │   ├── utils.ts
    │   ├── database.ts
    │   ├── database-helpers.ts
    │   ├── date.ts
    │   ├── file.ts
    │   └── index.ts
    ├── hooks/
    │   ├── use-local-storage.ts
    │   ├── use-debounce.ts
    │   └── index.ts
    ├── config/
    │   ├── constants.ts
    │   ├── feature-flags.ts (YA EXISTE - NO REEMPLAZAR)
    │   └── index.ts
    ├── types/
    │   ├── common.ts
    │   └── index.ts
    └── mocks/
        ├── students.ts
        ├── attendance.ts
        ├── progress.ts
        ├── dedication.ts
        ├── syllabus.ts
        ├── notes.ts
        └── seed-database.ts
```

**Reglas:**
- Cada carpeta de feature DEBE tener `index.ts` como public API
- Cada entity DEBE tener `types.ts` con la interfaz TypeScript
- Los `index.ts` solo exportan, no contienen lógica
- **NO reemplazar** `shared/config/feature-flags.ts` (ya existe)

**Validación Fase 2:**
- [ ] Estructura FSD completa
- [ ] No hay imports rotos
- [ ] `npm run typecheck` pasa

---

### 🎨 FASE 3: Shared Layer - UI Kit Base

Genera los componentes base siguiendo `ui-design.md`:

#### `shared/lib/utils.ts`
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

#### `shared/ui/button.tsx`
- Variantes: `primary`, `secondary`, `ghost`, `danger`
- Tamaños: `sm`, `md`, `lg`
- Soporte para `isLoading` con spinner
- Soporte para `leftIcon` y `rightIcon`
- Forward ref
- Disabled state con estilos apropiados

#### `shared/ui/card.tsx`
- Variantes: `default`, `elevated`, `bordered`
- Padding: `none`, `sm`, `md`, `lg`
- Componentes auxiliares: `Card.Header`, `Card.Content`, `Card.Footer`

#### `shared/ui/badge.tsx`
**CRÍTICO:** Mapear el semáforo del AGENT.MD:
```typescript
const statusColors = {
  'active': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'dropout': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  'inactive': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  'risk-low': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'risk-medium': 'bg-amber-400/20 text-amber-300 border-amber-400/30',
  'risk-high': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};
```

#### `shared/ui/input.tsx`
- Label, error message, helper text
- Estados: default, focus, error, disabled
- Icon support (left/right)
- Forward ref

#### `shared/ui/select.tsx`
- Wrapper sobre Radix UI Select
- Label, placeholder, error

#### `shared/ui/modal.tsx`
- Wrapper sobre Radix UI Dialog
- Title, description, footer
- Close on escape/overlay

#### `shared/ui/toast.tsx`
- Wrapper sobre Sonner
- Posición: bottom-right
- Tipos: success, error, warning, info

#### `shared/ui/skeleton.tsx`
- Loading placeholder
- Variantes: text, circular, rectangular
- Animación pulse

#### `shared/ui/empty-state.tsx`
- Icono, título, descripción
- Acción opcional

#### `shared/ui/index.ts`
- Exportar todos los componentes

**Validación Fase 3:**
- [ ] Todos los componentes usan `cn()` para clases
- [ ] Paleta de colores respeta el AGENT.MD
- [ ] Dark mode funciona por defecto
- [ ] `npm run typecheck` pasa

---

### 📊 FASE 4: Entities Layer - Modelos de Datos

Copia EXACTAMENTE las interfaces del AGENT.MD:

#### `entities/student/types.ts`
```typescript
export interface Student {
  id: string;
  cohortId: string;
  externalId: string;
  fullName: string;
  email?: string;
  status: 'active' | 'dropout' | 'inactive';
  enrollmentDate: string;
  tags: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
```

Repetir para:
- `entities/attendance/types.ts` → `AttendanceRecord`
- `entities/progress/types.ts` → `ProgressRecord`
- `entities/dedication/types.ts` → `DedicationRecord`
- `entities/syllabus/types.ts` → `SyllabusModule`
- `entities/note/types.ts` → `Note`
- `entities/cohort/types.ts` → `Cohort`

**Cada `index.ts` debe:**
```typescript
export * from './types';
```

**Validación Fase 4:**
- [ ] Interfaces coinciden con AGENT.MD
- [ ] No se usa `any` (solo `unknown`)
- [ ] `npm run typecheck` pasa

---

### 🗄️ FASE 5: Database Layer (Dexie.js)

#### `shared/lib/database.ts`
```typescript
import Dexie, { type Table } from 'dexie';
import type { Student, AttendanceRecord, ProgressRecord, DedicationRecord, SyllabusModule, Note, Cohort } from '@/entities';

export class EduTrackDatabase extends Dexie {
  cohorts!: Table<Cohort, string>;
  students!: Table<Student, string>;
  attendance!: Table<AttendanceRecord, string>;
  progress!: Table<ProgressRecord, string>;
  dedication!: Table<DedicationRecord, string>;
  syllabus!: Table<SyllabusModule, string>;
  notes!: Table<Note, string>;

  constructor() {
    super('edutrack-ta');
    
    this.version(1).stores({
      cohorts: 'id, name, startDate, endDate',
      students: 'id, cohortId, externalId, email, status, fullName, [cohortId+status], [cohortId+externalId]',
      attendance: 'id, studentId, date, status, [studentId+date]',
      progress: 'id, studentId, activityName, moduleNumber, completed, [studentId+activityName]',
      dedication: 'id, studentId, date, platform, [studentId+date]',
      syllabus: 'id, cohortId, moduleNumber, [cohortId+moduleNumber]',
      notes: 'id, studentId, type, priority, dueDate, isCompleted, [studentId+type], [studentId+isCompleted]'
    });
  }
}

export const db = new EduTrackDatabase();
```

#### `shared/lib/database-helpers.ts`
Funciones helper para CRUD:
- `getAllStudents(cohortId?: string)`
- `getStudentById(id: string)`
- `getAttendanceByStudent(studentId: string)`
- `getProgressByStudent(studentId: string)`
- `getDedicationByStudent(studentId: string)`
- `getNotesByStudent(studentId: string)`
- `upsertStudent(student: Student)`
- `bulkUpsertStudents(students: Student[])`

#### `shared/lib/index.ts`
```typescript
export * from './utils';
export * from './database';
export * from './database-helpers';
```

**Validación Fase 5:**
- [ ] Dexie configurado correctamente
- [ ] Índices definidos para queries comunes
- [ ] Helpers tipados correctamente
- [ ] `npm run typecheck` pasa

---

### 🏗️ FASE 6: App Layer - Providers, Router y Styles

#### `app/providers/app-providers.tsx`
```typescript
import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      {children}
      <Toaster position="bottom-right" richColors closeButton />
    </BrowserRouter>
  );
}
```

#### `app/routers/app-router.tsx`
```typescript
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/widgets/layout/main-layout';
import { DashboardPage } from '@/pages/dashboard';
import { StudentsPage } from '@/pages/students';
import { StudentDetailPage } from '@/pages/students/[id]';
import { IngestionPage } from '@/pages/ingestion';
import { AnalyticsPage } from '@/pages/analytics';
import { CrmPage } from '@/pages/crm';
import { SettingsPage } from '@/pages/settings';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/students/:id" element={<StudentDetailPage />} />
        <Route path="/ingestion" element={<IngestionPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/crm" element={<CrmPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
```

#### `app/styles/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    color-scheme: dark;
  }
  
  body {
    @apply bg-slate-950 text-slate-100 antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

@layer utilities {
  .scrollbar-thin {
    scrollbar-width: thin;
  }
  
  .scrollbar-none {
    scrollbar-width: none;
  }
}
```

#### `App.tsx`
```typescript
import { AppProviders } from '@/app/providers';
import { AppRouter } from '@/app/routers';

export function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
```

#### `main.tsx`
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { seedDatabase } from '@/shared/mocks/seed-database';
import './app/styles/globals.css';

async function bootstrap() {
  await seedDatabase();
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
```

**Validación Fase 6:**
- [ ] Router configurado con todas las rutas
- [ ] Toaster de Sonner funcionando
- [ ] Dark mode activo por defecto
- [ ] `npm run dev` inicia sin errores
- [ ] `npm run typecheck` pasa

---

### 🧩 FASE 7: Widgets Layer - Layout Principal

#### `widgets/layout/main-layout.tsx`
- Layout con Sidebar + Header + Main content
- Outlet de React Router
- Responsive (sidebar colapsable en mobile)

#### `widgets/layout/sidebar.tsx`
- Logo "EduTrack TA"
- Navegación con iconos de Lucide:
  - Dashboard (`LayoutDashboard`)
  - Estudiantes (`Users`)
  - Carga de datos (`Upload`)
  - Analítica (`BarChart3`)
  - CRM (`MessageSquare`)
  - Configuración (`Settings`)
- Indicador de ruta activa (gradiente indigo→cyan)

#### `widgets/layout/header.tsx`
- Breadcrumb
- Selector de cohorte (dropdown)
- Botón de notificaciones (campana con badge)
- Avatar de usuario (placeholder)

**Validación Fase 7:**
- [ ] Layout responsive
- [ ] Navegación entre páginas funciona
- [ ] Sidebar resalta ruta activa
- [ ] `npm run dev` muestra la UI correctamente

---

### 🎭 FASE 8: Datos Mock y Seed

#### `shared/mocks/students.ts`
Genera 20 estudiantes mock:
- Nombres realistas en español
- Emails
- Estados: 70% active, 20% dropout, 10% inactive
- Tags variados
- Fechas de inscripción en los últimos 60 días

#### `shared/mocks/attendance.ts`
- 30 días de historia por estudiante
- 80% present, 15% absent, 5% late

#### `shared/mocks/progress.ts`
- 5 módulos con 10 actividades cada uno
- Completitud variable (30%-100%)

#### `shared/mocks/dedication.ts`
- 30 días de historia
- Promedio 2-4 horas/día
- Algunos con tendencia decreciente

#### `shared/mocks/syllabus.ts`
- 5 módulos con fechas realistas
- Horas esperadas por módulo
- Lista de actividades

#### `shared/mocks/notes.ts`
- 30 notas variadas
- Tipos: context, action, alert, general
- Prioridades variadas

#### `shared/mocks/seed-database.ts`
```typescript
import { db } from '@/shared/lib/database';
import { mockStudents } from './students';
import { mockAttendance } from './attendance';
import { mockProgress } from './progress';
import { mockDedication } from './dedication';
import { mockSyllabus } from './syllabus';
import { mockNotes } from './notes';
import { mockCohorts } from './cohorts';

export async function seedDatabase() {
  const count = await db.students.count();
  if (count > 0) {
    console.log('ℹ️ Database already seeded, skipping...');
    return;
  }
  
  try {
    await db.cohorts.bulkAdd(mockCohorts);
    await db.students.bulkAdd(mockStudents);
    await db.attendance.bulkAdd(mockAttendance);
    await db.progress.bulkAdd(mockProgress);
    await db.dedication.bulkAdd(mockDedication);
    await db.syllabus.bulkAdd(mockSyllabus);
    await db.notes.bulkAdd(mockNotes);
    
    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}
```

**Validación Fase 8:**
- [ ] Datos mock realistas y variados
- [ ] Seed se ejecuta solo una vez
- [ ] IndexedDB poblado al iniciar la app
- [ ] Dashboard muestra datos correctamente

---

## ✅ Validación Final del Scaffolding

Después de las 8 fases, verifica:

- [ ] `npm install` funciona sin errores
- [ ] `npm run dev` inicia sin errores
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm run lint` pasa sin errores
- [ ] La app muestra el layout principal
- [ ] La navegación entre páginas funciona
- [ ] Los datos mock se cargan en IndexedDB
- [ ] El dark mode está activo por defecto
- [ ] Los colores siguen la paleta del AGENT.MD
- [ ] Los componentes UI son consistentes
- [ ] No hay imports rotos
- [ ] La estructura FSD se respeta
- [ ] No se usa `any` en TypeScript
- [ ] No hay referencias a servicios eliminados (Resend, Slack, Discord, etc.)

---

## 📤 Output Esperado por Fase

Al finalizar cada fase, reporta en este formato:

```markdown
## Fase X Completada ✅

### Archivos creados/modificados:
- path/to/file1.ts
- path/to/file2.tsx
- ...

### Total: N archivos

### Validación:
- [ ] npm run typecheck: ✅
- [ ] npm run lint: ✅
- [ ] Sin imports rotos: ✅

### Notas:
- [Cualquier decisión tomada o problema encontrado]
```

Al finalizar todas las fases, genera un resumen:

```markdown
# Resumen de Scaffolding Generado

## Estadísticas
- Total de archivos: X
- Componentes React: X
- Hooks custom: X
- Stores Zustand: X (si aplica)
- Utilidades: X
- Mocks: X

## Estructura FSD
- app/: X archivos
- pages/: X archivos
- widgets/: X archivos
- features/: X archivos
- entities/: X archivos
- shared/: X archivos

## Estado del Proyecto
- ✅ npm install funciona
- ✅ npm run dev funciona
- ✅ npm run typecheck pasa
- ✅ npm run lint pasa
- ✅ Datos mock cargados
- ✅ Dark mode activo
- ✅ Layout funcional

## Próximos Pasos Sugeridos
1. Ejecutar `npm run dev` y verificar visualmente
2. Revisar páginas y componentes generados
3. Comenzar desarrollo de features específicas
```

---

## ⚠️ Reglas Críticas

1. **NO uses `any`** en TypeScript - usa `unknown` o tipos específicos
2. **NO uses CSS modules** ni styled-components - solo Tailwind
3. **NO uses Redux/MobX** - solo Zustand si es necesario
4. **NO cambies la paleta de colores** del AGENT.MD
Aquí tienes el prompt de scaffolding actualizado, optimizado y consistente con tu AGENT.MD v1.1.0. Está más enfocado y sin referencias a servicios de Fase 2 (Supabase, etc.).

---

```markdown
# PROMPT PARA KIRO - Generación de Código Base (Scaffolding)

## 🎯 Contexto

Ya tienes la configuración completa del proyecto:
- ✅ `AGENT.MD` v1.1.0 (especificaciones completas)
- ✅ `.kiro/` sincronizado (specs, steering, hooks, skills)
- ✅ Feature flags implementados (`shared/config/feature-flags.ts`)
- ✅ Stack definido: React + TypeScript + Tailwind + Dexie + Zustand

Tu tarea ahora es **generar el código base funcional** del proyecto EduTrack TA. Al finalizar, la app debe:
- Correr con `npm run dev` sin errores
- Mostrar el layout principal con navegación funcional
- Tener datos mock cargados en IndexedDB
- Estar en dark mode por defecto
- Respetar la paleta de colores del AGENT.MD

## 📚 Documentación de Referencia

Antes de generar código, lee en este orden:
1. `AGENT.MD` (especificaciones completas)
2. `.kiro/steering/tech-stack.md` (stack y restricciones)
3. `.kiro/steering/architecture.md` (arquitectura FSD)
4. `.kiro/steering/ui-design.md` (paleta y componentes)
5. `.kiro/steering/code-style.md` (convenciones)
6. `.kiro/steering/data-models.md` (modelos de datos)
7. `shared/config/feature-flags.ts` (feature flags)

**Si hay conflicto entre archivos, la prioridad es:**
AGENT.MD > tech-stack.md > architecture.md > ui-design.md > code-style.md

---

## 📋 Plan de Ejecución (8 Fases)

Ejecuta las fases en orden. Al finalizar cada fase:
1. Reporta los archivos creados
2. Confirma que no hay errores de TypeScript
3. Espera confirmación antes de continuar con la siguiente fase

Si alcanzas límites de contexto, detente y espera la instrucción "continúa con la fase X".

---

### 🔧 FASE 1: Configuración del Proyecto

Genera los archivos de configuración raíz:

```
/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.cjs
├── .prettierrc
├── index.html
└── README.md
```

#### `package.json` - Dependencias REQUERIDAS

```json
{
  "name": "edutrack-ta",
  "version": "1.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "zustand": "^4.5.4",
    "dexie": "^4.0.8",
    "dexie-react-hooks": "^1.1.7",
    "papaparse": "^5.4.1",
    "xlsx": "^0.18.5",
    "date-fns": "^3.6.0",
    "zod": "^3.23.8",
    "react-hook-form": "^7.52.1",
    "@hookform/resolvers": "^3.9.0",
    "recharts": "^2.12.7",
    "@tanstack/react-table": "^8.20.0",
    "@tanstack/react-virtual": "^3.8.4",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.2",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.4.0",
    "lucide-react": "^0.427.0",
    "sonner": "^1.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/papaparse": "^5.3.14",
    "@typescript-eslint/eslint-plugin": "^7.18.0",
    "@typescript-eslint/parser": "^7.18.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-react-refresh": "^0.4.9",
    "postcss": "^8.4.41",
    "prettier": "^3.3.3",
    "tailwindcss": "^3.4.9",
    "typescript": "^5.5.4",
    "vite": "^5.4.0",
    "vitest": "^2.0.5",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.8",
    "jsdom": "^24.1.1"
  }
}
```

#### `vite.config.ts`
- Alias `@/` → `src/`
- Plugin React
- Configuración de Vitest con jsdom
- Path resolution para tests

#### `tailwind.config.js`
**COPIAR EXACTAMENTE** la paleta del AGENT.MD:
- `darkMode: 'class'`
- Fondos: slate-950, slate-900, slate-800
- Primario: indigo-500, cyan-600
- Texto: slate-100, slate-400, slate-500
- Semáforo: emerald-500, amber-400, rose-500, sky-400
- Fuentes: Inter, JetBrains Mono

#### `tsconfig.json`
- Strict mode habilitado
- Path alias `@/*` → `./src/*`
- Target ES2022, Module ESNext

#### `.eslintrc.cjs`
- Parser: `@typescript-eslint/parser`
- Plugins: react-hooks, react-refresh, @typescript-eslint
- Regla: react-hooks/exhaustive-deps como error

#### `.prettierrc`
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

#### `index.html`
- Título: "EduTrack TA - Sistema de Seguimiento Estudiantil"
- Clase `dark` en `<html>` por defecto
- Fuente Inter desde Google Fonts
- Div root con id="root"

#### `README.md`
- Descripción del proyecto
- Requisitos (Node 20+)
- Scripts disponibles
- Link a AGENT.MD

**Validación Fase 1:**
- [ ] `npm install` funciona sin errores
- [ ] `npm run typecheck` pasa
- [ ] `npm run lint` pasa

---

### 📁 FASE 2: Estructura de Carpetas FSD

Crea la estructura de directorios con archivos `index.ts` de exportación:

```
src/
├── main.tsx
├── App.tsx
├── vite-env.d.ts
│
├── app/
│   ├── providers/
│   │   ├── index.ts
│   │   └── app-providers.tsx
│   ├── routers/
│   │   ├── index.ts
│   │   └── app-router.tsx
│   └── styles/
│       ├── index.css
│       └── globals.css
│
├── pages/
│   ├── dashboard/index.tsx
│   ├── students/
│   │   ├── index.tsx
│   │   └── [id]/index.tsx
│   ├── ingestion/index.tsx
│   ├── analytics/index.tsx
│   ├── crm/index.tsx
│   └── settings/index.tsx
│
├── widgets/
│   ├── layout/
│   │   ├── main-layout.tsx
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   ├── student-dashboard/
│   ├── cohort-overview/
│   └── risk-alerts-panel/
│
├── features/
│   ├── students/
│   │   ├── model/
│   │   ├── ui/
│   │   ├── api/
│   │   ├── lib/
│   │   └── index.ts
│   ├── ingestion/
│   │   ├── model/
│   │   ├── ui/
│   │   ├── api/
│   │   ├── lib/
│   │   ├── config/
│   │   └── index.ts
│   ├── risk-engine/
│   │   ├── model/
│   │   ├── ui/
│   │   ├── lib/
│   │   ├── config/
│   │   ├── types/
│   │   └── index.ts
│   ├── analytics/
│   │   ├── model/
│   │   ├── ui/
│   │   ├── lib/
│   │   └── index.ts
│   ├── crm/
│   │   ├── model/
│   │   ├── ui/
│   │   ├── lib/
│   │   └── index.ts
│   ├── syllabus/
│   │   ├── model/
│   │   ├── ui/
│   │   ├── api/
│   │   └── index.ts
│   └── ai-assistant/
│       ├── model/
│       ├── ui/
│       ├── lib/
│       ├── config/
│       └── index.ts
│
├── entities/
│   ├── student/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── attendance/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── progress/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── dedication/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── syllabus/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── note/
│   │   ├── types.ts
│   │   └── index.ts
│   └── cohort/
│       ├── types.ts
│       └── index.ts
│
└── shared/
    ├── ui/
    │   ├── button.tsx
    │   ├── card.tsx
    │   ├── badge.tsx
    │   ├── input.tsx
    │   ├── select.tsx
    │   ├── modal.tsx
    │   ├── toast.tsx
    │   ├── skeleton.tsx
    │   ├── empty-state.tsx
    │   └── index.ts
    ├── lib/
    │   ├── utils.ts
    │   ├── database.ts
    │   ├── database-helpers.ts
    │   ├── date.ts
    │   ├── file.ts
    │   └── index.ts
    ├── hooks/
    │   ├── use-local-storage.ts
    │   ├── use-debounce.ts
    │   └── index.ts
    ├── config/
    │   ├── constants.ts
    │   ├── feature-flags.ts (YA EXISTE - NO REEMPLAZAR)
    │   └── index.ts
    ├── types/
    │   ├── common.ts
    │   └── index.ts
    └── mocks/
        ├── students.ts
        ├── attendance.ts
        ├── progress.ts
        ├── dedication.ts
        ├── syllabus.ts
        ├── notes.ts
        └── seed-database.ts
```

**Reglas:**
- Cada carpeta de feature DEBE tener `index.ts` como public API
- Cada entity DEBE tener `types.ts` con la interfaz TypeScript
- Los `index.ts` solo exportan, no contienen lógica
- **NO reemplazar** `shared/config/feature-flags.ts` (ya existe)

**Validación Fase 2:**
- [ ] Estructura FSD completa
- [ ] No hay imports rotos
- [ ] `npm run typecheck` pasa

---

### 🎨 FASE 3: Shared Layer - UI Kit Base

Genera los componentes base siguiendo `ui-design.md`:

#### `shared/lib/utils.ts`
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

#### `shared/ui/button.tsx`
- Variantes: `primary`, `secondary`, `ghost`, `danger`
- Tamaños: `sm`, `md`, `lg`
- Soporte para `isLoading` con spinner
- Soporte para `leftIcon` y `rightIcon`
- Forward ref
- Disabled state con estilos apropiados

#### `shared/ui/card.tsx`
- Variantes: `default`, `elevated`, `bordered`
- Padding: `none`, `sm`, `md`, `lg`
- Componentes auxiliares: `Card.Header`, `Card.Content`, `Card.Footer`

#### `shared/ui/badge.tsx`
**CRÍTICO:** Mapear el semáforo del AGENT.MD:
```typescript
const statusColors = {
  'active': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'dropout': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  'inactive': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  'risk-low': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'risk-medium': 'bg-amber-400/20 text-amber-300 border-amber-400/30',
  'risk-high': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};
```

#### `shared/ui/input.tsx`
- Label, error message, helper text
- Estados: default, focus, error, disabled
- Icon support (left/right)
- Forward ref

#### `shared/ui/select.tsx`
- Wrapper sobre Radix UI Select
- Label, placeholder, error

#### `shared/ui/modal.tsx`
- Wrapper sobre Radix UI Dialog
- Title, description, footer
- Close on escape/overlay

#### `shared/ui/toast.tsx`
- Wrapper sobre Sonner
- Posición: bottom-right
- Tipos: success, error, warning, info

#### `shared/ui/skeleton.tsx`
- Loading placeholder
- Variantes: text, circular, rectangular
- Animación pulse

#### `shared/ui/empty-state.tsx`
- Icono, título, descripción
- Acción opcional

#### `shared/ui/index.ts`
- Exportar todos los componentes

**Validación Fase 3:**
- [ ] Todos los componentes usan `cn()` para clases
- [ ] Paleta de colores respeta el AGENT.MD
- [ ] Dark mode funciona por defecto
- [ ] `npm run typecheck` pasa

---

### 📊 FASE 4: Entities Layer - Modelos de Datos

Copia EXACTAMENTE las interfaces del AGENT.MD:

#### `entities/student/types.ts`
```typescript
export interface Student {
  id: string;
  cohortId: string;
  externalId: string;
  fullName: string;
  email?: string;
  status: 'active' | 'dropout' | 'inactive';
  enrollmentDate: string;
  tags: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
```

Repetir para:
- `entities/attendance/types.ts` → `AttendanceRecord`
- `entities/progress/types.ts` → `ProgressRecord`
- `entities/dedication/types.ts` → `DedicationRecord`
- `entities/syllabus/types.ts` → `SyllabusModule`
- `entities/note/types.ts` → `Note`
- `entities/cohort/types.ts` → `Cohort`

**Cada `index.ts` debe:**
```typescript
export * from './types';
```

**Validación Fase 4:**
- [ ] Interfaces coinciden con AGENT.MD
- [ ] No se usa `any` (solo `unknown`)
- [ ] `npm run typecheck` pasa

---

### 🗄️ FASE 5: Database Layer (Dexie.js)

#### `shared/lib/database.ts`
```typescript
import Dexie, { type Table } from 'dexie';
import type { Student, AttendanceRecord, ProgressRecord, DedicationRecord, SyllabusModule, Note, Cohort } from '@/entities';

export class EduTrackDatabase extends Dexie {
  cohorts!: Table<Cohort, string>;
  students!: Table<Student, string>;
  attendance!: Table<AttendanceRecord, string>;
  progress!: Table<ProgressRecord, string>;
  dedication!: Table<DedicationRecord, string>;
  syllabus!: Table<SyllabusModule, string>;
  notes!: Table<Note, string>;

  constructor() {
    super('edutrack-ta');
    
    this.version(1).stores({
      cohorts: 'id, name, startDate, endDate',
      students: 'id, cohortId, externalId, email, status, fullName, [cohortId+status], [cohortId+externalId]',
      attendance: 'id, studentId, date, status, [studentId+date]',
      progress: 'id, studentId, activityName, moduleNumber, completed, [studentId+activityName]',
      dedication: 'id, studentId, date, platform, [studentId+date]',
      syllabus: 'id, cohortId, moduleNumber, [cohortId+moduleNumber]',
      notes: 'id, studentId, type, priority, dueDate, isCompleted, [studentId+type], [studentId+isCompleted]'
    });
  }
}

export const db = new EduTrackDatabase();
```

#### `shared/lib/database-helpers.ts`
Funciones helper para CRUD:
- `getAllStudents(cohortId?: string)`
- `getStudentById(id: string)`
- `getAttendanceByStudent(studentId: string)`
- `getProgressByStudent(studentId: string)`
- `getDedicationByStudent(studentId: string)`
- `getNotesByStudent(studentId: string)`
- `upsertStudent(student: Student)`
- `bulkUpsertStudents(students: Student[])`

#### `shared/lib/index.ts`
```typescript
export * from './utils';
export * from './database';
export * from './database-helpers';
```

**Validación Fase 5:**
- [ ] Dexie configurado correctamente
- [ ] Índices definidos para queries comunes
- [ ] Helpers tipados correctamente
- [ ] `npm run typecheck` pasa

---

### 🏗️ FASE 6: App Layer - Providers, Router y Styles

#### `app/providers/app-providers.tsx`
```typescript
import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      {children}
      <Toaster position="bottom-right" richColors closeButton />
    </BrowserRouter>
  );
}
```

#### `app/routers/app-router.tsx`
```typescript
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/widgets/layout/main-layout';
import { DashboardPage } from '@/pages/dashboard';
import { StudentsPage } from '@/pages/students';
import { StudentDetailPage } from '@/pages/students/[id]';
import { IngestionPage } from '@/pages/ingestion';
import { AnalyticsPage } from '@/pages/analytics';
import { CrmPage } from '@/pages/crm';
import { SettingsPage } from '@/pages/settings';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/students/:id" element={<StudentDetailPage />} />
        <Route path="/ingestion" element={<IngestionPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/crm" element={<CrmPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
```

#### `app/styles/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    color-scheme: dark;
  }
  
  body {
    @apply bg-slate-950 text-slate-100 antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

@layer utilities {
  .scrollbar-thin {
    scrollbar-width: thin;
  }
  
  .scrollbar-none {
    scrollbar-width: none;
  }
}
```

#### `App.tsx`
```typescript
import { AppProviders } from '@/app/providers';
import { AppRouter } from '@/app/routers';

export function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
```

#### `main.tsx`
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { seedDatabase } from '@/shared/mocks/seed-database';
import './app/styles/globals.css';

async function bootstrap() {
  await seedDatabase();
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
```

**Validación Fase 6:**
- [ ] Router configurado con todas las rutas
- [ ] Toaster de Sonner funcionando
- [ ] Dark mode activo por defecto
- [ ] `npm run dev` inicia sin errores
- [ ] `npm run typecheck` pasa

---

### 🧩 FASE 7: Widgets Layer - Layout Principal

#### `widgets/layout/main-layout.tsx`
- Layout con Sidebar + Header + Main content
- Outlet de React Router
- Responsive (sidebar colapsable en mobile)

#### `widgets/layout/sidebar.tsx`
- Logo "EduTrack TA"
- Navegación con iconos de Lucide:
  - Dashboard (`LayoutDashboard`)
  - Estudiantes (`Users`)
  - Carga de datos (`Upload`)
  - Analítica (`BarChart3`)
  - CRM (`MessageSquare`)
  - Configuración (`Settings`)
- Indicador de ruta activa (gradiente indigo→cyan)

#### `widgets/layout/header.tsx`
- Breadcrumb
- Selector de cohorte (dropdown)
- Botón de notificaciones (campana con badge)
- Avatar de usuario (placeholder)

**Validación Fase 7:**
- [ ] Layout responsive
- [ ] Navegación entre páginas funciona
- [ ] Sidebar resalta ruta activa
- [ ] `npm run dev` muestra la UI correctamente

---

### 🎭 FASE 8: Datos Mock y Seed

#### `shared/mocks/students.ts`
Genera 20 estudiantes mock:
- Nombres realistas en español
- Emails
- Estados: 70% active, 20% dropout, 10% inactive
- Tags variados
- Fechas de inscripción en los últimos 60 días

#### `shared/mocks/attendance.ts`
- 30 días de historia por estudiante
- 80% present, 15% absent, 5% late

#### `shared/mocks/progress.ts`
- 5 módulos con 10 actividades cada uno
- Completitud variable (30%-100%)

#### `shared/mocks/dedication.ts`
- 30 días de historia
- Promedio 2-4 horas/día
- Algunos con tendencia decreciente

#### `shared/mocks/syllabus.ts`
- 5 módulos con fechas realistas
- Horas esperadas por módulo
- Lista de actividades

#### `shared/mocks/notes.ts`
- 30 notas variadas
- Tipos: context, action, alert, general
- Prioridades variadas

#### `shared/mocks/seed-database.ts`
```typescript
import { db } from '@/shared/lib/database';
import { mockStudents } from './students';
import { mockAttendance } from './attendance';
import { mockProgress } from './progress';
import { mockDedication } from './dedication';
import { mockSyllabus } from './syllabus';
import { mockNotes } from './notes';
import { mockCohorts } from './cohorts';

export async function seedDatabase() {
  const count = await db.students.count();
  if (count > 0) {
    console.log('ℹ️ Database already seeded, skipping...');
    return;
  }
  
  try {
    await db.cohorts.bulkAdd(mockCohorts);
    await db.students.bulkAdd(mockStudents);
    await db.attendance.bulkAdd(mockAttendance);
    await db.progress.bulkAdd(mockProgress);
    await db.dedication.bulkAdd(mockDedication);
    await db.syllabus.bulkAdd(mockSyllabus);
    await db.notes.bulkAdd(mockNotes);
    
    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}
```

**Validación Fase 8:**
- [ ] Datos mock realistas y variados
- [ ] Seed se ejecuta solo una vez
- [ ] IndexedDB poblado al iniciar la app
- [ ] Dashboard muestra datos correctamente

---

## ✅ Validación Final del Scaffolding

Después de las 8 fases, verifica:

- [ ] `npm install` funciona sin errores
- [ ] `npm run dev` inicia sin errores
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm run lint` pasa sin errores
- [ ] La app muestra el layout principal
- [ ] La navegación entre páginas funciona
- [ ] Los datos mock se cargan en IndexedDB
- [ ] El dark mode está activo por defecto
- [ ] Los colores siguen la paleta del AGENT.MD
- [ ] Los componentes UI son consistentes
- [ ] No hay imports rotos
- [ ] La estructura FSD se respeta
- [ ] No se usa `any` en TypeScript
- [ ] No hay referencias a servicios eliminados (Resend, Slack, Discord, etc.)

---

## 📤 Output Esperado por Fase

Al finalizar cada fase, reporta en este formato:

```markdown
## Fase X Completada ✅

### Archivos creados/modificados:
- path/to/file1.ts
- path/to/file2.tsx
- ...

### Total: N archivos

### Validación:
- [ ] npm run typecheck: ✅
- [ ] npm run lint: ✅
- [ ] Sin imports rotos: ✅

### Notas:
- [Cualquier decisión tomada o problema encontrado]
```

Al finalizar todas las fases, genera un resumen:

```markdown
# Resumen de Scaffolding Generado

## Estadísticas
- Total de archivos: X
- Componentes React: X
- Hooks custom: X
- Stores Zustand: X (si aplica)
- Utilidades: X
- Mocks: X

## Estructura FSD
- app/: X archivos
- pages/: X archivos
- widgets/: X archivos
- features/: X archivos
- entities/: X archivos
- shared/: X archivos

## Estado del Proyecto
- ✅ npm install funciona
- ✅ npm run dev funciona
- ✅ npm run typecheck pasa
- ✅ npm run lint pasa
- ✅ Datos mock cargados
- ✅ Dark mode activo
- ✅ Layout funcional

## Próximos Pasos Sugeridos
1. Ejecutar `npm run dev` y verificar visualmente
2. Revisar páginas y componentes generados
3. Comenzar desarrollo de features específicas
```

---

## ⚠️ Reglas Críticas

1. **NO uses `any`** en TypeScript - usa `unknown` o tipos específicos
2. **NO uses CSS modules** ni styled-components - solo Tailwind
3. **NO uses Redux/MobX** - solo Zustand si es necesario
4. **NO cambies la paleta de colores** del AGENT.MD
5. **NO rompas la arquitectura FSD** (capas superiores no importan de inferiores directamente)
6. **TypeScript strict mode** sin excepciones
7. **Dark mode por defecto**, no como toggle
8. **Accesibilidad WCAG AA** en todos los componentes interactivos
9. **NO incluyas Supabase** - es para Fase 2, no para scaffolding
10. **NO implementes IA** - solo deja la estructura vacía en `features/ai-assistant/`
11. **NO incluyas servicios eliminados** (Resend, Slack, Discord, Telegram, Gemini, etc.)
12. **Todos los componentes deben ser funcionales** con datos mock desde el inicio

---

## 🚀 Ejecución

Comienza leyendo los archivos de referencia en el orden indicado. Luego ejecuta las fases en orden (1 → 8).

**Inicia ahora con la FASE 1.**
```

---

## 📌 Cómo usar este prompt

1. **Abre Kiro** en tu proyecto (`~/proyectos/ta-student-check`)
2. **Copia y pega** este prompt en el chat
3. **Kiro ejecutará** las 8 fases en orden
4. **Monitorea** cada fase antes de continuar

## 💡 Tips importantes

### Si Kiro se detiene a mitad de una fase:
```
Continúa con la fase X. Estabas en [describe dónde se detuvo].
```

### Si hay errores de TypeScript:
```
Corrige los errores de typecheck en [archivos específicos].
```

### Si falta un archivo:
```
Genera el archivo faltante: path/to/file.ts
```

### Si quieres verificar algo específico:
```
Verifica que [algo específico] está correcto según el AGENT.MD.
```

## 🎯 Flujo completo recomendado

```bash
# 1. Estás en el directorio correcto
cd ~/proyectos/ta-student-check

# 2. Verifica que todo esté limpio
git status

# 3. Pega el prompt de scaffolding en Kiro

# 4. Monitorea cada fase

# 5. Al finalizar, verifica que todo funciona
npm install
npm run dev

# 6. Si todo está bien, commit
git add .
git commit -m "feat: scaffolding completo del proyecto EduTrack TA"
```

## ✅ Ventajas de este prompt

- **8 fases manejables** (en lugar de 10)
- **Sin Supabase** (solo para Fase 2)
- **IA como estructura vacía** (no implementada)
- **Validaciones por fase**
- **Consistente con AGENT.MD v1.1.0**
- **Sin servicios eliminados**

¿Listo para ejecutar? Cuando termines el scaffolding, podemos pasar a implementar las features específicas (motor de riesgo, ingesta de archivos, etc.).5. **NO rompas la arquitectura FSD** (capas superiores no importan de inferiores directamente)
6. **TypeScript strict mode** sin excepciones
7. **Dark mode por defecto**, no como toggle
8. **Accesibilidad WCAG AA** en todos los componentes interactivos
9. **NO incluyas Supabase** - es para Fase 2, no para scaffolding
10. **NO implementes IA** - solo deja la estructura vacía en `features/ai-assistant/`
11. **NO incluyas servicios eliminados** (Resend, Slack, Discord, Telegram, Gemini, etc.)
12. **Todos los componentes deben ser funcionales** con datos mock desde el inicio

---

## 🚀 Ejecución

Comienza leyendo los archivos de referencia en el orden indicado. Luego ejecuta las fases en orden (1 → 8).

**Inicia ahora con la FASE 1.**

