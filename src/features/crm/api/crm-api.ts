import { db } from '@/shared/lib/database';
import type { Note } from '@/entities/note';

export interface CrmFilters {
  type?: Note['type'] | 'all';
  priority?: Note['priority'] | 'all';
  status?: 'pending' | 'completed' | 'all';
  studentId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface NotesStats {
  total: number;
  pending: number;
  urgent: number;
  byType: Record<Note['type'], number>;
}

export async function getAllNotes(filters?: CrmFilters): Promise<Note[]> {
  let collection = db.notes.orderBy('createdAt').reverse();

  let notes = await collection.toArray();

  if (filters) {
    if (filters.type && filters.type !== 'all') {
      notes = notes.filter(n => n.type === filters.type);
    }
    if (filters.priority && filters.priority !== 'all') {
      notes = notes.filter(n => n.priority === filters.priority);
    }
    if (filters.status && filters.status !== 'all') {
      const completed = filters.status === 'completed';
      notes = notes.filter(n => n.isCompleted === completed);
    }
    if (filters.studentId) {
      notes = notes.filter(n => n.studentId === filters.studentId);
    }
    if (filters.dateFrom) {
      notes = notes.filter(n => n.createdAt >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      notes = notes.filter(n => n.createdAt <= filters.dateTo!);
    }
  }

  return notes;
}

export async function createNote(note: Note): Promise<void> {
  await db.notes.put(note);
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<void> {
  await db.notes.update(id, { ...updates, updatedAt: new Date().toISOString() });
}

export async function deleteNote(id: string): Promise<void> {
  await db.notes.delete(id);
}

export async function toggleComplete(id: string, current: boolean): Promise<void> {
  await db.notes.update(id, {
    isCompleted: !current,
    completedAt: current ? undefined : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function getNotesStats(filters?: CrmFilters): Promise<NotesStats> {
  const all = await getAllNotes(filters);
  const pending = all.filter(n => !n.isCompleted).length;
  const urgent = all.filter(n => n.priority === 'urgent' && !n.isCompleted).length;

  const byType: Record<Note['type'], number> = {
    context: 0,
    action: 0,
    alert: 0,
    general: 0,
  };

  for (const n of all) {
    byType[n.type]++;
  }

  return {
    total: all.length,
    pending,
    urgent,
    byType,
  };
}
