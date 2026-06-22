# Spec: AI Assistant (OPCIONAL - Solo Groq)

## Status
⚠️ FEATURE OPCIONAL - Solo se implementa si:
- `VITE_ENABLE_AI=true`
- `VITE_GROQ_API_KEY` configurada

## Overview
Asistente de IA para generar correos de seguimiento personalizados usando **únicamente Groq**.
Esta feature es completamente opcional y no afecta el funcionamiento core de la app.

## Requirements

### Functional Requirements
- [ ] REQ-001: Feature debe poder deshabilitarse completamente con `VITE_ENABLE_AI=false`
- [ ] REQ-002: Si no hay `VITE_GROQ_API_KEY`, mostrar mensaje "Configure Groq API key en Settings"
- [ ] REQ-003: Usar **exclusivamente** Groq como proveedor (NO hay fallback)
- [ ] REQ-004: Manejar rate limits de Groq (30 RPM, 14,400 RPD)
- [ ] REQ-005: Si Groq falla o excede rate limit, mostrar error amigable
- [ ] REQ-006: Cache de respuestas en localStorage para reducir requests
- [ ] REQ-007: Timeout de 10 segundos máximo para requests
- [ ] REQ-008: Link a https://console.groq.com en mensaje de configuración

### Non-Functional Requirements
- [ ] NFR-001: No bloquear la app si Groq falla
- [ ] NFR-002: No hacer la app dependiente de IA
- [ ] NFR-003: Feature completamente aislada (no afecta otras features)
- [ ] NFR-004: Costo $0 (usar solo free tier de Groq)
- [ ] NFR-005: Lazy loading del módulo ai-assistant

## Acceptance Criteria

### Scenario: Feature deshabilitada
**Given** `VITE_ENABLE_AI=false`
**When** usuario navega a la app
**Then** no se muestra ningún componente de IA
**And** la app funciona normalmente

### Scenario: Feature habilitada pero sin API key
**Given** `VITE_ENABLE_AI=true` pero `VITE_GROQ_API_KEY` no configurada
**When** usuario intenta usar IA
**Then** se muestra mensaje "Configure su Groq API key en Settings"
**And** se proporciona link a https://console.groq.com

### Scenario: Groq disponible y funcionando
**Given** `VITE_ENABLE_AI=true` y `VITE_GROQ_API_KEY` configurada
**When** usuario solicita generación de correo
**Then** se usa Groq exclusivamente
**And** se muestra el resultado generado

### Scenario: Groq excede rate limit
**Given** Se excedió el límite de 30 RPM o 14,400 RPD
**When** usuario solicita generación de correo
**Then** se muestra error "Límite de Groq alcanzado. Intente en unos minutos."
**And** NO se intenta con otros proveedores

### Scenario: Groq falla
**Given** Groq no responde o da error
**When** usuario solicita generación de correo
**Then** se muestra error amigable "No se pudo generar el correo. Intente nuevamente."
**And** NO se intenta con otros proveedores

## Technical Constraints
- Stack: Vercel AI SDK + Groq API
- Feature flag: `VITE_ENABLE_AI`
- API key: `VITE_GROQ_API_KEY`
- Rate limits: 30 RPM, 14,400 RPD
- Timeout: 10 segundos
- Cache: localStorage

## Dependencies
- Depende de: `shared/config/feature-flags`, `001-student-management` (datos del estudiante), `005-crm-notes` (notas existentes)
- Bloquea a: ninguna (feature independiente)

## Data Models

```typescript
// features/ai-assistant/types.ts
export interface AIGenerationRequest {
  student: Student;
  riskFactors: string[];
  notes: Note[];
}

export interface AIGenerationResponse {
  email: string;
  provider: 'groq';
  cached: boolean;
  generatedAt: string;
}
```
