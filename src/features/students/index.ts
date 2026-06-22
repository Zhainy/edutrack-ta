export {
  getAllStudents,
  getStudentsByCohort,
  getStudentStatusCounts,
  getCohorts,
  getCohortById,
  bulkImportStudents,
  deleteStudent,
  getStudentMetrics,
  getAllStudentMetrics,
} from './api/students-api';
export type { StudentMetrics } from './api/students-api';

export { useStudentsStore } from './model/students-store';

export { findStudentId, matchAllRecords } from './lib/matcher';
