import { create } from 'zustand';
import type { Note } from '@/entities/note';
import type { CrmFilters, NotesStats } from '../api/crm-api';
import * as crmApi from '../api/crm-api';
import { toast } from '@/shared/ui/toast';

interface CrmState {
  notes: Note[];
  stats: NotesStats | null;
  isLoading: boolean;
  filters: CrmFilters;
  selectedNote: Note | null;

  loadNotes: () => Promise<void>;
  createNote: (note: Note) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  toggleComplete: (id: string, current: boolean) => Promise<void>;
  setFilters: (filters: Partial<CrmFilters>) => void;
  setSelectedNote: (note: Note | null) => void;
}

export const useCrmStore = create<CrmState>((set, get) => ({
  notes: [],
  stats: null,
  isLoading: false,
  filters: {},
  selectedNote: null,

  loadNotes: async () => {
    set({ isLoading: true });
    try {
      const filters = get().filters;
      const [notes, stats] = await Promise.all([
        crmApi.getAllNotes(filters),
        crmApi.getNotesStats(filters),
      ]);
      set({ notes, stats });
    } finally {
      set({ isLoading: false });
    }
  },

  createNote: async (note) => {
    await crmApi.createNote(note);
    toast.success('Nota creada');
    await get().loadNotes();
  },

  updateNote: async (id, updates) => {
    await crmApi.updateNote(id, updates);
    toast.success('Nota actualizada');
    await get().loadNotes();
  },

  deleteNote: async (id) => {
    await crmApi.deleteNote(id);
    toast.success('Nota eliminada');
    await get().loadNotes();
  },

  toggleComplete: async (id, current) => {
    await crmApi.toggleComplete(id, current);
    await get().loadNotes();
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
    get().loadNotes();
  },

  setSelectedNote: (note) => {
    set({ selectedNote: note });
  },
}));
