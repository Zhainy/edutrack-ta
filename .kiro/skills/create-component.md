# Skill: create-component

## Descripción
Genera un componente React completo con TypeScript, props tipadas con interface named, estructura estándar de imports, archivo de test con React Testing Library y casos básicos de renderizado.

## Uso
```
/kiro skill:create-component <NombreComponente> [--in <capa/segmento>]
```

## Argumentos
- `NombreComponente`: nombre en PascalCase del componente a crear (required)
- `--in`: ruta relativa a `src/` donde crear el componente (optional). Por defecto: `shared/ui/`

## Ejemplos
```
/kiro skill:create-component RiskBadge
/kiro skill:create-component StudentCard --in features/students/ui
/kiro skill:create-component CohortSelector --in shared/ui
```

## Output Esperado

Para `/kiro skill:create-component RiskBadge`:

```
src/shared/ui/
├── RiskBadge.tsx           # Componente principal
└── RiskBadge.test.tsx      # Tests con Vitest + React Testing Library
```

### Contenido generado

**RiskBadge.tsx**
```typescript
// 1. Imports
import type { FC } from 'react';
import { cn } from '@/shared/lib/cn';

// 2. Types
type RiskBadgeVariant = 'low' | 'medium' | 'high';

interface RiskBadgeProps {
  variant: RiskBadgeVariant;
  label?: string;
  className?: string;
}

// 3. Constants
const variantStyles: Record<RiskBadgeVariant, string> = {
  low:    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  medium: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
  high:   'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

const variantLabels: Record<RiskBadgeVariant, string> = {
  low:    'Bajo',
  medium: 'Medio',
  high:   'Alto',
};

// 4. Component
export const RiskBadge: FC<RiskBadgeProps> = ({ variant, label, className }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className
      )}
      aria-label={`Riesgo ${variantLabels[variant]}`}
    >
      {label ?? variantLabels[variant]}
    </span>
  );
};
```

**RiskBadge.test.tsx**
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RiskBadge } from './RiskBadge';

describe('RiskBadge', () => {
  it('renders with low variant', () => {
    render(<RiskBadge variant="low" />);
    expect(screen.getByText('Bajo')).toBeInTheDocument();
  });

  it('renders with high variant', () => {
    render(<RiskBadge variant="high" />);
    expect(screen.getByText('Alto')).toBeInTheDocument();
  });

  it('renders custom label', () => {
    render(<RiskBadge variant="medium" label="En observación" />);
    expect(screen.getByText('En observación')).toBeInTheDocument();
  });

  it('has correct aria-label for accessibility', () => {
    render(<RiskBadge variant="high" />);
    expect(screen.getByRole('generic', { name: 'Riesgo Alto' })).toBeInTheDocument();
  });
});
```

## Validaciones
- [ ] El nombre del componente está en PascalCase
- [ ] La interface de props está named (no inline type)
- [ ] No se usa `any` en ningún tipo
- [ ] El componente tiene `aria-label` u otros atributos ARIA si es interactivo
- [ ] El archivo de test cubre al menos: render básico, variantes principales, accesibilidad
- [ ] Se usa Tailwind CSS únicamente (no inline styles ni CSS modules)
- [ ] Los colores siguen la paleta del semáforo si el componente muestra estados
