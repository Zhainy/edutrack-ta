# Skill: generate-ai-email

## Status
⚠️ REQUIERE:
- `VITE_ENABLE_AI=true`
- `VITE_GROQ_API_KEY` configurada

⚠️ PROVEEDOR: Solo Groq (no hay fallback)

## Descripción
Genera correo de seguimiento personalizado para un estudiante en riesgo usando Groq API.
Si la feature está deshabilitada o no hay API key, muestra mensaje de configuración.

## Uso
```
/kiro skill:generate-ai-email <student-id>
```

## Argumentos
- `student-id`: ID del estudiante (required)

## Ejemplo
```
/kiro skill:generate-ai-email abc123-def456
```

## Output Esperado
- Correo generado por Groq
- Guardado en cache (localStorage)
- Mostrado en UI con opción de copiar

## Validaciones
- [ ] `VITE_ENABLE_AI` debe ser `true`
- [ ] `VITE_GROQ_API_KEY` debe estar configurada
- [ ] Student debe existir en la base de datos
- [ ] No exceder rate limits de Groq (30 RPM, 14,400 RPD)

## Manejo de Errores
- Si `VITE_ENABLE_AI=false` → "Feature de IA deshabilitada. Actívala en .env.local"
- Si sin API key → "Configure Groq API key en Settings. Obtén una gratis en https://console.groq.com"
- Si Groq falla → "Error al generar correo. Intente nuevamente."
- Si rate limit → "Límite de Groq alcanzado. Espere unos minutos."

## Notas
- Esta skill es completamente opcional
- La app funciona 100% sin ella
- Solo usa Groq (no hay fallback a otros proveedores)
