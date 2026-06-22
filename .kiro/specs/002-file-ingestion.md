# Spec: File Ingestion

## Overview
Módulo de ingesta de archivos CSV y XLSX para EduTrack TA. Permite a los TAs cargar archivos de asistencia, progreso, dedicación y syllabus. Incluye parsing, validación con Zod, normalización de datos y persistencia en IndexedDB. Soporta mapeo dinámico de columnas para adaptarse a formatos variados de exportación.

## Requirements

### Functional Requirements
- [ ] REQ-001: El sistema debe aceptar archivos CSV (.csv) y XLSX (.xlsx, .xls) mediante drag & drop o selector de archivos
- [ ] REQ-002: El sistema debe validar el tipo de archivo (por extensión y MIME type) antes de procesar
- [ ] REQ-003: El sistema debe parsear archivos CSV usando PapaParse con detección automática de delimitadores
- [ ] REQ-004: El sistema debe parsear archivos XLSX usando SheetJS con soporte de múltiples hojas
- [ ] REQ-005: El sistema debe permitir mapeo dinámico de columnas del archivo a campos del modelo interno
- [ ] REQ-006: El sistema debe validar los datos parseados usando esquemas Zod antes de persistir
- [ ] REQ-007: El sistema debe normalizar datos: fechas a ISO 8601, nombres con trim/lowercase, emails a lowercase, horas a decimal con 2 dígitos
- [ ] REQ-008: El sistema debe realizar upsert (insertar o actualizar) en IndexedDB para evitar duplicados
- [ ] REQ-009: El sistema debe registrar un log de cada carga con nombre de archivo, tipo, tamaño, cantidad de registros y estado (success/partial/failed)
- [ ] REQ-010: El sistema debe mostrar un resumen post-carga: registros procesados, registros con errores, registros ignorados
- [ ] REQ-011: El sistema debe soportar rollback en caso de error crítico durante la transacción de guardado
- [ ] REQ-012: Los 4 tipos de archivo deben ser soportados: attendance (CSV), progress (CSV), dedication (XLSX), syllabus (XLSX/CSV)

### Non-Functional Requirements
- [ ] NFR-001: El parsing de archivos de hasta 5MB no debe bloquear el hilo principal (usar Web Workers si es necesario)
- [ ] NFR-002: El progreso de carga debe mostrarse en tiempo real (progress bar)
- [ ] NFR-003: Los errores deben mostrarse de forma comprensible con número de fila y columna afectada
- [ ] NFR-004: La interfaz de mapeo de columnas debe ser intuitiva con drag & drop o selectores

## Acceptance Criteria

### Scenario: Cargar archivo CSV de asistencia exitosamente
**Given** el TA tiene un archivo `asistencia.csv` con columnas: fecha, alumno_id, estado
**When** arrastra el archivo al área de upload y confirma el mapeo de columnas
**Then** el sistema parsea el archivo, valida los datos, los normaliza y los guarda en IndexedDB. Se muestra "X registros procesados correctamente" y se crea un uploadLog con status 'success'

### Scenario: Detectar y reportar filas con errores de formato
**Given** un archivo CSV con 100 filas donde 5 tienen fechas inválidas
**When** el TA inicia la carga
**Then** el sistema procesa las 95 filas válidas, reporta las 5 filas con errores indicando número de fila y descripción del error, el uploadLog queda con status 'partial'

### Scenario: Mapeo dinámico de columnas
**Given** un archivo CSV donde la columna de nombre de alumno se llama "nombre_completo" en lugar de "full_name"
**When** el sistema detecta que no puede mapear automáticamente
**Then** muestra interfaz de mapeo donde el TA puede seleccionar qué columna del archivo corresponde a cada campo requerido

### Scenario: Rechazo de tipo de archivo inválido
**Given** el TA intenta subir un archivo `.pdf`
**When** lo arrastra al área de upload
**Then** el sistema rechaza el archivo inmediatamente mostrando "Formato no soportado. Use CSV o XLSX"

### Scenario: Upsert evita duplicados de asistencia
**Given** ya existen registros de asistencia para la fecha 2026-06-15
**When** el TA carga un archivo con registros para la misma fecha
**Then** el sistema actualiza los registros existentes en lugar de duplicarlos, respetando la restricción UNIQUE(studentId, date)

## Technical Constraints
- Stack: PapaParse 5.4+, xlsx (SheetJS) 0.18+, date-fns 3.x, Zod 3.x, Dexie.js 4.x
- Patrones: Feature-Sliced Design — `features/ingestion/` con subdirectorios model/, ui/, lib/, config/
- `features/ingestion/config/` contiene el mapeo de columnas por tipo de archivo
- `features/ingestion/lib/` contiene los parsers y validadores como funciones puras testeables

## Dependencies
- Depende de: `001-student-management` (necesita cohortId y studentId para asociar registros)
- Bloquea a: `003-risk-engine` (necesita datos de attendance/progress/dedication), `004-analytics-dashboard` (necesita datos cargados)

## Data Models

```typescript
// entities/attendance/types.ts
export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // ISO 8601: YYYY-MM-DD
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
  completionDate?: string;
  score?: number;
  uploadedAt: string;
}

// entities/dedication/types.ts
export interface DedicationRecord {
  id: string;
  studentId: string;
  date: string; // ISO 8601: YYYY-MM-DD
  hours: number; // decimal con 2 dígitos
  platform: string;
  uploadedAt: string;
}

// features/ingestion/types.ts
export interface UploadLog {
  id: string;
  cohortId: string;
  fileName: string;
  fileType: 'attendance' | 'progress' | 'dedication' | 'syllabus';
  fileSize: number;
  recordsCount: number;
  status: 'success' | 'partial' | 'failed';
  errorMessage?: string;
  uploadedBy?: string;
  uploadedAt: string;
}

export interface ColumnMapping {
  sourceColumn: string;   // Nombre de columna en el archivo
  targetField: string;    // Campo del modelo interno
  required: boolean;
  transform?: (value: string) => unknown;
}
```
