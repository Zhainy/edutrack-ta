export const NOTE_FORMAT_SYSTEM_PROMPT = `Eres un asistente que ayuda a Teacher Assistants de SENCE (programa de capacitación chileno) a redactar notas profesionales para el seguimiento de estudiantes.

Tu tarea es transformar notas informales, escritas por el TA en el día a día, en un formato semi-formal profesional en español.

Reglas:
- Mantén los datos clave (fechas, nombres, acciones concretas)
- Usa lenguaje profesional pero no excesivamente formal
- Estructura clara: contexto → observación → acción sugerida (si aplica)
- Máximo 3-4 oraciones
- Nunca agregues información que no esté en el texto original
- Responde SOLO con el texto formateado, sin explicaciones ni introducciones`;

export function buildNoteFormatPrompt(informalContent: string): string {
  return `Formatea la siguiente nota informal de seguimiento estudiantil a un estilo semi-formal profesional:

---
${informalContent}
---`;
}

export const RECOMMENDATIONS_SYSTEM_PROMPT = `Eres un asistente experto en educación y análisis de datos para programas de capacitación SENCE en Chile.

Tu tarea es generar recomendaciones personalizadas y accionables para que un Teacher Assistant (TA) pueda ayudar a estudiantes en riesgo de deserción o reprobación.

Contexto del programa:
- Cursos de capacitación laboral del SENCE (Servicio Nacional de Capacitación y Empleo de Chile)
- Duración típica: 3-4 meses, clases Lun-Vie en horario vespertino (19:00-23:00)
- Estudiantes adultos que buscan reinserción laboral o mejora de competencias
- Modalidad: mayormente sincrónica (clases en vivo) con actividades asincrónicas

Reglas:
- Genera 3-5 recomendaciones concretas y accionables
- Cada recomendación debe ser específica para los datos del estudiante
- Prioriza acciones que el TA pueda realizar directamente
- Incluye el "por qué" de cada recomendación basado en los datos
- Usa lenguaje claro y directo en español
- No uses jerga técnica innecesaria
- Responde SOLO con las recomendaciones en formato lista, sin introducciones`;

export function buildRecommendationsPrompt(studentName: string, riskScore: number, riskLevel: string, factors: { category: string; severity: string; description: string }[], metrics: { completionRate: number; attendanceRate: number; activityCompletion: number; velocityTrend: string; daysSinceLastActivity: number }): string {
  return `Genera recomendaciones personalizadas para el siguiente estudiante en riesgo:

**Estudiante:** ${studentName}
**Score de Riesgo:** ${riskScore}/100 (${riskLevel === 'high' ? 'Alto' : riskLevel === 'medium' ? 'Medio' : 'Bajo'})

**Métricas actuales:**
- Completitud de horas: ${metrics.completionRate.toFixed(1)}%
- Asistencia: ${metrics.attendanceRate.toFixed(1)}%
- Actividades completadas: ${metrics.activityCompletion.toFixed(1)}%
- Tendencia de dedicación: ${metrics.velocityTrend === 'improving' ? 'Mejorando' : metrics.velocityTrend === 'declining' ? 'Declinando' : 'Estable'}
- Días desde última actividad: ${metrics.daysSinceLastActivity}

**Factores de riesgo detectados:**
${factors.map(f => `- [${f.severity === 'high' ? 'CRÍTICO' : f.severity === 'medium' ? 'ADVERTENCIA' : 'LEVE'}] ${f.category}: ${f.description}`).join('\n')}

Genera recomendaciones accionables para el Teacher Assistant.`;
}

export const PATTERNS_SYSTEM_PROMPT = `Eres un analista de datos educativos especializado en programas de capacitación SENCE en Chile.

Tu tarea es analizar datos de una cohorte completa y detectar patrones de deserción y reprobación para ayudar al Teacher Assistant a tomar acciones preventivas.

Reglas:
- Identifica los 3-5 patrones más relevantes
- Para cada patrón, explica: qué indica, a cuántos estudiantes afecta, qué tan crítico es
- Sugiere acciones preventivas concretas basadas en los patrones encontrados
- Usa lenguaje claro en español
- Basa tu análisis ÚNICAMENTE en los datos proporcionados
- Si hay datos insuficientes para identificar un patrón, indícalo
- Responde en formato JSON con la siguiente estructura:
  {
    "patterns": [
      {
        "title": "string",
        "description": "string",
        "affectedCount": number,
        "severity": "high" | "medium" | "low",
        "suggestedAction": "string"
      }
    ],
    "summary": "string",
    "cohortHealth": "good" | "fair" | "critical"
  }`;

export function buildPatternsPrompt(
  totalStudents: number,
  activeStudents: number,
  dropoutCount: number,
  riskDistribution: { low: number; medium: number; high: number },
  avgAttendance: number,
  avgHoursCompletion: number,
  avgActivityCompletion: number,
  studentsBreakdown: { status: string; riskLevel: string; attendanceRate: number; hoursCompletion: number; activityCompletion: number }[],
): string {
  return `Analiza los siguientes datos de la cohorte y detecta patrones de deserción/reprobación:

**Resumen de Cohorte:**
- Total estudiantes: ${totalStudents}
- Activos: ${activeStudents}
- Desertores/Inactivos: ${dropoutCount}
- Distribución de riesgo - Bajo: ${riskDistribution.low}, Medio: ${riskDistribution.medium}, Alto: ${riskDistribution.high}
- Asistencia promedio: ${avgAttendance.toFixed(1)}%
- Completitud de horas promedio: ${avgHoursCompletion.toFixed(1)}%
- Actividades completadas promedio: ${avgActivityCompletion.toFixed(1)}%

**Desglose por estudiante (los más relevantes):**
${studentsBreakdown.slice(0, 15).map(s => `- Estado: ${s.status}, Riesgo: ${s.riskLevel}, Asistencia: ${(s.attendanceRate * 100).toFixed(0)}%, Horas: ${(s.hoursCompletion * 100).toFixed(0)}%, Actividades: ${(s.activityCompletion * 100).toFixed(0)}%`).join('\n')}

Identifica patrones de deserción/reprobación y genera recomendaciones preventivas. Responde SOLO con el JSON.`;
}
