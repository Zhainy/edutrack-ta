# Tech Stack Steering

## Stack Obligatorio

### Core
- React 18.3+ con TypeScript 5.4+ strict mode
- Vite 5.x como build tool
- Tailwind CSS 3.4+ (NO CSS-in-JS, NO CSS modules)
- Zustand 4.x para estado global (NO Redux, NO MobX)
- React Router 6.x para navegación

### Formularios y Validación
- React Hook Form para formularios
- Zod 3.x para validación de schemas (frontend y parsing de datos)

### Parsing y Procesamiento de Datos
- papaparse 5.4+ para archivos CSV
- xlsx (SheetJS) 0.18+ para archivos XLSX
- date-fns 3.x para manipulación de fechas (NO moment.js, NO dayjs)

### Visualización
- Recharts 2.x para gráficos (barras, líneas, torta)
- @tanstack/react-table 8.x para tablas filtrables y ordenables
- @tanstack/react-virtual 3.x para virtualización de listas largas

### Persistencia Local (Fase 1 - MVP)
- Dexie.js 4.x para IndexedDB (almacenamiento principal offline-first)
- localStorage para preferencias de usuario (tema, última cohorte seleccionada)

### UI Components
- Radix UI para componentes headless (Dialog, Select, Dropdown, Tooltip, etc.)
- clsx + tailwind-merge para manejo de clases condicionales
- Sonner para notificaciones toast
- Lucide React para iconos (ÚNICO paquete de iconos permitido)

### Testing
- Vitest 1.x como test runner (NO Jest)
- React Testing Library para tests de componentes
- Cobertura mínima: 70% global, 90% para features/risk-engine/
- Playwright para e2e (Fase 2)

## PROHIBIDO — No usar bajo ninguna circunstancia
- ❌ `any` en TypeScript — usar tipos explícitos o `unknown` con type guards
- ❌ CSS modules (`.module.css`)
- ❌ CSS-in-JS (styled-components, emotion, etc.)
- ❌ Redux, Redux Toolkit, MobX, Jotai, Recoil
- ❌ moment.js o dayjs — usar date-fns
- ❌ Material UI, Ant Design, Chakra UI, shadcn/ui
- ❌ axios — usar fetch nativo con wrappers tipados
- ❌ class-based React components — solo functional components con hooks
- ❌ Inline styles (`style={{}}`) salvo casos de valores dinámicos imposibles con Tailwind
- ❌ Servicios de email externos (Resend, Brevo, Mailgun)
- ❌ Webhooks de Slack/Discord/Telegram
- ❌ Gemini API (no disponible)
- ❌ Hugging Face, Ollama (simplificación)
- ❌ IA obligatoria (debe ser opcional)
- ❌ Múltiples proveedores de IA (solo Groq)

## Versiones de Node y Package Manager
- Node.js 20.x LTS o superior
- npm como package manager (no yarn, no pnpm salvo decisión explícita del equipo)

## IA (OPCIONAL - Feature Flag)
- **Solo Groq** (gratis, sin tarjeta de crédito)
- Registro: https://console.groq.com
- SDK: Vercel AI SDK
- Feature flag: `VITE_ENABLE_AI=true/false`
- API key: `VITE_GROQ_API_KEY`
- Si `VITE_ENABLE_AI=false` → feature completamente deshabilitada
- Si `VITE_GROQ_API_KEY` no configurada → mensaje "Configure Groq API key"
- **NO hay fallback** a otros proveedores
- Rate limits: 30 RPM, 14,400 RPD

## Fase 2 (Futuro — No implementar en MVP)
- Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- Vercel AI SDK + Groq para generación de correos personalizados (ya opcional en MVP)
- @react-pdf/renderer para exportación a PDF
