import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ExternalLink,
  Trash2,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/empty-state';
import { useDebounce } from '@/shared/hooks';
import { db } from '@/shared/lib/database';
import { toast } from '@/shared/ui/toast';
import { cn } from '@/shared/lib/utils';
import { calculateRisk } from '@/features/risk-engine';
import { deleteStudent, bulkDeleteStudents, getPendingActivities } from '@/features/students';
import { StatusSelector } from '@/features/students/ui/status-selector';
import { AdvancedFilters, type StudentFilters } from '@/features/students/ui/advanced-filters';
import { DeleteStudentModal } from '@/features/students/ui/delete-student-modal';
import type { Student } from '@/entities/student';
import type { RiskOutput } from '@/features/risk-engine';

interface StudentWithRisk {
  student: Student;
  risk: RiskOutput | null;
  pendingCount: number;
  overdueCount: number;
}

type StatusFilter = 'all' | 'active' | 'dropout' | 'inactive' | 'replacement';
type RiskFilter = 'all' | 'high' | 'medium' | 'low';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'dropout', label: 'Desertores' },
  { value: 'inactive', label: 'Inactivos' },
  { value: 'replacement', label: 'Reemplazo' },
];

const RISK_OPTIONS: { value: RiskFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'high', label: 'Alto' },
  { value: 'medium', label: 'Medio' },
  { value: 'low', label: 'Bajo' },
];

function riskBadgeVariant(level: RiskOutput['riskLevel']): 'risk-high' | 'risk-medium' | 'risk-low' {
  if (level === 'high') return 'risk-high';
  if (level === 'medium') return 'risk-medium';
  return 'risk-low';
}

function riskLabel(level: RiskOutput['riskLevel']): string {
  if (level === 'high') return 'Alto';
  if (level === 'medium') return 'Medio';
  return 'Bajo';
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  riskFilter: RiskFilter;
  onRiskFilterChange: (value: RiskFilter) => void;
}

function FilterBar({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  riskFilter,
  onRiskFilterChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <Input
          placeholder="Buscar por nombre o email..."
          leftIcon={<Search size={16} strokeWidth={1.5} />}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <div className="flex rounded-lg border border-slate-700 bg-slate-800/50 p-0.5">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onStatusFilterChange(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === opt.value
                  ? 'bg-slate-700 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg border border-slate-700 bg-slate-800/50 p-0.5">
          {RISK_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onRiskFilterChange(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                riskFilter === opt.value
                  ? 'bg-slate-700 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Riesgo {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function VirtualizedTable({ table }: { table: ReturnType<typeof useReactTable<StudentWithRisk>> }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-slate-800">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider',
                    header.column.getCanSort() &&
                      'cursor-pointer select-none hover:text-slate-300 transition-colors'
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span className="text-slate-600">
                        {header.column.getIsSorted() === 'asc' ? (
                          <ChevronUp size={14} strokeWidth={1.5} />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <ChevronDown size={14} strokeWidth={1.5} />
                        ) : (
                          <ChevronsUpDown size={14} strokeWidth={1.5} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
      </table>
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: `${Math.min(rows.length * 60, 600)}px` }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <div
                key={row.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="hover:bg-slate-800/30 transition-colors"
              >
                <table className="w-full">
                  <tbody className="divide-y divide-slate-800/50">
                    <tr className="hover:bg-slate-800/30 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-3 text-sm whitespace-nowrap"
                          style={{ width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function StudentsPage() {
  const [data, setData] = useState<StudentWithRisk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'fullName', desc: false }]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [advancedFilters, setAdvancedFilters] = useState<StudentFilters>({});
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteStudent(deleteTarget.id);
      setData((prev) => prev.filter((item) => item.student.id !== deleteTarget.id));
      toast.success('Estudiante eliminado', `${deleteTarget.fullName} ha sido eliminado.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Error al eliminar', err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const ids = Object.keys(rowSelection);
      await bulkDeleteStudents(ids);
      setData((prev) => prev.filter((item) => !ids.includes(item.student.id)));
      toast.success(`${ids.length} estudiantes eliminados`);
      setRowSelection({});
      setShowBulkDelete(false);
    } catch (err) {
      toast.error('Error al eliminar', err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        const [rawStudents, allAttendance, allProgress, allDedication, allSyllabus] =
          await Promise.all([
            db.students.toArray(),
            db.attendance.toArray(),
            db.progress.toArray(),
            db.dedication.toArray(),
            db.syllabus.toArray(),
          ]);

        const students = rawStudents.sort((a, b) =>
          a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' })
        );

        const referenceDate = new Date();

        const withRisk: StudentWithRisk[] = await Promise.all(
          students.map(async (student) => {
            if (student.status !== 'active') {
              return { student, risk: null, pendingCount: 0, overdueCount: 0 };
            }
            const risk = calculateRisk({
              student,
              attendance: allAttendance.filter((a) => a.studentId === student.id),
              progress: allProgress.filter((p) => p.studentId === student.id),
              dedication: allDedication.filter((d) => d.studentId === student.id),
              syllabus: allSyllabus.filter((m) => m.cohortId === student.cohortId),
              referenceDate,
              allCohortProgress: allProgress,
            });
            const pending = await getPendingActivities(student.id);
            const pendingCount = pending.length;
            const overdueCount = pending.filter(a => a.isOverdue).length;
            return { student, risk, pendingCount, overdueCount };
          })
        );

        if (!cancelled) {
          setData(withRisk);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar estudiantes');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const { student, risk } = item;

      if (statusFilter !== 'all' && student.status !== statusFilter) return false;

      if (riskFilter !== 'all') {
        if (!risk) return false;
        if (risk.riskLevel !== riskFilter) return false;
      }

      if (advancedFilters.status && student.status !== advancedFilters.status) return false;
      if (advancedFilters.riskLevel) {
        if (!risk) return false;
        if (risk.riskLevel !== advancedFilters.riskLevel) return false;
      }
      if (advancedFilters.minAttendance !== undefined) {
        const rate = risk?.metrics.attendanceRate ?? 0;
        if (rate < advancedFilters.minAttendance) return false;
      }
      if (advancedFilters.maxAttendance !== undefined) {
        const rate = risk?.metrics.attendanceRate ?? 0;
        if (rate > advancedFilters.maxAttendance) return false;
      }
      if (advancedFilters.minHours !== undefined) {
        const hours = risk?.metrics.completionRate ?? 0;
        if (hours < advancedFilters.minHours) return false;
      }
      if (advancedFilters.maxHours !== undefined) {
        const hours = risk?.metrics.completionRate ?? 0;
        if (hours > advancedFilters.maxHours) return false;
      }

      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const nameMatch = student.fullName.toLowerCase().includes(q);
        const emailMatch = student.email?.toLowerCase().includes(q);
        if (!nameMatch && !emailMatch) return false;
      }

      return true;
    });
  }, [data, statusFilter, riskFilter, advancedFilters, debouncedSearch]);

  const columns = useMemo<ColumnDef<StudentWithRisk>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <button
            type="button"
            onClick={() => table.toggleAllPageRowsSelected()}
            className="flex items-center justify-center w-8 h-8 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Seleccionar todos"
          >
            {table.getIsAllPageRowsSelected() ? (
              <CheckSquare size={16} strokeWidth={1.5} className="text-indigo-400" />
            ) : (
              <Square size={16} strokeWidth={1.5} />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => row.toggleSelected()}
            className="flex items-center justify-center w-8 h-8 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label={row.getIsSelected() ? 'Deseleccionar' : 'Seleccionar'}
          >
            {row.getIsSelected() ? (
              <CheckSquare size={16} strokeWidth={1.5} className="text-indigo-400" />
            ) : (
              <Square size={16} strokeWidth={1.5} />
            )}
          </button>
        ),
        enableSorting: false,
        size: 60,
      },
      {
        id: 'fullName',
        header: 'Nombre',
        accessorFn: (row) => row.student.fullName,
        cell: ({ row }) => (
          <Link
            to={`/students/${row.original.student.id}`}
            className="flex items-center gap-2 group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/20 flex-shrink-0">
              <span className="text-xs font-semibold text-indigo-300">
                {row.original.student.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate group-hover:text-indigo-400 transition-colors">
                {row.original.student.fullName}
              </p>
              {row.original.student.email && (
                <p className="text-xs text-slate-500 truncate">{row.original.student.email}</p>
              )}
            </div>
          </Link>
        ),
        enableSorting: true,
      },
      {
        id: 'status',
        header: 'Estado',
        accessorFn: (row) => row.student.status,
        cell: ({ row }) => (
          <StatusSelector
            studentId={row.original.student.id}
            currentStatus={row.original.student.status}
            size="sm"
            onChange={(newStatus) => {
              setData((prev) =>
                prev.map((item) =>
                  item.student.id === row.original.student.id
                    ? { ...item, student: { ...item.student, status: newStatus } }
                    : item
                )
              );
            }}
          />
        ),
        enableSorting: true,
      },
      {
        id: 'riskScore',
        header: 'Riesgo',
        accessorFn: (row) => row.risk?.riskScore ?? null,
        cell: ({ row }) => {
          const risk = row.original.risk;
          if (!risk) return <span className="text-xs text-slate-600">—</span>;
          return (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 flex-1 min-w-[80px]">
                <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      risk.riskLevel === 'high'
                        ? 'bg-rose-500'
                        : risk.riskLevel === 'medium'
                          ? 'bg-amber-400'
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${risk.riskScore}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-slate-400 w-8 text-right">
                  {risk.riskScore}
                </span>
              </div>
              <Badge variant={riskBadgeVariant(risk.riskLevel)}>
                {riskLabel(risk.riskLevel)}
              </Badge>
            </div>
          );
        },
        enableSorting: true,
        sortUndefined: 'last',
      },
      {
        id: 'attendanceRate',
        header: 'Asistencia',
        accessorFn: (row) => row.risk?.metrics.attendanceRate ?? null,
        cell: ({ row }) => {
          const rate = row.original.risk?.metrics.attendanceRate;
          if (rate === undefined || rate === null)
            return <span className="text-xs text-slate-600">—</span>;
          const color =
            rate < 70 ? 'text-rose-400' : rate < 85 ? 'text-amber-400' : 'text-emerald-400';
          return <span className={`text-sm font-mono ${color}`}>{Math.round(rate)}%</span>;
        },
        enableSorting: true,
        sortUndefined: 'last',
      },
      {
        id: 'completionRate',
        header: 'Horas',
        accessorFn: (row) => row.risk?.metrics.completionRate ?? null,
        cell: ({ row }) => {
          const rate = row.original.risk?.metrics.completionRate;
          if (rate === undefined || rate === null)
            return <span className="text-xs text-slate-600">—</span>;
          const color =
            rate < 50 ? 'text-rose-400' : rate < 75 ? 'text-amber-400' : 'text-emerald-400';
          return <span className={`text-sm font-mono ${color}`}>{Math.round(rate)}%</span>;
        },
        enableSorting: true,
        sortUndefined: 'last',
      },
      {
        id: 'pending',
        header: 'Pendientes',
        accessorFn: (row) => row.overdueCount,
        cell: ({ row }) => {
          const { pendingCount, overdueCount } = row.original;
          if (overdueCount > 0) {
            return <Badge variant="risk-high">{overdueCount} atrasadas</Badge>;
          }
          if (pendingCount > 0) {
            return <Badge variant="risk-medium">{pendingCount} pendientes</Badge>;
          }
          return <Badge variant="active">Al día</Badge>;
        },
        enableSorting: true,
      },
      {
        id: 'tags',
        header: 'Tags',
        accessorFn: (row) => row.student.tags,
        cell: ({ row }) => {
          const tags = row.original.student.tags;
          if (!tags || tags.length === 0)
            return <span className="text-xs text-slate-600">—</span>;
          return (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Link
              to={`/students/${row.original.student.id}`}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              aria-label={`Ver perfil de ${row.original.student.fullName}`}
            >
              <ExternalLink size={16} strokeWidth={1.5} />
            </Link>
            <button
              type="button"
              onClick={() => setDeleteTarget(row.original.student)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              aria-label={`Eliminar ${row.original.student.fullName}`}
            >
              <Trash2 size={16} strokeWidth={1.5} />
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<AlertTriangle size={24} strokeWidth={1.5} />}
          title="Error al cargar estudiantes"
          description={error}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Estudiantes</h2>
          <p className="mt-1 text-sm text-slate-400">
            {isLoading
              ? 'Cargando...'
              : `${filteredData.length} de ${data.length} estudiantes`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <FilterBar
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            riskFilter={riskFilter}
            onRiskFilterChange={setRiskFilter}
          />
        </div>
        <AdvancedFilters
          onApply={setAdvancedFilters}
          onClear={() => setAdvancedFilters({})}
        />
      </div>

      {/* Table */}
      <Card variant="default" padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="text" lines={1} />
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <EmptyState
            icon={<Users size={24} strokeWidth={1.5} />}
            title={data.length === 0 ? 'Sin estudiantes registrados' : 'Sin resultados'}
            description={
              data.length === 0
                ? 'Carga datos desde la sección "Carga de Datos" para comenzar.'
                : 'No hay estudiantes que coincidan con los filtros seleccionados.'
            }
          />
        ) : (
          <VirtualizedTable table={table} />
        )}
      </Card>

      {/* Pagination */}
      {!isLoading && filteredData.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Mostrando{' '}
            <span className="font-medium text-slate-300">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>{' '}
            -{' '}
            <span className="font-medium text-slate-300">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                filteredData.length
              )}
            </span>{' '}
            de{' '}
            <span className="font-medium text-slate-300">{filteredData.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              leftIcon={<ChevronLeft size={16} strokeWidth={1.5} />}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              rightIcon={<ChevronRight size={16} strokeWidth={1.5} />}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Bulk delete bar */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
          <p className="text-sm text-rose-300">
            {Object.keys(rowSelection).length} estudiante{Object.keys(rowSelection).length > 1 ? 's' : ''} seleccionado
            {Object.keys(rowSelection).length > 1 ? 's' : ''}
          </p>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 size={14} strokeWidth={1.5} />}
            onClick={() => setShowBulkDelete(true)}
          >
            Eliminar seleccionados
          </Button>
        </div>
      )}

      {/* Delete single confirmation */}
      <DeleteStudentModal
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        studentName={deleteTarget?.fullName ?? ''}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />

      {/* Bulk delete confirmation */}
      <DeleteStudentModal
        open={showBulkDelete}
        onOpenChange={setShowBulkDelete}
        studentName=""
        isBulk
        count={Object.keys(rowSelection).length}
        onConfirm={handleBulkDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
