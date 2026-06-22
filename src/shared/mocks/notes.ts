import type { Note } from '@/entities/note';

const now = new Date().toISOString();

function makeNote(
  id: string,
  studentId: string,
  type: Note['type'],
  priority: Note['priority'],
  title: string,
  content?: string,
  dueDate?: string,
  isCompleted = false
): Note {
  return {
    id,
    studentId,
    type,
    priority,
    title,
    content,
    dueDate,
    isCompleted,
    completedAt: isCompleted ? now : undefined,
    createdAt: now,
    updatedAt: now,
  };
}

export const mockNotes: Note[] = [
  makeNote('n-01', 's-08', 'action', 'high', 'Llamar al estudiante esta semana', 'Lleva 2 semanas con baja dedicación. Contactar para entender situación.', '2026-06-30'),
  makeNote('n-02', 's-09', 'alert', 'urgent', 'Sin conexión a internet', 'Reportó problemas de conectividad en la región.'),
  makeNote('n-03', 's-11', 'context', 'medium', 'Estuvo enfermo', 'Estuvo de baja médica del 2026-06-01 al 2026-06-10.'),
  makeNote('n-04', 's-12', 'action', 'urgent', 'Reunión de seguimiento urgente', 'Riesgo alto. Coordinar sesión de mentoría.', '2026-06-25'),
  makeNote('n-05', 's-13', 'context', 'high', 'Problemas personales', 'Atraviesa una situación familiar difícil. Brindar apoyo.'),
  makeNote('n-06', 's-14', 'action', 'medium', 'Revisar avance del módulo 3', undefined, '2026-06-28'),
  makeNote('n-07', 's-01', 'general', 'low', 'Excelente desempeño', 'Siempre entrega antes de tiempo y ayuda a compañeros.'),
  makeNote('n-08', 's-03', 'general', 'low', 'Candidata a mentoría peer', 'Podría mentorear a estudiantes con dificultades.'),
  makeNote('n-09', 's-15', 'context', 'high', 'Deserción confirmada', 'Confirmó que no continuará por cambio de trabajo.'),
  makeNote('n-10', 's-16', 'context', 'medium', 'Pausa temporal', 'Solicita pausa por viaje familiar. Retorno estimado en 2 meses.'),
  makeNote('n-11', 's-08', 'action', 'medium', 'Enviar recursos de apoyo', 'Compartir videos de refuerzo del módulo 3.', '2026-07-05', true),
  makeNote('n-12', 's-10', 'context', 'low', 'Trabaja part-time', 'Tiene trabajo de medio tiempo. Disponibilidad limitada por las tardes.'),
];
