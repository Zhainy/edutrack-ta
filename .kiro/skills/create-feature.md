# Skill: create-feature

## Descripción
Genera la estructura completa de un feature siguiendo Feature-Sliced Design. Crea todos los subdirectorios y archivos boilerplate necesarios: model (Zustand store), ui (componente inicial), api (acceso a Dexie.js), lib (función pura), config (opcional) e index.ts (public API).

## Uso
```
/kiro skill:create-feature <nombre-del-feature>
```

## Argumentos
- `nombre-del-feature`: nombre en kebab-case del feature a crear (required). Ejemplos: `students`, `risk-engine`, `crm`

## Ejemplo
```
/kiro skill:create-feature notifications
```

## Output Esperado

Genera la siguiente estructura en `src/features/<nombre>/`:

```
src/features/notifications/
├── model/
│   └── notificationsStore.ts     # Zustand store con slice pattern
├── ui/
│   ├── NotificationsPanel.tsx    # Componente principal del feature
│   └── index.ts                  # Re-exports públicos de UI
├── api/
│   └── notificationsApi.ts       # Funciones async de acceso a Dexie.js
├── lib/
│   └── notificationsHelpers.ts   # Funciones puras sin side effects
└── index.ts                      # Public API del feature
```

### Contenido de cada archivo generado

**model/[nombre]Store.ts**
```typescript
import { create } from 'zustand';

interface NotificationsState {
  // TODO: definir estado
}

interface NotificationsActions {
  // TODO: definir acciones
}

export const useNotificationsStore = create<NotificationsState & NotificationsActions>()((set, get) => ({
  // TODO: implementar
}));
```

**ui/[NombreFeature].tsx**
```typescript
// 1. Imports
import type { FC } from 'react';

// 2. Types
interface NotificationsPanelProps {
  // TODO: definir props
}

// 3. Component
export const NotificationsPanel: FC<NotificationsPanelProps> = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      {/* TODO: implementar */}
    </div>
  );
};
```

**api/[nombre]Api.ts**
```typescript
import { db } from '@/shared/api/db';

// TODO: importar tipo de entidad correspondiente

/**
 * TODO: documentar función
 */
export async function getAll(): Promise<unknown[]> {
  // TODO: implementar query Dexie
  return [];
}
```

**index.ts**
```typescript
// Public API — solo exportar lo que otras capas necesitan
export { NotificationsPanel } from './ui/NotificationsPanel';
export { useNotificationsStore } from './model/notificationsStore';
// export type { ... } from './types';
```

## Validaciones
- [ ] El nombre del feature debe estar en kebab-case
- [ ] No debe existir ya un directorio con ese nombre en `src/features/`
- [ ] El store usa `useNombreStore` (camelCase con prefijo `use` y sufijo `Store`)
- [ ] El componente principal usa PascalCase
- [ ] Ningún archivo usa `any` en TypeScript
- [ ] El `index.ts` solo exporta lo necesario para capas superiores
- [ ] Los archivos de `lib/` no importan React ni Zustand
