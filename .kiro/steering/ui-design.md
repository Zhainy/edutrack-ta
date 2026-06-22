# UI Design Steering

## Filosofía
- **Dark mode FIRST** — no es un toggle, es el único modo. `<html class="dark">` fijo en `index.html`
- **Educación + Tecnología** — paleta de azules profundos con acentos cyan/indigo que evoca confianza y profesionalismo
- **Densidad de información alta pero legible** — dashboards compactos sin saturar visualmente
- **Accesibilidad WCAG AA obligatoria** — contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande

## Paleta de Colores (Tailwind Config)

### Fondos (backgrounds)
| Token | Clase Tailwind | HSL | Uso |
|-------|---------------|-----|-----|
| `background.DEFAULT` | `bg-slate-950` | hsl(222, 47%, 5%) | Fondo principal de la app |
| `background.card` | `bg-slate-900` | hsl(222, 47%, 8%) | Cards y paneles |
| `background.elevated` | `bg-slate-800` | hsl(222, 47%, 11%) | Elementos elevados, dropdowns |

### Primario
| Token | Clase Tailwind | HSL | Uso |
|-------|---------------|-----|-----|
| `primary.DEFAULT` | `text-indigo-500` | hsl(239, 84%, 67%) | CTAs, links, focus rings |
| `primary.light` | `text-cyan-600` | hsl(192, 91%, 36%) | Gradiente de acento |

Gradiente para botones primary y headers: `bg-gradient-to-r from-indigo-500 to-cyan-400`

### Semáforo de Alertas (CRÍTICO — usar siempre para estados)
| Estado | Color | Clase Tailwind | HSL | Cuándo usar |
|--------|-------|---------------|-----|-------------|
| 🟢 Positivo / En ritmo | emerald | `text-emerald-500` | hsl(160, 84%, 39%) | Riesgo bajo, activo, completado |
| 🟡 Riesgo / Atención | amber | `text-amber-400` | hsl(43, 96%, 56%) | Riesgo medio, advertencia |
| 🔴 Crítico / Deserción | rose | `text-rose-500` | hsl(350, 89%, 60%) | Riesgo alto, desertor, error |
| 🔵 Informativo / Contexto | sky | `text-sky-400` | hsl(199, 89%, 48%) | Info, neutral, en curso |

**Regla de badges con transparencia:**
```
bg-emerald-500/20 text-emerald-300 border border-emerald-500/30  ← positivo
bg-amber-400/20  text-amber-300  border border-amber-400/30   ← warning
bg-rose-500/20   text-rose-300   border border-rose-500/30    ← crítico
bg-sky-400/20    text-sky-300    border border-sky-400/30     ← info
```

### Texto
| Token | Clase Tailwind | Uso |
|-------|---------------|-----|
| `text.primary` | `text-slate-100` | Texto principal, headings |
| `text.secondary` | `text-slate-400` | Texto secundario, labels |
| `text.muted` | `text-slate-500` | Placeholders, metadata |

### Bordes
| Token | Clase Tailwind | Uso |
|-------|---------------|-----|
| `border.DEFAULT` | `border-slate-800` | Bordes de cards y separadores |
| `border.focus` | `ring-indigo-500` | Focus ring de inputs |

## Tipografía

```css
font-family: 'Inter', system-ui, sans-serif;        /* texto general */
font-family: 'JetBrains Mono', monospace;           /* datos numéricos, IDs, código */
```

- Headings: `text-slate-100 font-semibold`
- Body: `text-slate-300 font-normal`
- Datos numéricos (scores, horas, %): `font-mono text-slate-100`
- Labels de formulario: `text-slate-400 text-sm font-medium`

## Componentes Base (shared/ui/)

### Button
```
primary:   bg-gradient-to-r from-indigo-500 to-cyan-500, text-white
secondary: bg-slate-800 border border-slate-700, text-slate-100
ghost:     bg-transparent hover:bg-slate-800, text-slate-300
danger:    bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20, text-rose-400
```
Tamaños: `sm` (h-8 px-3 text-sm), `md` (h-10 px-4 text-sm), `lg` (h-12 px-6 text-base)

### Card
```
default:  bg-slate-900 border border-slate-800 rounded-xl
elevated: bg-slate-800 border border-slate-700 rounded-xl shadow-lg
bordered: bg-transparent border border-slate-700 rounded-xl
hoverable: + hover:border-slate-600 hover:bg-slate-800/50 transition-colors
```

### Input / Select / Textarea
```
bg-slate-800/50 border border-slate-700
focus: border-indigo-500 ring-1 ring-indigo-500/30
error: border-rose-500 ring-1 ring-rose-500/30
disabled: opacity-50 cursor-not-allowed
```

## Iconografía (Lucide React)

- **Tamaño por defecto:** `size={20}` (equivale a `w-5 h-5`)
- **Stroke width:** `strokeWidth={1.5}` (más refinado que el default de 2)
- **Iconos por contexto:**
  - Estudiantes: `Users`, `User`, `UserCheck`, `UserX`
  - Archivos: `Upload`, `FileText`, `FileSpreadsheet`
  - Gráficos: `BarChart3`, `LineChart`, `TrendingUp`, `TrendingDown`
  - Alertas: `AlertCircle`, `AlertTriangle`, `CheckCircle2`, `XCircle`
  - Acciones: `Edit`, `Trash2`, `Download`, `Filter`, `Search`
  - Navegación: `ChevronRight`, `ChevronDown`, `ArrowLeft`
  - Estado: `Loader2` (spin para loading), `Check`, `X`

## Animaciones

Solo animaciones funcionales — no decorativas:

```css
fade-in:   fadeIn 0.2s ease-in-out     /* aparición de modals, tooltips */
slide-up:  slideUp 0.3s ease-out       /* drawers, notificaciones */
spin:      spin 1s linear infinite     /* Loader2 en estados de carga */
```

**Regla:** Si la animación no comunica un cambio de estado o no guía la atención del usuario hacia algo importante, no va.

## Layout General

```
┌─────────────────────────────────────────┐
│  Sidebar (w-64, bg-slate-900)           │
│  ┌─────────┐  ┌───────────────────────┐ │
│  │  Nav    │  │  Header (h-16)        │ │
│  │  Items  │  │  bg-slate-900/80      │ │
│  │         │  │  backdrop-blur-sm     │ │
│  │         │  ├───────────────────────┤ │
│  │         │  │  Main Content         │ │
│  │         │  │  bg-slate-950         │ │
│  │         │  │  p-6                  │ │
│  └─────────┘  └───────────────────────┘ │
└─────────────────────────────────────────┘
```

## Accesibilidad (WCAG AA — obligatorio)

- Todos los elementos interactivos deben tener `focus-visible:ring-2 ring-indigo-500`
- Imágenes decorativas: `aria-hidden="true"`
- Iconos solos (sin texto): `aria-label="descripción"` en el elemento padre o `<span className="sr-only">`
- Los colores del semáforo **nunca** deben ser el único indicador de estado — siempre acompañar con texto o icono
- Contraste mínimo verificado para: `text-slate-100` sobre `bg-slate-950` ✅, `text-emerald-300` sobre `bg-emerald-500/20` ✅
