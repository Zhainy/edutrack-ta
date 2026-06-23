
# AGENT.MD - EduTrack TA v2.5.0

## 📋 Metadata
- **Proyecto:** EduTrack TA (Teacher Assistant Tracking System)
- **Versión:** 2.5.0
- **Fecha:** 2026-06-23
- **Stack:** React 18 + TypeScript + Tailwind + Dexie (IndexedDB) + Zustand
- **Arquitectura:** Feature-Sliced Design (FSD)
- **Costo:** $0 (capa gratuita, sin tarjeta de crédito)
- **IA:** Opcional (Groq free tier, sin fallback)
- **Notificaciones:** Solo in-app (Sonner toasts + campana con notas pendientes)
- **Cohorte activa:** RTD-24-01-06-0021-4 (DESARROLLO DE APLICACIONES FRONT-END TRAINEE V2.0)
- **Estudiantes:** 27 (25 activos, 2 desertores, 2 reemplazos)
- **Duración:** 14/5/2026 - 18/8/2026 (438 horas, 9 módulos, 66 clases)

---

## 🎯 Problema que resuelve
Herramienta para Teacher Assistants de SENCE que:
- Carga datos reales de plataforma SENCE (dedication, progress, cronograma, asistencia)
- Calcula riesgo de deserción/reprobación en tiempo real
- Permite seguimiento CRM (notas, alertas, comentarios de asistencia)
- Visualiza métricas por cohorte/curso con analítica avanzada
- Registra asistencia de forma interactiva (editor con click)
- Muestra evaluaciones de módulo con promedio y colores

---

## 🗂️ Estructura REAL de Archivos SENCE

### 1. Archivo Principal: `RTD-24-01-06-0021-4.xlsx`
Contiene **5 hojas**:

#### Hoja "Lista" (Estudiantes)
- Fila 0: Código curso + nombre
- Fila 1: Headers (Rut | Nombre | Contacto | Correo | Teléfono | Observaciones)
- Filas 2+: 27 estudiantes
- Campos especiales en Observaciones: "DESERTOR 25/05", "REEMPLAZO 29/05", "SUBSIDIO DE CUIDADO", "Ingreso 18/05"

#### Hoja "Notas" (Evaluaciones de Módulo)
- Columna A: Nombre estudiante
- Columnas B-I: Módulo 1 a Módulo 8 (notas: 7, 6.3, 5.6, PENDIENTE, -)
- Headers tienen comentarios con fechas de envío ("Enviadas 22/05")

#### Hojas "Mayo", "Junio", "Julio", "Agosto" (Asistencia)
- Fila 0: Headers con días del mes (4, 5, 6, 7, 8, 11, 12...)
- Columna A: número fila
- Columna B: nombre estudiante
- Columnas C+: estados (P/A/X) con comentarios threaded
- Última fila: conteo de asistentes

**Estados:** P (Presente), A (Ausente), X (Justificado/Reemplazo)

### 2. Dedication: `RTD-24-01-06-0021-4_dedication.xlsx`
- Filas 0-1: Metadata (Desde/Hasta/Tiempo transcurrido)
- Fila 2: Headers (Nombre | Apellido(s) | Grupo | Minutos | Texto | Conexiones/día)
- Filas 3+: 36 estudiantes (incluye algunos que NO están en la lista oficial)
- **Conversión:** minutos / 60 = horas

### 3. Progress: `progress.rtd-24-01-06-0021-4.csv`
- **Encoding:** UTF-16LE con BOM (¡CRÍTICO!)
- Col 0: Nombre estudiante
- Col 1: Email
- Col 2+: Pares [estado, fecha] por actividad
- Estados: "Finalizado (ha alcanzado...)", "Finalizado (no ha alcanzado...)", "Finalizado", "No finalizado"
- Fechas en español: "jueves, 14 de mayo de 2026, 19:43"
- ~214 actividades por estudiante

### 4. Cronograma: `CRONOGRAMA FRONT-END RTD-24-01-06-0021-4.xlsx`
- Filas 0-9: Metadata (CURSO, CÓDIGO, HORAS=438, REGIÓN, INICIO=14/5/2026, TÉRMINO=18/8/2026, HORARIO=19:00-23:00, RELATOR=Juan Pablo Duran)
- Filas 13-21: Resumen M1-M9 con horas sincrónicas/asincrónicas
- Filas 27+: 66 clases con aprendizajes esperados, fechas, horas

**9 Módulos:**
- M1: ORIENTACIÓN (18h) - 14-18 Mayo
- M2: FUNDAMENTOS FRONT-END (72h) - 18 Mayo - 3 Junio
- M3: INTERFAZ USUARIO WEB (56h) - 3-15 Junio
- M4: JAVASCRIPT BÁSICO (60h) - 16-26 Junio
- M5: JAVASCRIPT AVANZADO (48h) - 29 Junio - 8 Julio
- M6: VUE BÁSICO (72h) - 8-24 Julio
- M7: VUE AVANZADO (76h) - 27 Julio - 11 Agosto
- M8: PORTAFOLIO (18h) - 11-14 Agosto
- M9: EMPLEABILIDAD (18h) - 14-18 Agosto

---

##  Pipeline de Ingestión

```
Archivo → detectContentType() → Parser específico → 
  ├─ SENCE (dedication/progress/syllabus) → bulkUpsert directo (SIN Zod)
  └─ Estándar (students/attendance) → Zod validation → normalize → bulkUpsert
```

**CRÍTICO:** Los parsers SENCE retornan entidades tipadas. NO pasar por Zod/normalize.

**Después de ingestión:** Se ejecuta `matchAllRecords()` para vincular dedication/progress/attendance/notes con estudiantes por nombre/email.

---

## 🎨 UI/UX

### Paleta (dark mode por defecto)
- Fondos: slate-950, slate-900, slate-800
- Primario: indigo-500 → cyan-600 (gradiente)
- Semáforo: emerald-500 (positivo), amber-400 (riesgo), rose-500 (crítico), sky-400 (info)
- Texto: slate-100, slate-400, slate-500

### Encoding
- UTF-8 para UI
- UTF-16LE auto-detectado para CSV de SENCE
- NUNCA mostrar raw bytes o null bytes

### Timezone
- **CRÍTICO:** Usar `new Date(2026, 4, 14)` (constructor local) en vez de `new Date('2026-05-14')` (UTC)
- Chile es UTC-3/-4, usar `getFullYear/getMonth/getDate` para fechas locales
- Funciones helper: `toLocalDateStr()`, `parseLocalDate()`

---

## 📊 Estado Actual del Proyecto

### ✅ Completamente Funcional (100% del MVP)
- Scaffolding completo (~145 archivos)
- Dashboard con KPIs y gráficos reales
- Tabla de estudiantes con filtros, búsqueda, orden alfabético A-Z
- Tabla de estudiantes con **tabla virtualizada** (scroll vertical + cabecera fija)
- **Filtros avanzados** (estado, nivel de riesgo, rango asistencia, rango horas)
- **Selección múltiple** + **eliminación masiva** de estudiantes
- **Columnas con ancho fijo** y `table-layout: fixed` + `text-overflow: ellipsis`
- Vista de detalle con **7 tabs** (Resumen, Asistencia, Progreso, Dedicación, Pendientes, Notas, **Evaluaciones**)
- Motor de riesgo (calculateRisk) con datos reales
- Ingestión completa de 5 tipos de archivos SENCE
- Matching automático entre archivos
- CRM completo con timeline, filtros, NoteCard, NoteForm
- Selector de estado del estudiante (Activo/Desertor/Inactivo/Reemplazo)
- Editor de estado inline en tabla (compacto: h-6, rounded-lg)
- Multi-cohort con selector de curso
- Feature flags para IA
- Notas de módulo cargadas en DB (52 registros)
- Asistencia con comentarios extraídos
- **Editor interactivo de asistencia:**
  - Genera todas las fechas del cronograma (14 Mayo - 18 Agosto, Lun-Vie)
  - Excluye feriados chilenos
  - Click en celda cicla estados: - → P → A → T → J → -
  - Guardado optimista a IndexedDB
  - Modal de comentarios por celda
  - Selector de mes y leyenda de colores
  - Stats como promedios por alumno (no conteo total)
  - Filtra solo días hasta hoy (no muestra días futuros)
- **Tab "Evaluaciones":**
  - Muestra notas de módulo (M1-M8) con colores
  - Verde: ≥6, Amarillo: 5-5.9, Rojo: <5, Gris: PENDIENTE
  - KPIs: Promedio general, Módulos evaluados, Estado
  - Fechas de envío de notas
- **Analítica avanzada:**
  - 6 KPIs de cohorte (Total, Activos, Desertores, Asistencia, Horas, Riesgo)
  - Gráfico de distribución de riesgo (donut)
  - Gráfico de evolución de asistencia semanal (línea con meta 80%)
  - Tabla de Top Performers (5 mejores)
  - Tabla de Estudiantes en Riesgo (5 con mayor riesgo)
- **Campana de notificaciones:**
  - Muestra notas pendientes/urgentes del CRM
  - Badge con contador
  - Click abre lista de notas
  - Link a detalle del estudiante
- **Página de Configuración** (/settings) con 5 tabs:
  - Perfil del TA (localStorage con zustand persist)
  - Gestión de cohortes (CRUD completo con eliminación en cascada)
  - Umbrales de riesgo editables (horas, asistencia, actividades, inactividad, score)
  - Preferencias (formato fecha, idioma)
  - Acerca de (créditos: Nicole Fernández, GitHub/LinkedIn/Portfolio)
- **Exportar reportes** (botón en header):
  - CSV (Blob BOM + download) para asistencia, progreso, riesgo
  - PDF (window.print con window.open) sin dependencias
- **Eliminar estudiantes**:
  - Modal de confirmación con lista detallada de datos a eliminar en cascada
  - Incluye moduleGrades en cascada
  - Eliminación masiva con `bulkDeleteStudents`

### ✅ Bugs Resueltos
- Encoding UTF-16LE en progress
- Error bloqueante en ingestion (ahora procesa archivos independientes)
- Caja duplicada de students eliminada
- Botones de asistencia acortados
- Módulos ordenados por moduleNumber
- Actividades pendientes usan progress como fuente de verdad
- Keys duplicadas en ProgresoTab corregidas
- CohortId mismatch entre syllabus y students
- Timezone UTC → local (fechas correctas en Chile)
- Active students count incluye status 'replacement'
- Risk score display format (X/100)
- Columnas de tabla sin ancho fijo (texto desbordado)
- Risk column redundante (Badge + barra + score)
- Status selector muy alto (reducido a h-6, rounded-lg)
- Alineación vertical del status selector (align-baseline → items-end)
- `deleteStudent` no eliminaba `moduleGrades` (cascada incompleta)
- Falta función `bulkDeleteStudents` para eliminación masiva

---

## 🏗️ Estructura de Carpetas (FSD)

```
src/
├── app/ (providers, routers, styles)
├── pages/ (dashboard, students, ingestion, analytics, crm, attendance, settings)
├── widgets/ (layout: sidebar, header, main-layout)
├── features/
│   ├── students/ (CRUD, tabla, detalle, status-selector, matcher, evaluaciones-tab, advanced-filters, delete-student-modal)
│   ├── ingestion/ (parsers SENCE, upload, store, validate-ai-config)
│   ├── risk-engine/ (calculateRisk, thresholds)
│   ├── analytics/ (gráficos, KPIs, cohort-kpis, risk-distribution, weekly-attendance, student-comparison)
│   ├── crm/ (notas, seguimiento, note-card, note-form, note-timeline)
│   ├── attendance/ (grid visual, generate-dates, attendance-api, edit-modal)
│   ├── settings/ (profile-store, settings-store, settings-api)
│   ├── export/ (csv-export, pdf-export, export-button)
│   └── ai-assistant/ (OPCIONAL, Groq)
├── entities/ (student, attendance, progress, dedication, syllabus, note, cohort, upload-log, module-grade)
└── shared/ (ui, lib, hooks, config, mocks, date)
```

---

## 🔑 Variables de Entorno

Ver `.env.example` para lista completa.

**Importante:**
- NUNCA commitear `.env.local` con valores reales
- Las API keys se obtienen de los proveedores oficiales
- Groq: https://console.groq.com (gratis, sin tarjeta)

---

##  Comandos

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # TypeScript check
npm run lint         # ESLint
npm run build        # Production build
```

---

## 📝 Historial

### v2.5.0 — 🗑️ Eliminación de Estudiantes + UX (2026-06-23)
- Modal de confirmación para eliminar estudiante con lista de datos en cascada
- `deleteStudent` incluye `moduleGrades` en cascada
- `bulkDeleteStudents` para eliminación masiva
- Checkbox de selección en tabla + barra de acciones bulk
- Tabla virtualizada con `@tanstack/react-virtual` (cabecera fija + scroll body)
- `AdvancedFilters` dropdown (estado, riesgo, asistencia, horas)
- Columnas con ancho fijo (`table-layout: fixed` + `text-overflow: ellipsis`)
- Risk column simplificada (solo barra + score, sin Badge redundante)
- Status selector compacto (h-6, rounded-lg, items-end alignment)
- Fix: alineación vertical del status selector en detalle del estudiante
- `updateStudentStatus` toast + onChange callback
- Align-baseline eliminado, contenedor padre usa `sm:items-end`

### v2.4.0 — 📤 Exportación de Reportes (2026-06-23)
- Exportar CSV con BOM (asistencia, progreso, riesgo)
- Exportar PDF vía `window.print` + `window.open`
- Botón de exportar en header con menú
- APP_VERSION bump a 2.2.0 en constants.ts
- Reporte con filtro por tipo, fecha y formato

### v2.3.0 — ⚙️ Página de Configuración (2026-06-23)
- 5 tabs Radix UI: Perfil, Cohortes, Riesgo, Preferencias, Acerca de
- Profile store con zustand persist (name, email, role, institution)
- Cohort CRUD (crear/editar/eliminar con limpieza en cascada)
- Umbrales de riesgo editables (defaults desde `thresholds.ts`)
- Preferencias (formato fecha, idioma) con auto-guardado
- Acerca de con créditos y enlaces (Nicole Fernández)
- Multi-cohort selector conectado con settings
- Fixes en settings-store, profile-store y settings-api

### v2.2.0 (2026-06-23)
- Tab "Evaluaciones" en detalle del estudiante con notas de módulo
- Analítica avanzada con 6 KPIs y gráficos
- Gráfico de distribución de riesgo (donut)
- Gráfico de evolución de asistencia semanal
- Tablas de Top Performers y Estudiantes en Riesgo
- Campana de notificaciones conectada con CRM
- Fix active students count (incluye 'replacement')
- Fix risk score display format (X/100)

### v2.1.0 (2026-06-23)
- Editor interactivo de asistencia (click para ciclar estados)
- Fix timezone local (fechas correctas en Chile UTC-3/-4)
- Stats como promedios por alumno (no conteo total)
- Filtra días hasta hoy (no muestra futuros)
- Modal de comentarios por celda
- Selector de mes en asistencia
- Selector de estado del estudiante (4 estados)
- Editor de estado inline en tabla
- CRM completo (timeline, filtros, formularios)
- Notas de módulo cargadas desde hoja "Notas"
- Parser de asistencia multi-hoja con comentarios threaded
- Parser de cronograma con 9 módulos reales
- Matching automático post-ingestión

### v2.0.0 (2026-06-22)
- Fix estructura REAL de archivos SENCE
- Dedication: slice(3), Progress: UTF-16LE, Syllabus: rows 28+
- Pipeline diferenciado: SENCE skip Zod/normalize
- detectContentType() por nombre de archivo

### v1.1.0 (2026-06-22)
- Eliminadas notificaciones externas
- IA solo Groq (opcional)
- Multi-cohort support

### v1.0.0 (2026-06-22)
- Scaffolding inicial

---