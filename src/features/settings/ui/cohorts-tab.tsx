import { useState, useEffect } from 'react';
import { Card, Button, Input, Modal, EmptyState } from '@/shared/ui';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import type { Cohort } from '@/entities/cohort';
import { getAllCohorts, upsertCohort, deleteCohort } from '../api/settings-api';

interface CohortForm {
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  region: string;
  schedule: string;
  instructor: string;
}

const EMPTY_FORM: CohortForm = {
  code: '',
  name: '',
  startDate: '',
  endDate: '',
  totalHours: 438,
  region: '',
  schedule: '',
  instructor: '',
};

export function CohortsTab() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CohortForm>(EMPTY_FORM);

  useEffect(() => { loadCohorts(); }, []);

  async function loadCohorts() {
    setIsLoading(true);
    try {
      const data = await getAllCohorts();
      setCohorts(data);
    } catch {
      toast.error('Error al cargar cohortes');
    } finally {
      setIsLoading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(cohort: Cohort) {
    setEditingId(cohort.id);
    setForm({
      code: cohort.code,
      name: cohort.name,
      startDate: cohort.startDate,
      endDate: cohort.endDate,
      totalHours: cohort.totalHours,
      region: cohort.region ?? '',
      schedule: cohort.schedule ?? '',
      instructor: cohort.instructor ?? '',
    });
    setModalOpen(true);
  }

  function openDelete(id: string) {
    setDeletingId(id);
    setDeleteModalOpen(true);
  }

  async function handleSave() {
    if (!form.code || !form.name || !form.startDate || !form.endDate) {
      toast.error('Completa los campos obligatorios');
      return;
    }

    const now = new Date().toISOString();
    const cohort: Cohort = {
      id: editingId ?? crypto.randomUUID(),
      code: form.code,
      name: form.name,
      startDate: form.startDate,
      endDate: form.endDate,
      totalHours: form.totalHours,
      region: form.region || undefined,
      schedule: form.schedule || undefined,
      instructor: form.instructor || undefined,
      createdAt: editingId ? cohorts.find((c) => c.id === editingId)?.createdAt ?? now : now,
      updatedAt: now,
    };

    try {
      await upsertCohort(cohort);
      toast.success(editingId ? 'Cohorte actualizada' : 'Cohorte creada');
      setModalOpen(false);
      await loadCohorts();
    } catch {
      toast.error('Error al guardar la cohorte');
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    try {
      await deleteCohort(deletingId);
      toast.success('Cohorte eliminada');
      setDeleteModalOpen(false);
      setDeletingId(null);
      await loadCohorts();
    } catch {
      toast.error('Error al eliminar la cohorte');
    }
  }

  return (
    <>
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Cohortes / Cursos</h3>
              <p className="mt-1 text-xs text-slate-500">
                Gestiona los cohortes del sistema.
              </p>
            </div>
            <Button variant="primary" size="sm" leftIcon={<Plus size={16} />} onClick={openCreate}>
              Nueva cohorte
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          {isLoading ? (
            <div className="text-sm text-slate-500 py-4 text-center">Cargando...</div>
          ) : cohorts.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={20} />}
              title="No hay cohortes"
              description="Crea tu primera cohorte para empezar."
              action={
                <Button variant="primary" size="sm" leftIcon={<Plus size={16} />} onClick={openCreate}>
                  Nueva cohorte
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {cohorts.map((cohort) => (
                <div
                  key={cohort.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:border-slate-700"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-100 truncate">{cohort.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {cohort.code} &middot; {cohort.startDate} → {cohort.endDate} &middot;{' '}
                      {cohort.totalHours}h
                    </p>
                    {cohort.instructor && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        Instructor: {cohort.instructor}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Pencil size={14} />}
                      onClick={() => openEdit(cohort)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Trash2 size={14} className="text-rose-400" />}
                      onClick={() => openDelete(cohort.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingId ? 'Editar cohorte' : 'Nueva cohorte'}
        size="lg"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {editingId ? 'Guardar cambios' : 'Crear cohorte'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Código del curso"
              placeholder="Ej: RTD-24-01-06-0021-4"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />
            <Input
              label="Horas totales"
              type="number"
              value={String(form.totalHours)}
              onChange={(e) => setForm({ ...form, totalHours: Number(e.target.value) })}
            />
          </div>
          <Input
            label="Nombre del curso"
            placeholder="Ej: DESARROLLO DE APLICACIONES FRONT-END TRAINEE V2.0"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha de inicio"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
            <Input
              label="Fecha de término"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Región"
              placeholder="Ej: Metropolitana"
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
            />
            <Input
              label="Horario"
              placeholder="Ej: 19:00-23:00"
              value={form.schedule}
              onChange={(e) => setForm({ ...form, schedule: e.target.value })}
            />
          </div>
          <Input
            label="Instructor / Relator"
            placeholder="Ej: Juan Pablo Duran"
            value={form.instructor}
            onChange={(e) => setForm({ ...form, instructor: e.target.value })}
          />
        </div>
      </Modal>

      <Modal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Eliminar cohorte"
        description="Esta acción eliminará la cohorte y todos sus datos asociados (estudiantes, asistencia, progreso, notas). Esta acción no se puede deshacer."
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-400">
          ¿Estás seguro de que deseas eliminar esta cohorte?
        </p>
      </Modal>
    </>
  );
}
