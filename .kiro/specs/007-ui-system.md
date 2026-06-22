# Spec: UI System

## Overview
Sistema de diseño y componentes base (UI Kit) para EduTrack TA. Define el token de diseño (colores, tipografía, animaciones) y los componentes primitivos reutilizables en `shared/ui/`. Todos los componentes son dark-mode first, accesibles (WCAG AA), y usan exclusivamente Tailwind CSS con Radix UI como base headless.

## Requirements

### Functional Requirements
- [ ] REQ-001: El sistema debe proveer componente `Button` con variantes: primary, secondary, ghost, danger; y tamaños: sm, md, lg
- [ ] REQ-002: El sistema debe proveer componente `Badge` mapeado al semáforo de alertas (active, dropout, inactive, risk-low, risk-medium, risk-high)
- [ ] REQ-003: El sistema debe proveer componente `Card` con variantes: default, elevated, bordered; y propiedad hoverable
- [ ] REQ-004: El sistema debe proveer componentes de formulario: `Input`, `Select`, `Textarea` con estados de error, disabled y focus
- [ ] REQ-005: El sistema debe proveer componente `Modal` (con Radix UI Dialog) con overlay y manejo de foco
- [ ] REQ-006: El sistema debe proveer componente `Drawer` (con Radix UI Sheet) para paneles laterales
- [ ] REQ-007: El sistema debe proveer sistema de notificaciones toast con Sonner integrado
- [ ] REQ-008: La paleta de colores completa debe estar configurada en `tailwind.config.js`
- [ ] REQ-009: El dark mode debe estar activo por defecto a nivel de `<html class="dark">` sin toggle de modo claro
- [ ] REQ-010: Todos los componentes deben exportar sus tipos TypeScript desde `shared/ui/index.ts`
- [ ] REQ-011: Los iconos deben usar exclusivamente Lucide React con tamaño por defecto 20px y strokeWidth 1.5

### Non-Functional Requirements
- [ ] NFR-001: Todos los componentes deben cumplir ratio de contraste WCAG AA (mínimo 4.5:1 para texto normal)
- [ ] NFR-002: Los componentes interactivos deben ser navegables por teclado con indicadores de foco visibles
- [ ] NFR-003: Los componentes deben tener cobertura de tests >= 70% con React Testing Library
- [ ] NFR-004: Cada componente debe tener atributos ARIA apropiados (role, aria-label, aria-describedby según corresponda)

## Acceptance Criteria

### Scenario: Button con estado de carga
**Given** un formulario de upload de archivos
**When** el usuario hace clic en el botón de submit y hay procesamiento en curso
**Then** el botón muestra un spinner (Lucide `Loader2` con animación spin), se deshabilita para prevenir doble submit y mantiene su width original

### Scenario: Badge de riesgo alto
**Given** un componente muestra el riesgo de un estudiante
**When** el riskLevel es 'high'
**Then** el Badge muestra texto "ALTO" con `bg-rose-500/20 text-rose-300 border-rose-500/30`

### Scenario: Input con error de validación
**Given** el usuario envió un formulario con el campo email vacío
**When** la validación Zod retorna el error
**Then** el Input muestra borde en rose-500, texto de error debajo en rose-400 y aria-invalid="true"

### Scenario: Modal con trampa de foco
**Given** un Modal está abierto para confirmar eliminación de un estudiante
**When** el usuario presiona Tab repetidamente
**Then** el foco cicla solo entre los elementos interactivos dentro del Modal (Radix Dialog maneja esto automáticamente)

### Scenario: Toast de éxito tras cargar archivo
**Given** el TA cargó exitosamente un archivo de asistencia
**When** el proceso termina
**Then** Sonner muestra un toast verde con el mensaje "Asistencia cargada: 45 registros procesados" que desaparece automáticamente a los 4 segundos

## Technical Constraints
- Stack: Tailwind CSS 3.4+, Radix UI (Dialog, Select, Dropdown, Tooltip), Sonner, Lucide React, clsx + tailwind-merge
- Patrones: Todos los componentes en `shared/ui/` — sin CSS modules, sin CSS-in-JS, sin inline styles
- Los tokens de diseño se definen en `tailwind.config.js` con el objeto `theme.extend.colors`

## Dependencies
- Depende de: Ninguno (es la capa base)
- Bloquea a: Todos los features que usan componentes UI (`001`, `002`, `003`, `004`, `005`, `006`)

## Data Models

```typescript
// shared/ui/button.tsx
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// shared/ui/badge.tsx
type BadgeStatus = 'active' | 'dropout' | 'inactive' | 'risk-low' | 'risk-medium' | 'risk-high';

export const statusColors: Record<BadgeStatus, string> = {
  'active':      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'dropout':     'bg-rose-500/20 text-rose-300 border-rose-500/30',
  'inactive':    'bg-slate-500/20 text-slate-300 border-slate-500/30',
  'risk-low':    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'risk-medium': 'bg-amber-400/20 text-amber-300 border-amber-400/30',
  'risk-high':   'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

// shared/ui/card.tsx
export interface CardProps {
  variant?: 'default' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

// Paleta Tailwind (tailwind.config.js)
// background.DEFAULT: hsl(222, 47%, 5%)   — slate-950
// background.card:    hsl(222, 47%, 8%)   — slate-900
// background.elevated: hsl(222, 47%, 11%) — slate-800
// primary.DEFAULT:    hsl(239, 84%, 67%)  — indigo-500
// status.positive:    hsl(160, 84%, 39%)  — emerald-500
// status.warning:     hsl(43, 96%, 56%)   — amber-400
// status.critical:    hsl(350, 89%, 60%)  — rose-500
// status.info:        hsl(199, 89%, 48%)  — sky-400
```
