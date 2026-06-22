export interface SyllabusModule {
  id: string;
  cohortId: string;
  moduleNumber: number;
  moduleName: string;
  startDate: string;    // ISO 8601: YYYY-MM-DD
  endDate: string;      // ISO 8601: YYYY-MM-DD
  expectedHours: number;
  activities: string[]; // list of expected activity names
  createdAt: string;
}
