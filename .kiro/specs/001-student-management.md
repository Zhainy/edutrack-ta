# Spec: Student Management

## Overview
Módulo central de gestión de estudiantes del sistema EduTrack TA. Permite crear, visualizar, actualizar y gestionar el ciclo de vida de los estudiantes dentro de una cohorte, incluyendo su estado (active/dropout/inactive), tags contextuales y metadatos asociados.

## Requirements

### Functional Requirements
- [ ] REQ-001: El sistema debe permitir listar todos los estudiantes de una cohorte con sus métricas de riesgo calculadas
- [ ] REQ-002: El sistema debe permitir visualizar el perfil completo de un estudiante individual
- [ ] REQ-003: El sistema debe permitir cambiar el estado de un estudiante (active → dropout → inactive)
- [ ] REQ-004: El sistema debe permitir asignar y gestionar tags contextuales por estudiante (ej: "Enfermo", "PC no disponible", "Trabajando")
- [ ] REQ-005: El sistema debe permitir búsqueda por nombre, email o externalId
- [ ] REQ-006: El sistema debe permitir filtrar estudiantes por estado, nivel de riesgo y tags
- [ ] REQ-007: El sistema debe permitir ordenar la tabla por cualquier columna de métricas
- [ ] REQ-008: El sistema debe mantener unicidad de externalId por cohorte
- [ ] REQ-009: Los datos deben persistir en IndexedDB (Dexie.js) para soporte offline

### Non-Functional Requirements
- [ ] NFR-001: La tabla de estudiantes debe renderizar hasta 500 filas sin degradación de rendimiento (TanStack Virtual)
- [ ] NFR-002: La búsqueda debe responder en menos de 100ms con debounce de 300ms
- [ ] NFR-003: Todos los componentes deben cumplir WCAG AA de contraste
- [ ] NFR-004: El módulo debe funcionar completamente offline (offline-first)

## Acceptance Criteria

### Scenario: Visualizar lista de estudiantes con métricas
**Given** el TA tiene una cohorte activa con estudiantes cargados
**When** navega a la página de estudiantes (`/students`)
**Then** ve una tabla con columnas: Nombre, Estado, Riesgo (badge), % Horas, % Asistencia, % Actividades, Tags, Acciones

### Scenario: Filtrar por nivel de riesgo alto
**Given** la tabla de estudiantes está visible
**When** el TA selecciona el filtro "Riesgo Alto"
**Then** solo se muestran estudiantes con `riskLevel === 'high'` y el contador del filtro se actualiza

### Scenario: Cambiar estado de estudiante a desertor
**Given** el TA está en el perfil de un estudiante activo
**When** selecciona "Marcar como Desertor" y confirma el diálogo
**Then** el estado del estudiante cambia a `dropout`, se actualiza en IndexedDB y se muestra el badge correspondiente en color rose-500

### Scenario: Asignar tag contextual
**Given** el TA está en el perfil de un estudiante
**When** agrega el tag "PC no disponible"
**Then** el tag aparece visible en el perfil y en la tabla de listado, y persiste al recargar la aplicación

### Scenario: Búsqueda por nombre
**Given** la tabla de estudiantes tiene más de 10 registros
**When** el TA escribe "García" en el campo de búsqueda
**Then** la tabla filtra en tiempo real mostrando solo estudiantes cuyo nombre contiene "García" (case-insensitive)

## Technical Constraints
- Stack: React 18.3+ con TypeScript strict mode, Zustand 4.x, Dexie.js 4.x, TanStack Table 8.x, TanStack Virtual 3.x
- Patrones: Feature-Sliced Design — `features/students/` con subdirectorios model/, ui/, api/, lib/
- NO usar `any` en TypeScript
- Tailwind CSS únicamente para estilos (sin CSS-in-JS)

## Dependencies
- Depende de: `006-syllabus-management` (para métricas de cohorte), `003-risk-engine` (para cálculo de riesgo)
- Bloquea a: `004-analytics-dashboard` (necesita lista de estudiantes), `005-crm-notes` (necesita studentId)

## Data Models

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

export interface Cohort {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  syllabusUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```
