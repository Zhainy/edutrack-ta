export { getAllNotes, createNote, updateNote, deleteNote, toggleComplete, getNotesStats } from './api/crm-api';
export type { CrmFilters, NotesStats } from './api/crm-api';
export { useCrmStore } from './model/crm-store';
export { NoteCard } from './ui/note-card';
export { NoteForm } from './ui/note-form';
export { NoteTimeline } from './ui/note-timeline';
