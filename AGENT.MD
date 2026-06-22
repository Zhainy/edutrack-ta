# AGENT.MD - EduTrack TA v2.0

## 📋 Metadata
- **Proyecto:** EduTrack TA (Teacher Assistant Tracking System)
- **Versión:** 2.0.0
- **Stack:** React 18 + TypeScript + Tailwind + Dexie (IndexedDB) + Zustand
- **Arquitectura:** Feature-Sliced Design (FSD)
- **Costo:** $0 (capa gratuita, sin tarjeta de crédito)
- **IA:** Opcional (Groq free tier, sin fallback)
- **Notificaciones:** Solo in-app (Sonner toasts)

---

## 🎯 Problema que resuelve
Herramienta para Teacher Assistants de SENCE que:
- Carga datos reales de plataforma SENCE (dedication, progress, cronograma)
- Calcula riesgo de deserción/reprobación
- Permite seguimiento CRM (notas, alertas)
- Visualiza métricas por cohorte/curso

---

## 🗂️ Estructura REAL de Archivos SENCE

### 1. Dedication (XLSX) - `*_dedication.xlsx`
```
Row 0: Metadata ("Dedicación al curso")
Row 1: Empty
Row 2: Headers (Nombre | Apellido(s) | Grupo | Dedicación al curso (minutos) | Dedicación al curso | Conexiones por día)
Row 3+: Datos de estudiantes
```
- **Parser:** `features/ingestion/lib/xlsx-parser.ts` → `parseDedicationXLSX()`
- **Slice:** `rawData.slice(3)` (NO 8 como asumíamos antes)
- **Conversión:** minutos / 60 = horas
- **Match:** Por nombre completo (fuzzy match contra estudiantes)

### 2. Progress (CSV) - `progress.*.csv`
```
Encoding: UTF-16LE con BOM (¡CRÍTICO!)
Col 0: Nombre estudiante (SIN header)
Col 1: Email
Col 2+: Pares [status, date] por actividad
```
- **Parser:** `features/ingestion/lib/csv-parser.ts` → `parseProgressCSV()`
- **Header:** `false` (no hay headers)
- **Encoding:** Auto-detect UTF-16LE BOM
- **Status:** "Finalizado (ha alcanzado...)", "Finalizado (no ha alcanzado...)", "Finalizado", "No finalizado", ""
- **Fechas:** Español "jueves, 14 de mayo de 2026, 19:43"

### 3. Cronograma/Syllabus (XLSX) - `CRONOGRAMA*.xlsx`
```
Rows 1-9: Metadata (CURSO, CÓDIGO, HORAS, REGIÓN, INICIO, TÉRMINO, HORARIO, RELATOR)
Rows 13-21: Resumen M1-M9 (horas sync/async)
Row 27: Headers (NOMBRE DEL MODULO | APRENDIZAJES | DIA | CANTIDAD SINCRONICAS | HORAS ASINCRONICAS | FECHA | horario)
Row 28+: Datos de clases (66 clases totales)
```
- **Parser:** `features/ingestion/lib/syllabus-parser.ts` → `parseSyllabusXLSX()`
- **9 módulos, 438 horas totales**
- **Match:** Por código de curso (ej: RTD-24-01-06-0021-4)

### 4. Students (CSV/XLSX) - Lista de alumnos
- Headers: RUT, Nombre, Email, Teléfono (o variaciones)
- **Parser:** `features/ingestion/lib/student-parser.ts`

### 5. Attendance (CSV/XLSX) - Asistencia
- Formato: Fecha | Estudiante | Estado (Presente/Ausente)

---

## 🔄 Pipeline de Ingestión (REAL)

```
Archivo → detectContentType() → Parser específico → 
  ├─ SENCE (dedication/progress/syllabus) → bulkUpsert directo (SIN Zod/normalize)
  └─ Estándar (students/attendance) → Zod validation → normalize → bulkUpsert
```

**CRÍTICO:** Los parsers SENCE ya retornan entidades tipadas. NO pasar por Zod/normalize (causa errores de tipo `hours: string` vs `hours: number`).

---

## 🎨 UI/UX

### Paleta (dark mode por defecto)
- Fondos: slate-950, slate-900, slate-800
- Primario: indigo-500 → cyan-600 (gradiente)
- Semáforo: emerald-500 (positivo), amber-400 (riesgo), rose-500 (crítico), sky-400 (info)
- Texto: slate-100, slate-400, slate-500

### Encoding
- **UTF-8** para toda la UI
- **UTF-16LE** detectado automáticamente para CSV de SENCE
- **NUNCA** mostrar raw bytes o null bytes en UI

---

##  Bugs Conocidos (Prioridad)

### P0 - Críticos
1. **Encoding UTF-16LE**: Progress CSV viene con BOM, tildes se ven mal
2. **Error bloqueante**: Si un archivo falla, no procesa los demás ni permite eliminar el fallido
3. **Caja duplicada**: Zona "Nómina de alumnos" aparece 2 veces en /ingestion

### P1 - Importantes
4. **Botones asistencia**: Texto muy largo ("Marcar todos presentes hoy"), se ven aglutinados
5. **Eliminar estudiantes**: No hay forma de borrar estudiantes de prueba
6. **Syllabus tipo**: Acepta .csv pero debe ser .xlsx

### P2 - Mejoras
7. **Fuzzy match**: Nombres en dedication no siempre matchean exacto con students
8. **Preview antes de cargar**: Mostrar datos antes de hacer bulkUpsert

---

##  Estructura de Carpetas (FSD)

```
src/
├── app/ (providers, routers, styles)
├── pages/ (dashboard, students, ingestion, analytics, crm, attendance, settings)
├── widgets/ (layout: sidebar, header, main-layout)
── features/
│   ├── students/ (CRUD, tabla, detalle)
│   ├── ingestion/ (parsers, upload, store)
│   ├── risk-engine/ (calculateRisk, thresholds)
│   ├── analytics/ (gráficos, KPIs)
│   ├── crm/ (notas, seguimiento)
│   ├── attendance/ (grid visual con círculos)
│   └── ai-assistant/ (OPCIONAL, Groq)
├── entities/ (student, attendance, progress, dedication, syllabus, note, cohort, upload-log)
└── shared/ (ui, lib, hooks, config, mocks)
```

---

## 🔑 Variables de Entorno

```bash
# Feature Flags
VITE_ENABLE_AI=false

# IA (OPCIONAL - Solo Groq, gratis sin tarjeta)
VITE_GROQ_API_KEY=

# Supabase (Fase 2)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## 📊 Estado Actual del Proyecto

### ✅ Funcional
- Scaffolding completo (~80 archivos)
- Dashboard con KPIs y gráficos
- Tabla de estudiantes con filtros
- Vista de detalle del estudiante
- Motor de riesgo (calculateRisk)
- Carga de students (nómina) funciona
- Sistema de notas (CRM)
- Módulo de asistencia visual (círculos)
- Multi-cohort (selector de curso)

### 🐛 Pendiente
- Fix encoding UTF-16LE en progress
- Fix error bloqueante en ingestion
- Eliminar caja duplicada de students
- Acortar botones de asistencia
- Agregar botón eliminar estudiante
- Fix parsers dedication/syllabus

---

## 🚀 Comandos

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # TypeScript check
npm run lint         # ESLint
npm run build        # Production build
```

---

## 📝 Historial

### v2.0.0 (2026-06-22)
- Fix estructura REAL de archivos SENCE
- Dedication: slice(3) no slice(8)
- Progress: UTF-16LE, col 0=nombre, col 1=email
- Syllabus: rows 28+, 9 módulos, 66 clases
- Pipeline diferenciado: SENCE skip Zod/normalize
- detectContentType() por nombre de archivo

### v1.1.0 (2026-06-22)
- Eliminadas notificaciones externas
- IA solo Groq (opcional)
- Multi-cohort support

### v1.0.0 (2026-06-22)
- Scaffolding inicial

