import type { Student } from '@/entities/student';
import type { AttendanceRecord } from '@/entities/attendance';
import type { ProgressRecord } from '@/entities/progress';
import type { DedicationRecord } from '@/entities/dedication';
import type { SyllabusModule } from '@/entities/syllabus';

export interface RiskInput {
  student: Student;
  attendance: AttendanceRecord[];
  progress: ProgressRecord[];
  dedication: DedicationRecord[];
  syllabus: SyllabusModule[];
  referenceDate: Date;
}

export interface RiskMetrics {
  completionRate: number;
  attendanceRate: number;
  activityCompletion: number;
  velocityTrend: 'improving' | 'stable' | 'declining';
  daysSinceLastActivity: number;
}

export interface RiskFactor {
  category: 'hours' | 'attendance' | 'activities' | 'engagement';
  severity: 'low' | 'medium' | 'high';
  description: string;
  weight: number;
}

export interface RiskOutput {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  metrics: RiskMetrics;
  factors: RiskFactor[];
  recommendations: string[];
}
