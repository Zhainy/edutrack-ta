# Spec: Analytics Dashboard

## Overview
Sistema de visualización de métricas y analítica para EduTrack TA. Incluye un dashboard general de cohorte con KPIs y gráficos de distribución, y un dashboard individual por estudiante con timeline de horas, calendario de asistencia y lista de actividades. Usa Recharts para gráficos y TanStack Table para tablas filtrables.

## Requirements

### Functional Requirements
- [ ] REQ-001: El dashboard general debe mostrar KPIs: total de estudiantes activos, % en riesgo alto, % en riesgo medio, total de desertores
- [ ] REQ-002: El dashboard general debe incluir gráfico de barras con distribución por nivel de riesgo (low/medium/high)
- [ ] REQ-003: El dashboard general debe incluir gráfico de línea mostrando promedio de horas de cohorte vs horas esperadas a lo largo del tiempo
- [ ] REQ-004: El dashboard general debe incluir gráfico de torta con distribución de estados (active/dropout/inactive)
- [ ] REQ-005: El dashboard individual debe mostrar perfil del estudiante con badge de riesgo, estado y tags
- [ ] REQ-006: El dashboard individual debe incluir gráfico de horas dedicadas vs esperadas como línea de tiempo
- [ ] REQ-007: El dashboard individual debe incluir un heatmap de asistencia (estilo GitHub contribution calendar)
- [ ] REQ-008: El dashboard individual debe listar actividades completadas vs pendientes con checkmarks y fechas
- [ ] REQ-009: La tabla de estudiantes debe soportar ordenamiento multi-columna, búsqueda global y filtros avanzados
- [ ] REQ-010: El sistema debe permitir exportar el reporte de cohorte a CSV
- [ ] REQ-011: Todos los gráficos deben ser responsive y adaptarse a diferentes tamaños de pantalla
- [ ] REQ-012: Los gráficos deben usar la paleta de colores del semáforo: emerald-500 (positivo), amber-400 (advertencia), rose-500 (crítico)

### Non-Functional Requirements
- [ ] NFR-001: Los gráficos deben renderizar en menos de 200ms para cohortes de hasta 100 estudiantes
- [ ] NFR-002: La tabla con virtualización debe manejar 500 filas sin degradar el scroll
- [ ] NFR-003: Los tooltips de gráficos deben ser accesibles con teclado (aria-describedby)
- [ ] NFR-004: Las visualizaciones deben tener alternativas textuales para screen readers

## Acceptance Criteria

### Scenario: Ver KPIs actualizados del dashboard general
**Given** una cohorte con 50 estudiantes (30 activos, 15 en riesgo alto, 5 desertores)
**When** el TA navega al dashboard general
**Then** los KPIs muestran: "30 activos", "50% en riesgo alto", "10% desertores" con sus colores del semáforo

### Scenario: Gráfico de horas actualizado tras nueva carga de datos
**Given** el TA cargó nuevos datos de dedicación
**When** regresa al dashboard
**Then** el gráfico de línea refleja los nuevos datos sin necesidad de recargar la página

### Scenario: Filtrar tabla por múltiples criterios
**Given** la tabla de estudiantes está visible con 50 registros
**When** el TA aplica filtro "Riesgo Alto" y "Estado: Activo"
**Then** la tabla muestra solo los estudiantes que cumplen ambos criterios y el contador indica cuántos hay

### Scenario: Dashboard individual muestra timeline de horas
**Given** el TA navega al perfil del estudiante "Juan García"
**When** ve la sección de gráficos
**Then** el gráfico de línea muestra semana a semana las horas dedicadas (línea cyan) vs las horas esperadas del syllabus (línea slate-500 punteada)

### Scenario: Exportar reporte de cohorte a CSV
**Given** el TA está en el dashboard general
**When** hace clic en "Exportar CSV"
**Then** se descarga un archivo con columnas: nombre, estado, riesgo, % horas, % asistencia, % actividades, score de riesgo

## Technical Constraints
- Stack: Recharts 2.x, TanStack Table 8.x, TanStack Virtual 3.x, date-fns 3.x
- Patrones: Feature-Sliced Design — `features/analytics/` con ui/ (componentes de gráficos), lib/ (cálculos estadísticos), model/ (Zustand store)
- Los gráficos deben usar los colores del semáforo: `emerald-500`, `amber-400`, `rose-500`, `sky-400`
- Paleta de fondos: `slate-950` (background), `slate-900` (cards), `slate-800` (elevated)

## Dependencies
- Depende de: `001-student-management` (lista de estudiantes), `002-file-ingestion` (datos de attendance/progress/dedication), `003-risk-engine` (riskScore y riskLevel por estudiante), `006-syllabus-management` (horas esperadas)
- Bloquea a: Ninguno en Fase 1

## Data Models

```typescript
// features/analytics/types.ts
export interface CohortStats {
  totalStudents: number;
  activeStudents: number;
  dropoutStudents: number;
  inactiveStudents: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  averageCompletionRate: number;
  averageAttendanceRate: number;
}

export interface WeeklyProgress {
  week: string;           // ISO week label
  actualHours: number;    // Promedio de horas del cohorte
  expectedHours: number;  // Horas esperadas del syllabus
}

export interface StudentTableRow {
  id: string;
  fullName: string;
  status: 'active' | 'dropout' | 'inactive';
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  completionRate: number;
  attendanceRate: number;
  activityCompletion: number;
  tags: string[];
  lastActivityDate?: string;
}

export interface AttendanceHeatmapData {
  date: string;      // YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | 'excused' | 'no-data';
}
```
