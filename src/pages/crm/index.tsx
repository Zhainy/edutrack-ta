import { useEffect, useMemo, useState } from 'react';
import { Plus, AlertTriangle, AlertCircle, MessageSquare, CheckCircle2, BarChart3, Search } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Modal } from '@/shared/ui/modal';
import { db } from '@/shared/lib/database';
import { NoteTimeline } from '@/features/crm/ui/note-timeline';
import { NoteForm } from '@/features/crm/ui/note-form';
import { getAllNotes, createNote, updateNote, deleteNote, toggleComplete } from '@/features/crm/api/crm-api';
import type { Note } from '@/entities/note';
import type { Student } from '@/entities/student';
import type { CrmFilters } from '@/features/crm/api/crm-api';

type TabFilter = 'all' | 'pending' | 'completed';

export function CrmPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState<CrmFilters['type']>('all');
  const [priorityFilter, setPriorityFilter] = useState<CrmFilters['priority']>('all');
  const [statusFilter, setStatusFilter] = useState<TabFilter>('all');
  const [studentFilter, setStudentFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const studentsMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of students) {
      map.set(s.id, s.fullName);
    }
    return map;
  }, [students]);

  const studentOptions = [
    { value: '', label: 'Todos los estudiantes' },
    ...students.map(s => ({ value: s.id, label: s.fullName })),
  ];

  const loadData = async () => {
    setIsLoading(true);
    const filters: CrmFilters = {
      type: typeFilter,
      priority: priorityFilter,
      status: statusFilter === 'all' ? 'all' : statusFilter === 'pending' ? 'pending' : 'completed',
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    };

    const [allNotes, allStudents] = await Promise.all([
      getAllNotes(filters),
      db.students.toArray(),
    ]);

    let filtered = allNotes;
    if (studentFilter) {
      filtered = filtered.filter(n => n.studentId === studentFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        n =>
          n.title.toLowerCase().includes(q) ||
          (n.content && n.content.toLowerCase().includes(q))
      );
    }

    setNotes(filtered);
    setStudents(allStudents);
    setIsLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, [typeFilter, priorityFilter, statusFilter, studentFilter, dateFrom, dateTo]);

  // Stats
  const stats = useMemo(() => {
    const total = notes.length;
    const pending = notes.filter(n => !n.isCompleted).length;
    const urgent = notes.filter(n => n.priority === 'urgent' && !n.isCompleted).length;
    const byType: Record<string, number> = { context: 0, action: 0, alert: 0, general: 0 };
    for (const n of notes) {
      byType[n.type]++;
    }
    return { total, pending, urgent, byType };
  }, [notes]);

  const handleSave = async (note: Note) => {
    if (editingNote) {
      await updateNote(note.id, note);
    } else {
      await createNote(note);
    }
    setShowForm(false);
    setEditingNote(null);
    void loadData();
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await deleteNote(id);
    void loadData();
  };

  const handleToggleComplete = async (id: string, current: boolean) => {
    await toggleComplete(id, current);
    void loadData();
  };

  const typeChartData = useMemo(() => {
    const colors: Record<string, string> = {
      context: '#38bdf8',
      action: '#f59e0b',
      alert: '#f43f5e',
      general: '#64748b',
    };
    return Object.entries(stats.byType).map(([type, count]) => ({
      name: type === 'context' ? 'Contexto' : type === 'action' ? 'Acción' : type === 'alert' ? 'Alerta' : 'General',
      value: count,
      color: colors[type],
    }));
  }, [stats.byType]);

  const maxTypeValue = Math.max(...typeChartData.map(d => d.value), 1);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">CRM - Seguimiento de Estudiantes</h1>
          <p className="mt-1 text-sm text-slate-400">Gestión de notas y seguimiento personalizado</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={16} strokeWidth={1.5} />}
          onClick={() => { setEditingNote(null); setShowForm(true); }}
        >
          Nueva Nota
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800">
              <MessageSquare size={20} strokeWidth={1.5} className="text-slate-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Notas</p>
              <p className="text-xl font-semibold font-mono text-slate-100">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/15">
              <AlertTriangle size={20} strokeWidth={1.5} className="text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Pendientes</p>
              <p className="text-xl font-semibold font-mono text-slate-100">{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-rose-500/15">
              <AlertCircle size={20} strokeWidth={1.5} className="text-rose-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Urgentes</p>
              <p className="text-xl font-semibold font-mono text-slate-100">{stats.urgent}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-500/15">
              <CheckCircle2 size={20} strokeWidth={1.5} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Completadas</p>
              <p className="text-xl font-semibold font-mono text-slate-100">{stats.total - stats.pending}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Notes by type bar chart */}
      <Card variant="default" padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} strokeWidth={1.5} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-300">Notas por Tipo</h3>
        </div>
        <div className="space-y-2">
          {typeChartData.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-16 text-right">{item.name}</span>
              <div className="flex-1 h-5 rounded bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: `${(item.value / maxTypeValue) * 100}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
              <span className="text-xs font-mono text-slate-400 w-6">{item.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <Card variant="default" padding="md">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex rounded-lg border border-slate-700 bg-slate-800/50 p-0.5">
            {(['all', 'pending', 'completed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === s
                    ? 'bg-slate-700 text-slate-100 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s === 'all' ? 'Todas' : s === 'pending' ? 'Pendientes' : 'Completadas'}
              </button>
            ))}
          </div>

          <div className="flex rounded-lg border border-slate-700 bg-slate-800/50 p-0.5">
            {(['all', 'alert', 'action', 'context', 'general'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  typeFilter === t
                    ? 'bg-slate-700 text-slate-100 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'all' ? 'Tipo' : t === 'alert' ? 'Alerta' : t === 'action' ? 'Acción' : t === 'context' ? 'Contexto' : 'General'}
              </button>
            ))}
          </div>

          <div className="flex rounded-lg border border-slate-700 bg-slate-800/50 p-0.5">
            {(['all', 'urgent', 'high', 'medium', 'low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  priorityFilter === p
                    ? 'bg-slate-700 text-slate-100 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p === 'all' ? 'Prioridad' : p === 'urgent' ? 'Urgente' : p === 'high' ? 'Alta' : p === 'medium' ? 'Media' : 'Baja'}
              </button>
            ))}
          </div>

          <Select
            value={studentFilter}
            onValueChange={setStudentFilter}
            options={studentOptions}
          />

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="Desde"
            />
            <span className="text-xs text-slate-500">—</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="Hasta"
            />
          </div>

          <div className="relative">
            <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="w-48 h-10 pl-9 pr-3 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
              placeholder="Buscar notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void loadData(); }}
            />
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <NoteTimeline
        notes={notes}
        studentsMap={studentsMap}
        isLoading={isLoading}
        onToggleComplete={handleToggleComplete}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create/Edit note modal */}
      <Modal
        open={showForm}
        onOpenChange={(open) => { if (!open) { setShowForm(false); setEditingNote(null); } }}
        title={editingNote ? 'Editar Nota' : 'Nueva Nota'}
        size="lg"
      >
        <NoteForm
          students={students}
          initialNote={editingNote}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingNote(null); }}
        />
      </Modal>
    </div>
  );
}
