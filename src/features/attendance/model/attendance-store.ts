import { create } from 'zustand';
import type { AttendanceRecord } from '@/entities/attendance';
import {
  getAttendanceByDateRange,
  upsertAttendance,
  bulkMarkAttendance,
} from '../api/attendance-api';
import { db } from '@/shared/lib/database';

const STATUS_CYCLE: AttendanceRecord['status'][] = ['present', 'absent', 'late', 'excused'];

interface AttendanceState {
  records: AttendanceRecord[];
  currentMonth: string;
  activeCohortId: string | null;
  students: { id: string; fullName: string }[];
  dates: string[];
  isLoading: boolean;

  setMonth: (month: string) => void;
  setActiveCohort: (id: string) => void;
  markAttendance: (studentId: string, date: string) => Promise<void>;
  markAllPresent: (date: string, studentIds: string[]) => Promise<void>;
  loadRecords: () => Promise<void>;
}

export function nextStatus(current?: AttendanceRecord['status']): AttendanceRecord['status'] {
  if (!current) return 'present';
  const idx = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  records: [],
  currentMonth: new Date().toISOString().slice(0, 7),
  activeCohortId: null,
  students: [],
  dates: [],
  isLoading: false,

  setMonth: (month: string) => {
    set({ currentMonth: month });
    void get().loadRecords();
  },

  setActiveCohort: (id: string) => {
    set({ activeCohortId: id });
    void get().loadRecords();
  },

  markAttendance: async (studentId: string, date: string) => {
    const { records, activeCohortId } = get();
    if (!activeCohortId) return;

    const existing = records.find((r) => r.studentId === studentId && r.date === date);
    const currentStatus = existing?.status;
    const newStatus = nextStatus(currentStatus);

    const record: AttendanceRecord = {
      id: existing?.id ?? crypto.randomUUID(),
      studentId,
      date,
      status: newStatus,
      uploadedAt: new Date().toISOString(),
    };

    await upsertAttendance(record);

    set((state) => {
      const filtered = state.records.filter(
        (r) => !(r.studentId === studentId && r.date === date)
      );
      return { records: [...filtered, record] };
    });
  },

  markAllPresent: async (date: string, studentIds: string[]) => {
    const now = new Date().toISOString();
    const records: AttendanceRecord[] = studentIds.map((studentId) => ({
      id: crypto.randomUUID(),
      studentId,
      date,
      status: 'present' as const,
      uploadedAt: now,
    }));

    await bulkMarkAttendance(records);

    set((state) => {
      const filtered = state.records.filter((r) => r.date !== date);
      return { records: [...filtered, ...records] };
    });
  },

  loadRecords: async () => {
    const { currentMonth, activeCohortId } = get();
    if (!activeCohortId) return;

    set({ isLoading: true });
    try {
      const year = parseInt(currentMonth.slice(0, 4), 10);
      const month = parseInt(currentMonth.slice(5, 7), 10);
      const startDate = `${currentMonth}-01`;
      const endDate = `${currentMonth}-${new Date(year, month, 0).getDate()}`;

      const students = await db.students
        .where('cohortId')
        .equals(activeCohortId)
        .toArray();
      const studentList = students.map((s) => ({ id: s.id, fullName: s.fullName }));

      const records = await getAttendanceByDateRange(activeCohortId, startDate, endDate);

      const dateSet = new Set(records.map((r) => r.date));
      const dates = Array.from(dateSet).sort();

      set({ records, students: studentList, dates, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
