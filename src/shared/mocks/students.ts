import type { Student } from '@/entities/student';
import { COHORT_ID } from './cohorts';

const now = new Date().toISOString();

const makeStudent = (
  id: string,
  fullName: string,
  email: string,
  status: Student['status'],
  tags: string[],
  enrollmentDate: string
): Student => ({
  id,
  cohortId: COHORT_ID,
  externalId: email,
  fullName,
  email,
  status,
  enrollmentDate,
  tags,
  metadata: {},
  createdAt: now,
  updatedAt: now,
});

export const mockStudents: Student[] = [
  // Active students — good standing
  makeStudent('s-01', 'Ana García López', 'ana.garcia@example.com', 'active', [], '2026-03-01'),
  makeStudent('s-02', 'Carlos Martínez Ruiz', 'carlos.martinez@example.com', 'active', [], '2026-03-01'),
  makeStudent('s-03', 'Lucía Fernández Silva', 'lucia.fernandez@example.com', 'active', [], '2026-03-01'),
  makeStudent('s-04', 'Diego Torres Vega', 'diego.torres@example.com', 'active', [], '2026-03-01'),
  makeStudent('s-05', 'Valentina Morales Cruz', 'valentina.morales@example.com', 'active', [], '2026-03-01'),
  makeStudent('s-06', 'Sebastián Herrera Díaz', 'sebastian.herrera@example.com', 'active', [], '2026-03-01'),
  makeStudent('s-07', 'Camila Jiménez Reyes', 'camila.jimenez@example.com', 'active', [], '2026-03-01'),
  // Active students — medium risk
  makeStudent('s-08', 'Martín Pérez Navarro', 'martin.perez@example.com', 'active', ['Trabajando'], '2026-03-01'),
  makeStudent('s-09', 'Sofía Ramírez Flores', 'sofia.ramirez@example.com', 'active', ['Sin internet'], '2026-03-01'),
  makeStudent('s-10', 'Alejandro López Ortiz', 'alejandro.lopez@example.com', 'active', [], '2026-03-01'),
  makeStudent('s-11', 'Isabella Vargas Mendoza', 'isabella.vargas@example.com', 'active', ['Enfermo'], '2026-03-01'),
  // Active students — high risk
  makeStudent('s-12', 'Tomás Castillo Guerrero', 'tomas.castillo@example.com', 'active', ['PC no disponible'], '2026-03-01'),
  makeStudent('s-13', 'Valeria Espinoza Rojas', 'valeria.espinoza@example.com', 'active', ['Problema personal'], '2026-03-01'),
  makeStudent('s-14', 'Nicolás Gutiérrez Soto', 'nicolas.gutierrez@example.com', 'active', [], '2026-03-01'),
  // Dropout students
  makeStudent('s-15', 'Andrea Mendoza Paredes', 'andrea.mendoza@example.com', 'dropout', [], '2026-03-01'),
  makeStudent('s-16', 'Roberto Sánchez Fuentes', 'roberto.sanchez@example.com', 'dropout', [], '2026-03-01'),
  makeStudent('s-17', 'Daniela Castro Pinto', 'daniela.castro@example.com', 'dropout', [], '2026-03-01'),
  makeStudent('s-18', 'Felipe Ríos Cabrera', 'felipe.rios@example.com', 'dropout', [], '2026-03-01'),
  // Inactive students
  makeStudent('s-19', 'Natalia Vega Contreras', 'natalia.vega@example.com', 'inactive', [], '2026-03-01'),
  makeStudent('s-20', 'Gabriel Mora Pedraza', 'gabriel.mora@example.com', 'inactive', [], '2026-03-01'),
];
