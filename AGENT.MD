
# AGENT.MD - Sistema de Seguimiento Estudiantil para Teacher Assistants

## 📋 Metadata del Proyecto
- **Nombre del Proyecto:** EduTrack TA (Teacher Assistant Tracking System)
- **Versión:** 1.1.0
- **Fecha de Creación:** 2026-06-22
- **Última Actualización:** 2026-06-22
- **Tipo de Aplicación:** Single Page Application (SPA) con capacidad offline-first
- **Público Objetivo:** Teacher Assistants de programas educativos técnicos
- **Idioma Principal:** Español (internacionalizable)
- **💰 Restricción Presupuestaria:** CAPA GRATUITA (Free Tier Only)
- **🚫 Sin notificaciones externas:** Solo notificaciones in-app (toasts)
- **🤖 IA opcional:** Solo Groq (gratis, sin tarjeta de crédito)

---

## 🎯 Visión y Objetivos

### Visión
Crear una herramienta de analítica educativa que transforme datos crudos de asistencia, progreso y dedicación en información accionable para prevenir la deserción estudiantil y optimizar el seguimiento personalizado.

### Objetivos Principales
1. **Centralización de Datos:** Unificar información dispersa en CSV/XLSX en un dashboard coherente
2. **Detección Temprana de Riesgo:** Identificar alumnos en peligro de deserción/reprobación antes de que sea irreversible
3. **CRM Educativo:** Facilitar el seguimiento contextualizado con notas y alertas in-app
4. **Visualización Intuitiva:** Presentar métricas complejas de forma visual y comprensible
5. **Offline-First:** Funcionar sin conexión, sincronizando cuando haya disponibilidad
6. **💰 Costo Cero:** Todos los servicios deben tener capa gratuita suficiente para uso en producción
7. **Simplicidad:** Sin dependencias de servicios externos de notificaciones (email, Slack, Discord, Telegram)

---

## 🛠️ Stack Tecnológico

### Frontend (Core)
```json
{
  "framework": "React 18.3+",
  "language": "TypeScript 5.4+ (Strict Mode)",
  "buildTool": "Vite 5.x",
  "styling": "Tailwind CSS 3.4+",
  "stateManagement": "Zustand 4.x",
  "routing": "React Router 6.x",
  "forms": "React Hook Form + Zod",
  "icons": "Lucide React"
}
```

### Parsing y Procesamiento de Datos
```json
{
  "csvParser": "papaparse 5.4+",
  "xlsxParser": "xlsx (SheetJS) 0.18+",
  "dateHandling": "date-fns 3.x",
  "dataValidation": "Zod 3.x"
}
```

### Visualización y Gráficos
```json
{
  "charts": "Recharts 2.x",
  "tables": "@tanstack/react-table 8.x",
  "virtualization": "@tanstack/react-virtual 3.x"
}
```

### Persistencia Local (MVP)
```json
{
  "indexedDB": "Dexie.js 4.x",
  "localStorage": "Para preferencias de usuario y cache"
}
```

### Testing
```json
{
  "unitTests": "Vitest 1.x",
  "componentTests": "React Testing Library",
  "e2eTests": "Playwright (Fase 2)"
}
```

### UI Components
```json
{
  "headlessUI": "Radix UI",
  "classManagement": "clsx + tailwind-merge",
  "notifications": "Sonner (solo toasts in-app)"
}
```

### IA (OPCIONAL)
```json
{
  "provider": "Groq (único proveedor)",
  "sdk": "Vercel AI SDK",
  "featureFlag": "VITE_ENABLE_AI",
  "apiKey": "VITE_GROQ_API_KEY",
  "notes": "Feature completamente opcional. La app funciona 100% sin IA."
}
```

---

## 💰 Restricciones de Capa Gratuita (CRÍTICO)

### Principio Fundamental
**TODOS los servicios externos deben tener capa gratuita suficiente para uso en producción con hasta 100 usuarios activos diarios.**

### Servicios GRATUITOS Aprobados

#### 1. Backend como Servicio (BaaS) - Fase 2
**✅ Supabase (Free Tier)**
- 500 MB base de datos PostgreSQL
- 1 GB almacenamiento de archivos
- 2 GB transferencia de datos/mes
- 50,000 usuarios activos mensuales (auth)
- 500,000 invocaciones de Edge Functions/mes
- **Suficiente para:** ~100 TAs con ~500 estudiantes cada uno

#### 2. Hosting y Deploy
**✅ Vercel (Hobby Plan - Gratuito)**
- Deploy ilimitado de proyectos personales
- 100 GB bandwidth/mes
- Serverless functions incluidas
- **Suficiente para:** Producción con tráfico moderado

#### 3. Inteligencia Artificial (OPCIONAL)
**✅ Groq (Free Tier - Sin tarjeta de crédito)**
- 30 requests/minuto
- 14,400 requests/día
- Modelos: Llama 3.1 70B, Mixtral 8x7B
- Registro: https://console.groq.com (solo email, sin tarjeta)
- **Suficiente para:** Uso ilimitado con 10 usuarios

**Nota:** La IA es completamente opcional. La app funciona 100% sin ella. Solo se activa si el usuario configura VITE_ENABLE_AI=true y VITE_GROQ_API_KEY.

#### 4. Monitoreo y Analytics - Fase 2
**✅ Sentry (Developer Plan - Gratuito)**
- 5,000 errores/mes
- 10,000 performance events/mes
- **Suficiente para:** Producción con tráfico moderado

**✅ PostHog (Free Tier)**
- 1,000,000 events/mes
- Product analytics, session recording
- **Suficiente para:** Uso intensivo

#### 5. Almacenamiento de Archivos - Fase 2
**✅ Cloudflare R2 (Free Tier)**
- 10 GB almacenamiento
- 10M Class A operations/mes
- 10M Class B operations/mes
- **Sin costos de egress** (esto es ENORME vs AWS S3)

#### 6. CI/CD
**✅ GitHub Actions (Free Tier)**
- 2,000 minutes/mes para repos privados
- Ilimitado para repos públicos
- **Suficiente para:** Desarrollo continuo

#### 7. Dominio y DNS
**✅ Cloudflare (Free Tier)**
- DNS gratuito ilimitado
- CDN gratuito
- SSL gratuito
- **Requiere:** Comprar dominio (~$10-15/año)

### Servicios NO APROBADOS

**❌ OpenAI API** - Requiere tarjeta de crédito
**❌ Anthropic Claude API** - Requiere tarjeta de crédito
**❌ Gemini API** - Créditos agotados para este usuario
**❌ AWS/GCP/Azure** - Free tier limitado a 12 meses
**❌ Servicios de email** - Fuera de alcance (Resend, Brevo, Mailgun)
**❌ Webhooks externos** - Fuera de alcance (Slack, Discord, Telegram)

### Estrategia de Costo Cero

#### Fase 1: MVP (100% Local) - ACTUAL
- Frontend: Vercel (gratis)
- Backend: IndexedDB en navegador (gratis)
- IA: Groq opcional (gratis)
- Notificaciones: Solo toasts in-app (gratis)
- **Costo total: $0**

#### Fase 2: Producción Básica
- Frontend: Vercel (gratis)
- Backend: Supabase free tier (gratis)
- IA: Groq free tier (gratis, opcional)
- Monitoreo: Sentry free tier (gratis)
- **Costo total: $0**

### Resumen de Costos

| Servicio | Free Tier | Suficiente para | Costo |
|----------|-----------|-----------------|-------|
| **Frontend** | Vercel Hobby | 100 GB bandwidth/mes | $0 |
| **Backend** | Supabase | 500MB DB, 50K MAU | $0 |
| **IA (Opcional)** | Groq | 14,400 req/día | $0 |
| **Storage** | Cloudflare R2 | 10 GB, sin egress | $0 |
| **Monitoring** | Sentry | 5K errores/mes | $0 |
| **Analytics** | PostHog | 1M events/mes | $0 |
| **CI/CD** | GitHub Actions | 2,000 min/mes | $0 |
| **DNS/CDN** | Cloudflare | Ilimitado | $0 |
| **TOTAL** | | | **$0/mes** |

**Nota:** IA es completamente opcional. La app funciona 100% sin ella.

---

## 🏗️ Arquitectura del Sistema

### Patrón de Diseño
**Feature-Sliced Design (FSD)** - Arquitectura basada en características/dominios

### Estructura de Directorios
```
src/
├── app/                          # Configuración global de la aplicación
│   ├── providers/                # Context providers (Theme, Query, etc.)
│   ├── routers/                  # Configuración de rutas
│   └── styles/                   # Estilos globales
│
├── pages/                        # Páginas de la aplicación
│   ├── dashboard/                # Dashboard principal
│   ├── students/                 # Gestión de estudiantes
│   ├── ingestion/                # Carga de archivos
│   ├── analytics/                # Análisis y reportes
│   └── settings/                 # Configuración
│
├── features/                     # Lógica de negocio por módulo
│   ├── students/                 # CRUD de estudiantes
│   │   ├── model/                # Estado (Zustand store)
│   │   ├── ui/                   # Componentes específicos
│   │   ├── api/                  # Llamadas a datos
│   │   └── lib/                  # Utilidades del feature
│   │
│   ├── ingestion/                # Ingesta de archivos
│   │   ├── model/
│   │   ├── ui/
│   │   ├── lib/                  # Parsers y validadores
│   │   └── config/               # Mapeo de columnas
│   │
│   ├── risk-engine/              # Motor de cálculo de riesgo
│   │   ├── model/
│   │   ├── lib/                  # Algoritmos de riesgo
│   │   └── types/
│   │
│   ├── analytics/                # Gráficos y métricas
│   │   ├── model/
│   │   ├── ui/                   # Componentes de gráficos
│   │   └── lib/                  # Cálculos estadísticos
│   │
│   ├── crm/                      # Notas y seguimientos in-app
│   │   ├── model/
│   │   ├── ui/
│   │   └── lib/
│   │
│   └── ai-assistant/             # OPCIONAL - Solo si VITE_ENABLE_AI=true
│       ├── model/
│       ├── ui/
│       ├── lib/
│       ├── config/
│       └── index.ts
│
├── entities/                     # Modelos de negocio
│   ├── student/                  # Entidad Student
│   ├── activity/                 # Entidad Activity
│   ├── attendance/               # Entidad Attendance
│   └── note/                     # Entidad Note
│
├── shared/                       # Recursos compartidos
│   ├── ui/                       # UI Kit (botones, inputs, etc.)
│   ├── api/                      # Configuración de API
│   ├── config/                   # Configuraciones globales (incluye feature-flags)
│   ├── lib/                      # Utilidades generales
│   ├── hooks/                    # Hooks reutilizables
│   └── types/                    # Tipos globales
│
└── widgets/                      # Componentes complejos compuestos
    ├── student-dashboard/        # Dashboard de estudiante individual
    ├── cohort-overview/          # Vista general de cohorte
    └── risk-alerts-panel/        # Panel de alertas de riesgo
```

### Feature Flags
- `VITE_ENABLE_AI`: Habilita/deshabilita feature de IA (default: false)
- `VITE_GROQ_API_KEY`: API key de Groq (obligatoria si VITE_ENABLE_AI=true)
- Si VITE_ENABLE_AI=false → no se carga el módulo ai-assistant
- Si VITE_GROQ_API_KEY no configurada → se muestra mensaje de configuración
- NO hay fallback a otros proveedores de IA

### Flujo de Datos
```
┌─────────────────┐
│  Upload Files   │
│  (CSV/XLSX)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Parser Layer   │
│  (PapaParse/    │
│   SheetJS)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Data Validator │
│  (Zod Schemas)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Data Normalizer│
│  (Limpieza y    │
│   Estandarizac.)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  IndexedDB      │
│  (Dexie.js)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Risk Engine    │
│  (Cálculos)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Zustand Store  │
│  (Estado UI)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React UI       │
│  (Components)   │
└─────────────────┘
```

---

## 🎨 Diseño UI/UX

### Filosofía de Diseño
- **Dark Mode First:** Diseñado para reducir fatiga visual en sesiones largas
- **Educación + Tecnología:** Paleta que evoca confianza, innovación y profesionalismo
- **Accesibilidad:** Contraste WCAG AA mínimo
- **Información Densa pero Clara:** Dashboards con alta densidad de datos sin saturar
- **Notificaciones in-app:** Solo toasts con Sonner (sin email/Slack/Discord/Telegram)

### Paleta de Colores (Tailwind Config)

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Fondos
        background: {
          DEFAULT: 'hsl(222, 47%, 5%)',      // slate-950
          card: 'hsl(222, 47%, 8%)',         // slate-900
          elevated: 'hsl(222, 47%, 11%)',    // slate-800
        },
        
        // Primario (Tech/Education)
        primary: {
          DEFAULT: 'hsl(239, 84%, 67%)',     // indigo-500
          light: 'hsl(192, 91%, 36%)',       // cyan-600
          gradient: 'linear-gradient(135deg, hsl(239, 84%, 67%) 0%, hsl(192, 91%, 36%) 100%)',
        },
        
        // Texto
        text: {
          primary: 'hsl(210, 40%, 96%)',     // slate-100
          secondary: 'hsl(215, 20%, 65%)',   // slate-400
          muted: 'hsl(215, 14%, 46%)',       // slate-500
        },
        
        // Semáforo de Alertas
        status: {
          positive: 'hsl(160, 84%, 39%)',    // emerald-500
          warning: 'hsl(43, 96%, 56%)',      // amber-400
          critical: 'hsl(350, 89%, 60%)',    // rose-500
          info: 'hsl(199, 89%, 48%)',        // sky-400
        },
        
        // Bordes
        border: {
          DEFAULT: 'hsl(215, 28%, 17%)',     // slate-800
          focus: 'hsl(239, 84%, 67%)',       // indigo-500
        },
      },
      
      // Tipografía
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      
      // Animaciones
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
}
```

### Componentes Base (UI Kit)

#### Botones
```typescript
// shared/ui/button.tsx
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

#### Badges de Estado
```typescript
// shared/ui/badge.tsx
type BadgeStatus = 'active' | 'dropout' | 'inactive' | 'risk-low' | 'risk-medium' | 'risk-high';

// Mapeo de colores
const statusColors: Record<BadgeStatus, string> = {
  'active': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'dropout': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  'inactive': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  'risk-low': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'risk-medium': 'bg-amber-400/20 text-amber-300 border-amber-400/30',
  'risk-high': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};
```

#### Tarjetas
```typescript
// shared/ui/card.tsx
interface CardProps {
  variant?: 'default' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}
```

### Iconografía
Usar **Lucide React** para consistencia y tamaño optimizado:
- Estudiantes: `Users`, `User`, `UserCheck`, `UserX`
- Archivos: `Upload`, `FileText`, `FileSpreadsheet`
- Gráficos: `BarChart3`, `LineChart`, `TrendingUp`, `TrendingDown`
- Alertas: `AlertCircle`, `AlertTriangle`, `CheckCircle2`, `XCircle`
- Acciones: `Edit`, `Trash2`, `Download`, `Filter`, `Search`

---

## 🗄️ Esquema de Base de Datos

### Modelo Entidad-Relación

```
┌─────────────────┐
│    Cohort       │
├─────────────────┤
│ id (PK)         │
│ name            │
│ start_date      │
│ end_date        │
│ syllabus_url    │
│ created_at      │
└────────┬────────┘
         │ 1:N
         │
         ▼
┌─────────────────┐         ┌──────────────────┐
│    Student      │         │    Syllabus      │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │         │ id (PK)          │
│ cohort_id (FK)  │         │ cohort_id (FK)   │
│ external_id     │◄────────│ module_number    │
│ full_name       │         │ module_name      │
│ email           │         │ start_date       │
│ status          │         │ end_date         │
│ enrollment_date │         │ expected_hours   │
│ tags[]          │         │ activities[]     │
│ created_at      │         │ created_at       │
│ updated_at      │         └──────────────────┘
└────────┬────────┘
         │
         │ 1:N
         │
         ├──────────────────────┬──────────────────────┐
         │                      │                      │
         ▼                      ▼                      ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   Attendance    │   │    Progress     │   │   Dedication    │
├─────────────────┤   ├─────────────────┤   ├─────────────────┤
│ id (PK)         │   │ id (PK)         │   │ id (PK)         │
│ student_id (FK) │   │ student_id (FK) │   │ student_id (FK) │
│ date            │   │ activity_name   │   │ date            │
│ status          │   │ completed       │   │ hours           │
│ notes           │   │ completion_date │   │ platform        │
│ uploaded_at     │   │ uploaded_at     │   │ uploaded_at     │
└─────────────────┘   └─────────────────┘   └─────────────────┘

         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│      Note       │
├─────────────────┤
│ id (PK)         │
│ student_id (FK) │
│ type            │
│ title           │
│ content         │
│ priority        │
│ due_date        │
│ is_completed    │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

### TypeScript Interfaces (Frontend)

```typescript
// entities/student/types.ts
export interface Student {
  id: string;
  cohortId: string;
  externalId: string;
  fullName: string;
  email?: string;
  status: 'active' | 'dropout' | 'inactive';
  enrollmentDate: string;
  tags: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  uploadedAt: string;
}

export interface ProgressRecord {
  id: string;
  studentId: string;
  activityName: string;
  moduleNumber?: number;
  completed: boolean;
  completionDate?: string;
  score?: number;
  uploadedAt: string;
}

export interface DedicationRecord {
  id: string;
  studentId: string;
  date: string;
  hours: number;
  platform: string;
  uploadedAt: string;
}

export interface SyllabusModule {
  id: string;
  cohortId: string;
  moduleNumber: number;
  moduleName: string;
  startDate: string;
  endDate: string;
  expectedHours: number;
  activities: string[];
  createdAt: string;
}

export interface Note {
  id: string;
  studentId: string;
  type: 'context' | 'action' | 'alert' | 'general';
  title: string;
  content?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskAssessment {
  studentId: string;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  completionRate: number; // 0-100
  attendanceRate: number; // 0-100
  totalHours: number;
  expectedHours: number;
  riskFactors: string[];
  calculatedAt: string;
}
```

---

## ⚙️ Motor de Riesgo (Risk Engine)

### Algoritmo de Cálculo de Riesgo

El motor de riesgo evalúa múltiples dimensiones del desempeño estudiantil y genera un **score de riesgo** (0-100) donde mayor valor indica mayor probabilidad de deserción/reprobación.

#### Fórmula Principal

```typescript
// features/risk-engine/lib/calculator.ts

interface RiskInput {
  student: Student;
  attendance: AttendanceRecord[];
  progress: ProgressRecord[];
  dedication: DedicationRecord[];
  syllabus: SyllabusModule[];
  referenceDate: Date;
}

interface RiskOutput {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  metrics: RiskMetrics;
  factors: RiskFactor[];
  recommendations: string[];
}

interface RiskMetrics {
  completionRate: number;      // % de horas completadas vs esperadas
  attendanceRate: number;      // % de asistencia
  activityCompletion: number;  // % de actividades completadas
  velocityTrend: 'improving' | 'stable' | 'declining';
  daysSinceLastActivity: number;
}

interface RiskFactor {
  category: 'hours' | 'attendance' | 'activities' | 'engagement';
  severity: 'low' | 'medium' | 'high';
  description: string;
  weight: number; // 0-1
}

export function calculateRisk(input: RiskInput): RiskOutput {
  const { attendance, progress, dedication, syllabus, referenceDate } = input;
  
  const factors: RiskFactor[] = [];
  let totalScore = 0;
  
  // 1. Calcular horas esperadas hasta la fecha de referencia
  const expectedHours = syllabus
    .filter(s => new Date(s.endDate) <= referenceDate)
    .reduce((sum, s) => sum + s.expectedHours, 0);
  
  // 2. Calcular horas reales dedicadas
  const actualHours = dedication
    .filter(d => new Date(d.date) <= referenceDate)
    .reduce((sum, d) => sum + d.hours, 0);
  
  // 3. Tasa de completitud de horas
  const completionRate = expectedHours > 0 
    ? (actualHours / expectedHours) * 100 
    : 100;
  
  if (completionRate < 50) {
    factors.push({
      category: 'hours',
      severity: 'high',
      description: `Progreso de horas muy bajo (${completionRate.toFixed(1)}%)`,
      weight: 0.4
    });
    totalScore += 40;
  } else if (completionRate < 75) {
    factors.push({
      category: 'hours',
      severity: 'medium',
      description: `Progreso de horas por debajo del esperado (${completionRate.toFixed(1)}%)`,
      weight: 0.2
    });
    totalScore += 20;
  }
  
  // 4. Tasa de asistencia
  const relevantAttendance = attendance.filter(a => new Date(a.date) <= referenceDate);
  const presentDays = relevantAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const totalDays = relevantAttendance.length;
  const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 100;
  
  if (attendanceRate < 70) {
    factors.push({
      category: 'attendance',
      severity: 'high',
      description: `Asistencia muy baja (${attendanceRate.toFixed(1)}%)`,
      weight: 0.3
    });
    totalScore += 30;
  } else if (attendanceRate < 85) {
    factors.push({
      category: 'attendance',
      severity: 'medium',
      description: `Asistencia irregular (${attendanceRate.toFixed(1)}%)`,
      weight: 0.15
    });
    totalScore += 15;
  }
  
  // 5. Completitud de actividades
  const totalActivities = syllabus.reduce((sum, s) => sum + s.activities.length, 0);
  const completedActivities = progress.filter(p => p.completed).length;
  const activityCompletion = totalActivities > 0 
    ? (completedActivities / totalActivities) * 100 
    : 100;
  
  if (activityCompletion < 50) {
    factors.push({
      category: 'activities',
      severity: 'high',
      description: `Baja completitud de actividades (${activityCompletion.toFixed(1)}%)`,
      weight: 0.3
    });
    totalScore += 30;
  } else if (activityCompletion < 75) {
    factors.push({
      category: 'activities',
      severity: 'medium',
      description: `Completitud de actividades mejorable (${activityCompletion.toFixed(1)}%)`,
      weight: 0.15
    });
    totalScore += 15;
  }
  
  // 6. Tendencia de velocidad (últimos 14 días vs anteriores 14 días)
  const last14Days = dedication.filter(d => {
    const daysDiff = (referenceDate.getTime() - new Date(d.date).getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 14;
  }).reduce((sum, d) => sum + d.hours, 0);
  
  const previous14Days = dedication.filter(d => {
    const daysDiff = (referenceDate.getTime() - new Date(d.date).getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff > 14 && daysDiff <= 28;
  }).reduce((sum, d) => sum + d.hours, 0);
  
  let velocityTrend: 'improving' | 'stable' | 'declining' = 'stable';
  if (last14Days < previous14Days * 0.7) {
    velocityTrend = 'declining';
    factors.push({
      category: 'engagement',
      severity: 'medium',
      description: 'Tendencia de dedicación decreciente',
      weight: 0.2
    });
    totalScore += 10;
  } else if (last14Days > previous14Days * 1.3) {
    velocityTrend = 'improving';
  }
  
  // 7. Días desde última actividad
  const lastActivityDate = dedication.length > 0 
    ? new Date(Math.max(...dedication.map(d => new Date(d.date).getTime())))
    : null;
  
  const daysSinceLastActivity = lastActivityDate 
    ? Math.floor((referenceDate.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  
  if (daysSinceLastActivity > 7) {
    factors.push({
      category: 'engagement',
      severity: 'high',
      description: `Sin actividad en los últimos ${daysSinceLastActivity} días`,
      weight: 0.4
    });
    totalScore += 20;
  }
  
  // 8. Determinar nivel de riesgo
  let riskLevel: 'low' | 'medium' | 'high';
  if (totalScore >= 70) {
    riskLevel = 'high';
  } else if (totalScore >= 40) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }
  
  // 9. Generar recomendaciones
  const recommendations = generateRecommendations(factors, riskLevel);
  
  return {
    riskScore: Math.min(totalScore, 100),
    riskLevel,
    metrics: {
      completionRate,
      attendanceRate,
      activityCompletion,
      velocityTrend,
      daysSinceLastActivity
    },
    factors,
    recommendations
  };
}

function generateRecommendations(factors: RiskFactor[], riskLevel: string): string[] {
  const recommendations: string[] = [];
  
  if (riskLevel === 'high') {
    recommendations.push('Contactar al estudiante de inmediato para evaluar situación');
  }
  
  const hasHoursIssue = factors.some(f => f.category === 'hours');
  if (hasHoursIssue) {
    recommendations.push('Revisar barreras de acceso a la plataforma');
    recommendations.push('Ofrecer sesión de mentoría personalizada');
  }
  
  const hasAttendanceIssue = factors.some(f => f.category === 'attendance');
  if (hasAttendanceIssue) {
    recommendations.push('Investigar causas de inasistencia');
    recommendations.push('Evaluar flexibilidad de horarios si aplica');
  }
  
  const hasEngagementIssue = factors.some(f => f.category === 'engagement');
  if (hasEngagementIssue) {
    recommendations.push('Verificar motivación y objetivos del estudiante');
    recommendations.push('Conectar con casos de éxito para inspiración');
  }
  
  return recommendations;
}
```

### Umbrales Configurables

```typescript
// features/risk-engine/config/thresholds.ts

export const RISK_THRESHOLDS = {
  // Horas dedicadas vs esperadas
  hours: {
    critical: 50,    // < 50% = riesgo alto
    warning: 75,     // < 75% = riesgo medio
  },
  
  // Tasa de asistencia
  attendance: {
    critical: 70,    // < 70% = riesgo alto
    warning: 85,     // < 85% = riesgo medio
  },
  
  // Completitud de actividades
  activities: {
    critical: 50,    // < 50% = riesgo alto
    warning: 75,     // < 75% = riesgo medio
  },
  
  // Días sin actividad
  inactivity: {
    critical: 7,     // > 7 días = riesgo alto
  },
  
  // Score total
  totalScore: {
    high: 70,        // >= 70 = riesgo alto
    medium: 40,      // >= 40 = riesgo medio
  }
};

// Pesos de cada factor en el cálculo final
export const FACTOR_WEIGHTS = {
  hours: 0.35,
  attendance: 0.25,
  activities: 0.25,
  engagement: 0.15
};
```

---

## 🚀 Mejoras Futuras (Fase 2) - CAPA GRATUITA

### 1. Migración a Backend como Servicio (BaaS)

**Stack:** Supabase Free Tier (PostgreSQL + Auth + Storage + Edge Functions)

**Límites Free Tier:**
- 500 MB base de datos
- 1 GB storage
- 2 GB transferencia/mes
- 50,000 MAU (usuarios activos mensuales)
- 500,000 Edge Function invocations/mes

**Beneficios:**
- Persistencia real de datos (no solo local)
- Autenticación de usuarios (múltiples TAs)
- Sincronización entre dispositivos
- Backup automático
- **Costo: $0/mes**

### 2. Inteligencia Artificial (OPCIONAL - Solo Groq)

**Stack:** Groq Free Tier (único proveedor)

**Límites Free Tier:**
- 30 requests/minuto
- 14,400 requests/día
- Sin tarjeta de crédito requerida
- **Costo: $0/mes**

**Beneficios:**
- Generación automática de correos personalizados
- Análisis de patrones de deserción
- Recomendaciones inteligentes
- **Costo: $0/mes** (dentro de límites gratuitos)

**Implementación:**
```typescript
// features/ai/lib/email-generator.ts
import { createOpenAI } from '@ai-sdk/openai';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
});

export async function generateFollowUpEmail(student: Student, riskFactors: string[]) {
  if (!import.meta.env.VITE_GROQ_API_KEY) {
    throw new Error('Groq API key not configured');
  }

  const { text } = await generateText({
    model: groq('llama-3.1-70b-versatile'),
    system: 'Eres un asistente educativo empático y profesional.',
    prompt: `
      Genera un correo de seguimiento para el estudiante:
      Nombre: ${student.fullName}
      Situación: ${riskFactors.join(', ')}
      
      El correo debe ser empático, ofrecer ayuda específica y mantener un tono profesional.
    `
  });
  
  return text;
}
```

**Nota:** Si no se configura VITE_GROQ_API_KEY, la feature de IA se deshabilita automáticamente y la app funciona normalmente sin ella.

### 3. Exportación de Reportes

**Stack:** @react-pdf/renderer (gratis) + jsPDF (gratis)

**Beneficios:**
- Reportes profesionales para directores académicos
- PDFs con gráficos embebidos
- Exportación masiva de datos
- **Costo: $0** (librerías open source)

### 4. Monitoreo y Analytics

**Stack:** Sentry Free Tier + PostHog Free Tier

**Límites Free Tier:**
- Sentry: 5,000 errores/mes, 10,000 performance events/mes
- PostHog: 1,000,000 events/mes
- **Costo: $0/mes**

### 5. Hosting y Deploy

**Stack:** Vercel Hobby Plan (gratis) + Cloudflare (DNS/CDN gratis)

**Límites Free Tier:**
- Vercel: 100 GB bandwidth/mes, deploy ilimitado
- Cloudflare: DNS ilimitado, CDN ilimitado
- **Costo: $0/mes**

### 6. Almacenamiento de Archivos

**Stack:** Cloudflare R2 Free Tier (10 GB, sin costos de egress)

**Límites Free Tier:**
- 10 GB almacenamiento
- 10M Class A operations/mes
- 10M Class B operations/mes
- **Sin costos de egress** (esto es ENORME vs AWS S3)
- **Costo: $0/mes**

---

## 🔧 Comandos y Configuración

### Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd edutrack-ta

# Instalar dependencias
npm install

# Variables de entorno
cp .env.example .env.local
# Editar .env.local con tus configuraciones

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview

# Testing
npm run test
npm run test:watch
npm run test:coverage

# Linting
npm run lint
npm run lint:fix

# Formateo
npm run format
```

### Variables de Entorno

```bash
# .env.example

# ============================================
# FEATURE FLAGS
# ============================================
VITE_ENABLE_AI=false  # Cambiar a true para habilitar IA

# ============================================
# IA (OPCIONAL - Solo si VITE_ENABLE_AI=true)
# ============================================
# Groq (Gratis, sin tarjeta - https://console.groq.com)
# Obtén tu API key en: https://console.groq.com
VITE_GROQ_API_KEY=

# ============================================
# SUPABASE (Fase 2 - Backend)
# ============================================
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# ============================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ============================================
VITE_APP_NAME=EduTrack TA
VITE_APP_VERSION=1.1.0
```

---

## 📝 Historial de Cambios

### v1.1.0 (2026-06-22)
- ❌ Eliminadas notificaciones externas (email, Slack, Discord, Telegram)
- ❌ Eliminado Gemini API (créditos agotados)
- ❌ Eliminados Hugging Face y Ollama (simplificación)
- ✅ IA simplificada a solo Groq (gratis, sin tarjeta)
- ✅ IA marcada como feature opcional (feature flag)
- ✅ Notificaciones limitadas a toasts in-app (Sonner)
- ✅ Simplificación general del stack

### v1.0.0 (2026-06-22)
- Versión inicial del proyecto
- Stack frontend completo (React + TS + Tailwind + Dexie)
- Arquitectura FSD
- Motor de riesgo
- Sistema CRM interno
- Paleta de colores dark mode

---
