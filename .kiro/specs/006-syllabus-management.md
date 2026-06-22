# Spec: Syllabus Management

## Overview
Módulo de gestión del cronograma esperado (syllabus) para EduTrack TA. Permite cargar el plan de estudios de una cohorte (módulos, fechas, horas esperadas y actividades), que sirve como línea base para el cálculo de métricas de progreso y el motor de riesgo. Soporta carga desde archivo o ingreso manual.

## Requirements

### Functional Requirements
- [ ] REQ-001: El sistema debe permitir definir un syllabus por cohorte con múltiples módulos
- [ ] REQ-002: Cada módulo del syllabus debe tener: número de módulo, nombre, fecha de inicio, fecha de fin, horas esperadas y lista de actividades
- [ ] REQ-003: El sistema debe permitir cargar el syllabus desde archivo CSV o XLSX
- [ ] REQ-004: El sistema debe permitir ingresar o editar el syllabus manualmente mediante formulario
- [ ] REQ-005: La restricción UNIQUE(cohortId, moduleNumber) debe aplicarse — no pueden existir dos módulos con el mismo número en la misma cohorte
- [ ] REQ-006: El sistema debe calcular automáticamente las horas esperadas acumuladas hasta cualquier fecha de referencia
- [ ] REQ-007: El sistema debe exponer una función `getExpectedHoursUntil(date, cohortId)` para que el motor de riesgo la consuma
- [ ] REQ-008: El sistema debe exponer una función `getExpectedActivities(cohortId)` que retorna todas las actividades esperadas de la cohorte
- [ ] REQ-009: El syllabus debe persistir en IndexedDB para soporte offline

### Non-Functional Requirements
- [ ] NFR-001: El formulario de módulos debe validar que endDate >= startDate
- [ ] NFR-002: El formulario debe validar que expectedHours > 0
- [ ] NFR-003: El módulo con fechas superpuestas debe emitir una advertencia (no error bloqueante)

## Acceptance Criteria

### Scenario: Cargar syllabus desde archivo CSV
**Given** el TA tiene un archivo `syllabus.csv` con columnas: module_number, module_name, start_date, end_date, expected_hours, activities
**When** lo carga en la sección de Syllabus
**Then** el sistema parsea y valida el archivo, crea los módulos en IndexedDB y muestra una vista de cronograma con las fechas de cada módulo

### Scenario: Calcular horas esperadas hasta fecha
**Given** el syllabus tiene 3 módulos: M1 (40h, termina 2026-05-31), M2 (30h, termina 2026-06-30), M3 (30h, termina 2026-07-31)
**When** el motor de riesgo llama a `getExpectedHoursUntil(new Date('2026-06-15'), cohortId)`
**Then** la función retorna 70 (M1 completo + M2 en progreso no se incluye porque no terminó aún... o se proratea según política definida)

### Scenario: Agregar módulo manualmente
**Given** el TA está en la sección de Syllabus y hay 3 módulos definidos
**When** hace clic en "Agregar Módulo", completa el formulario con módulo 4, nombre "Proyecto Final", y guarda
**Then** el nuevo módulo aparece en la lista de cronograma ordenado por número de módulo

### Scenario: Error por número de módulo duplicado
**Given** ya existe el módulo 2 en la cohorte
**When** el TA intenta crear otro módulo con el mismo número
**Then** el sistema muestra error "Ya existe un módulo 2 en esta cohorte" y no guarda el duplicado

### Scenario: Vista de cronograma con estado de avance
**Given** el syllabus tiene 4 módulos y estamos en la semana 6 del programa
**When** el TA abre la vista de syllabus
**Then** los módulos pasados aparecen con badge "Completado" (emerald), el módulo actual con "En curso" (amber) y los futuros con "Próximo" (slate)

## Technical Constraints
- Stack: Dexie.js, Zod para validación, date-fns para cálculo de fechas
- Patrones: Feature-Sliced Design — módulo de syllabus expone su API a través de `features/ingestion/` (para la carga) y `entities/syllabus/` (para los tipos y consultas)
- La función `getExpectedHoursUntil` debe ser determinística y testeable como función pura

## Dependencies
- Depende de: `001-student-management` (necesita cohortId)
- Bloquea a: `003-risk-engine` (necesita horas esperadas para cálculo), `004-analytics-dashboard` (necesita horas esperadas para el gráfico de línea)

## Data Models

```typescript
// entities/syllabus/types.ts
export interface SyllabusModule {
  id: string;
  cohortId: string;
  moduleNumber: number;
  moduleName: string;
  startDate: string;    // ISO 8601: YYYY-MM-DD
  endDate: string;      // ISO 8601: YYYY-MM-DD
  expectedHours: number;
  activities: string[]; // Lista de nombres de actividades esperadas
  createdAt: string;
}
```
