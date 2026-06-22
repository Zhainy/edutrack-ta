import { create } from 'zustand';
import type { Cohort } from '@/entities/cohort';
import { getCohorts } from '../api/students-api';

const STORAGE_KEY = 'edutrack-active-cohort';

interface StudentsState {
  cohorts: Cohort[];
  activeCohortId: string | null;
  isLoading: boolean;
  setActiveCohort: (id: string) => void;
  loadCohorts: () => Promise<void>;
}

function loadPersistedId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function persistId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* noop */
  }
}

export const useStudentsStore = create<StudentsState>((set, get) => ({
  cohorts: [],
  activeCohortId: loadPersistedId(),
  isLoading: false,

  setActiveCohort: (id: string) => {
    set({ activeCohortId: id });
    persistId(id);
  },

  loadCohorts: async () => {
    set({ isLoading: true });
    try {
      const cohorts = await getCohorts();
      const state = get();
      const currentId = state.activeCohortId;
      if (cohorts.length > 0) {
        const stillExists = cohorts.some((c) => c.id === currentId);
        const activeCohortId = currentId && stillExists ? currentId : cohorts[0].id;
        if (activeCohortId !== currentId) {
          persistId(activeCohortId);
        }
        set({ cohorts, activeCohortId, isLoading: false });
      } else {
        set({ cohorts: [], activeCohortId: null, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
