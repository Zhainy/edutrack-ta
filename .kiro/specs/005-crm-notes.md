# Spec: CRM Notes

## Overview
Sistema de CRM educativo para EduTrack TA. Permite registrar notas contextuales, acciones pendientes y alertas por estudiante. Incluye prioridades, fechas de vencimiento, sistema de tags y un timeline de actividad. Funciona como bitácora de seguimiento personalizado que complementa las métricas cuantitativas con contexto cualitativo.

## Requirements

### Functional Requirements
- [ ] REQ-001: El sistema debe permitir crear notas por estudiante con 4 tipos: 'context' (información contextual), 'action' (tarea pendiente), 'alert' (alerta), 'general'
- [ ] REQ-002: El sistema debe soportar 4 niveles de prioridad por nota: 'low', 'medium', 'high', 'urgent'
- [ ] REQ-003: Las notas tipo 'action' deben poder tener fecha de vencimiento (dueDate)
- [ ] REQ-004: Las notas tipo 'action' deben poder marcarse como completadas con timestamp de completado
- [ ] REQ-005: El sistema debe mostrar un panel de tareas pendientes con las notas tipo 'action' no completadas
- [ ] REQ-006: Las notas 'urgent' y vencidas deben tener indicadores visuales de alerta prominentes
- [ ] REQ-007: El sistema debe permitir gestionar tags contextuales predefinidos: "Enfermo", "PC no disponible", "Trabajando", "Problema personal"
- [ ] REQ-008: El sistema debe permitir crear tags personalizados adicionales
- [ ] REQ-009: El sistema debe mostrar un timeline cronológico de notas por estudiante
- [ ] REQ-010: El sistema debe permitir editar y eliminar notas existentes
- [ ] REQ-011: El formulario de notas debe usar React Hook Form con validación Zod
- [ ] REQ-012: Los borradores de notas deben autoguardarse en localStorage para evitar pérdida de datos

### Non-Functional Requirements
- [ ] NFR-001: El formulario de notas debe mostrar errores de validación inline sin perder el contenido escrito
- [ ] NFR-002: Las notas urgentes deben destacar visualmente con border-rose-500 y badge de prioridad
- [ ] NFR-003: La lista de notas debe soportar paginación o virtualización para estudiantes con más de 50 notas
- [ ] NFR-004: Las operaciones CRUD de notas deben persistir en IndexedDB

## Acceptance Criteria

### Scenario: Crear nota de acción con fecha de vencimiento
**Given** el TA está en el perfil de un estudiante
**When** hace clic en "Agregar Nota", selecciona tipo "action", prioridad "high", escribe "Llamar al estudiante", y selecciona fecha de vencimiento 2026-06-25
**Then** la nota aparece en el timeline del estudiante y en el panel de tareas pendientes con el badge "HIGH" en amber-400

### Scenario: Marcar tarea como completada
**Given** existe una nota tipo 'action' no completada en el panel de tareas
**When** el TA hace clic en el checkbox de la nota
**Then** la nota se marca como completada, se registra el `completedAt`, desaparece del panel de tareas pendientes y queda visible en el timeline con tachado

### Scenario: Alerta visual por tarea vencida
**Given** una nota tipo 'action' tiene dueDate = 2026-06-20 y hoy es 2026-06-21
**When** el TA ve el panel de tareas
**Then** la nota muestra un indicador rojo "VENCIDA" y está posicionada al tope de la lista

### Scenario: Asignar tag predefinido al estudiante
**Given** el TA está en el perfil de un estudiante
**When** agrega el tag "PC no disponible"
**Then** el tag aparece en el perfil del estudiante, en la tabla de listado y persiste al recargar la app

### Scenario: Autoguardado de borrador
**Given** el TA está escribiendo una nota de 200 caracteres
**When** navega accidentalmente a otra sección sin guardar
**Then** al regresar al formulario de notas del mismo estudiante, el borrador está disponible con opción "Recuperar borrador"

### Scenario: Filtrar tareas por fecha de vencimiento
**Given** hay 10 tareas pendientes con diferentes fechas
**When** el TA selecciona filtro "Vencen esta semana"
**Then** solo aparecen las tareas cuya dueDate cae dentro de los próximos 7 días

## Technical Constraints
- Stack: React Hook Form, Zod, Dexie.js, Zustand, Sonner (notificaciones toast)
- Patrones: Feature-Sliced Design — `features/crm/` con model/, ui/, lib/
- Los tags predefinidos se definen en `features/crm/config/predefined-tags.ts`
- Usar Radix UI para el Date Picker del formulario

## Dependencies
- Depende de: `001-student-management` (necesita studentId para asociar notas)
- Bloquea a: `004-analytics-dashboard` (el dashboard individual muestra el historial de notas del timeline)

## Data Models

```typescript
// entities/note/types.ts
export interface Note {
  id: string;
  studentId: string;
  type: 'context' | 'action' | 'alert' | 'general';
  title: string;
  content?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;       // ISO 8601: YYYY-MM-DD
  isCompleted: boolean;
  completedAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// features/crm/config/predefined-tags.ts
export const PREDEFINED_TAGS = [
  'Enfermo',
  'PC no disponible',
  'Trabajando',
  'Problema personal',
  'Sin internet',
  'Viaje',
] as const;

export type PredefinedTag = typeof PREDEFINED_TAGS[number];
```
