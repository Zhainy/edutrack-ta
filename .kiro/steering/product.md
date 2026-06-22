# Product Steering

## Visión
Crear una herramienta de analítica educativa que transforme datos crudos de asistencia, progreso y dedicación en información accionable para prevenir la deserción estudiantil y optimizar el seguimiento personalizado.

## Público Objetivo
Teacher Assistants (TAs) de programas educativos técnicos que necesitan hacer seguimiento a cohortes de 20-100 estudiantes. El TA trabaja con datos exportados de plataformas de LMS y necesita unificarlos en un solo lugar.

## Objetivos Principales
1. **Centralización de Datos:** Unificar información dispersa en CSV/XLSX en un dashboard coherente
2. **Detección Temprana de Riesgo:** Identificar alumnos en peligro de deserción/reprobación antes de que sea irreversible
3. **CRM Educativo:** Facilitar el seguimiento contextualizado con notas y alertas
4. **Visualización Intuitiva:** Presentar métricas complejas de forma visual y comprensible
5. **Offline-First:** Funcionar sin conexión, sincronizando cuando haya disponibilidad

## Principios de Producto
1. **Offline-first:** La app debe funcionar completamente sin conexión usando IndexedDB (Dexie.js)
2. **Dark mode por defecto:** Diseñado para reducir fatiga visual en sesiones largas de seguimiento
3. **Accesibilidad WCAG AA:** Contraste mínimo 4.5:1, navegación por teclado, screen reader compatible
4. **Información densa pero clara:** Dashboards con alta densidad de datos sin saturar visualmente
5. **Accionable:** Cada dato debe llevar a una acción concreta (nota, alerta, contacto)
6. **Sin notificaciones externas:** Solo toasts in-app (Sonner). No email, Slack, Discord ni Telegram.
7. **IA opcional:** Solo Groq (gratis, sin tarjeta). La app funciona 100% sin IA.
8. **Simplificación:** Un solo proveedor por servicio (no fallbacks complejos).
9. **Costo cero:** Todos los servicios en capa gratuita.

## Idioma
Español como idioma principal de la interfaz. El código y comentarios en inglés.

## Fases del Proyecto
- **Fase 1 (MVP):** SPA con IndexedDB, sin backend, para un solo TA local
- **Fase 2:** Migración a Supabase, multi-usuario, IA con Groq para correos personalizados
