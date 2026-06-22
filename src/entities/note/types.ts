export interface Note {
  id: string;
  studentId: string;
  type: 'context' | 'action' | 'alert' | 'general';
  title: string;
  content?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;    // ISO 8601: YYYY-MM-DD
  isCompleted: boolean;
  completedAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
