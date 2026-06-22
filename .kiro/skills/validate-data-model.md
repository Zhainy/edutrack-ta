# Skill: validate-data-model

## Descripción
Valida que los modelos de datos del proyecto cumplan el schema definido en los steering files y en los schemas Zod de cada entidad. Verifica consistencia entre interfaces TypeScript, schemas Zod, configuración de Dexie.js e índices de IndexedDB. Reporta inconsistencias antes de que lleguen a producción.

## Uso
```
/kiro skill:validate-data-model [--entity <entidad>] [--fix]
```

## Argumentos
- `--entity`: entidad específica a validar (optional). Valores: `all`, `student`, `attendance`, `progress`, `dedication`, `syllabus`, `note`. Default: `all`
- `--fix`: intentar corregir automáticamente las inconsistencias detectadas (optional). Default: solo reportar

## Ejemplos
```
/kiro skill:validate-data-model
/kiro skill:validate-data-model --entity student
/kiro skill:validate-data-model --entity attendance --fix
```

## Output Esperado

El skill ejecuta las siguientes verificaciones y reporta resultados:

### Verificación 1 — Consistencia TypeScript ↔ Zod
Para cada entidad, verifica que todos los campos de la interface TypeScript estén presentes en el schema Zod y viceversa.

```
✅ Student: interface y schema Zod son consistentes (12 campos)
❌ AttendanceRecord: campo 'uploadedAt' presente en interface pero ausente en schema Zod
   → Sugerencia: agregar z.string().datetime() para uploadedAt en entities/attendance/schema.ts
```

### Verificación 2 — Restricciones de negocio en Dexie
Verifica que los índices compuestos en `shared/api/db.ts` cubran las restricciones UNIQUE documentadas:

```
✅ students: índice [cohortId+externalId] cubre UNIQUE(cohortId, externalId)
✅ attendance: índice [studentId+date] cubre UNIQUE(studentId, date)
❌ dedication: índice [studentId+date+platform] faltante — UNIQUE(studentId, date, platform) no tiene índice
   → Sugerencia: agregar '[studentId+date+platform]' a db.version().stores().dedication
```

### Verificación 3 — Normalización de datos
Verifica que `features/ingestion/lib/normalizer.ts` cubra los campos que requieren normalización según el steering:

```
✅ Fechas: función parseDate() presente y usa date-fns
✅ Emails: normalizeEmail() hace trim().toLowerCase()
⚠️  Horas: parseHours() no usa toFixed(2) — puede generar decimales con más de 2 dígitos
   → Sugerencia: return parseFloat(value.toFixed(2)) en lugar de parseFloat(value)
```

### Verificación 4 — Reglas de negocio documentadas
Verifica que las 6 reglas de negocio del steering data-models.md estén implementadas:

```
✅ REG-001: UNIQUE(cohortId, externalId) — índice presente y upsert implementado
✅ REG-002: UNIQUE(studentId, date) para attendance
❌ REG-003: UNIQUE(studentId, activityName) para progress — falta verificación en upsert
   → Sugerencia: revisar features/ingestion/lib/progressUpsert.ts
```

### Reporte final

```
📊 Resultado de validación: 3 errores, 1 advertencia, 8 verificaciones pasadas

Errores (deben corregirse):
  - entities/attendance/schema.ts: campo uploadedAt faltante en schema Zod
  - shared/api/db.ts: índice compuesto faltante para dedication
  - features/ingestion/lib/: upsert de progress no valida unicidad

Advertencias (recomendado corregir):
  - features/ingestion/lib/normalizer.ts: horas sin toFixed(2)
```

## Validaciones que ejecuta
- [ ] Todos los campos de interfaces TypeScript tienen equivalente en schema Zod
- [ ] Todos los índices compuestos de Dexie cubren las restricciones UNIQUE documentadas
- [ ] La función de normalización cubre: fechas (ISO 8601), emails (lowercase), horas (2 decimales)
- [ ] Las 6 reglas de negocio del data-models.md tienen implementación verificable
- [ ] Ningún tipo de entidad usa `any` — verificar con `grep -r ": any" src/entities/`
- [ ] Los IDs usan `crypto.randomUUID()` y no librerías externas de UUID
- [ ] Las fechas opcionales tienen el sufijo `?` tanto en TypeScript como en Zod
