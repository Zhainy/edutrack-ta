# EduTrack TA - Sistema de Seguimiento Estudiantil

Sistema de analítica educativa para Teacher Assistants que transforma datos crudos de asistencia, progreso y dedicación en información accionable para prevenir la deserción estudiantil.

## Requisitos

- Node.js 20.x LTS o superior
- npm 10.x o superior

## Instalación

```bash
npm install
```

## Variables de entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.example .env.local
```

Variables disponibles:

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `VITE_ENABLE_AI` | Habilita el asistente de IA (Groq) | No (default: false) |
| `VITE_GROQ_API_KEY` | API key de Groq (https://console.groq.com) | Solo si VITE_ENABLE_AI=true |

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run typecheck` | Verificación de tipos TypeScript |
| `npm run lint` | Verificación ESLint |
| `npm run lint:fix` | Corrección automática ESLint |
| `npm run format` | Formateo con Prettier |
| `npm run test` | Tests con Vitest |
| `npm run test:coverage` | Tests con cobertura |

## Documentación

Ver [AGENT.MD](./AGENT.MD) para la documentación completa del proyecto.

## Stack

- **Frontend:** React 18 + TypeScript 5 (strict mode)
- **Build:** Vite 5
- **Estilos:** Tailwind CSS 3 (dark mode first)
- **Estado:** Zustand 4
- **Persistencia:** Dexie.js 4 (IndexedDB, offline-first)
- **IA (opcional):** Groq — solo si se configura VITE_ENABLE_AI=true
