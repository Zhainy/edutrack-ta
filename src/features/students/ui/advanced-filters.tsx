import { useState } from 'react';
import { Button, Input, Select } from '@/shared/ui';
import { Filter, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface StudentFilters {
  status?: 'active' | 'dropout' | 'inactive' | 'replacement';
  riskLevel?: 'low' | 'medium' | 'high';
  minAttendance?: number;
  maxAttendance?: number;
  minHours?: number;
  maxHours?: number;
}

interface AdvancedFiltersProps {
  onApply: (filters: StudentFilters) => void;
  onClear: () => void;
}

export function AdvancedFilters({ onApply, onClear }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<StudentFilters>({});

  function handleApply() {
    onApply(filters);
    setIsOpen(false);
  }

  function handleClear() {
    setFilters({});
    onClear();
    setIsOpen(false);
  }

  const count = Object.values(filters).filter((v) => v !== undefined && v !== '').length;

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        leftIcon={<Filter size={14} strokeWidth={1.5} />}
      >
        Filtros
        {count > 0 && (
          <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500 text-white text-xs font-medium">
            {count}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className={cn(
              'absolute right-0 top-full mt-2 z-50 w-80',
              'bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50',
              'p-4 space-y-4'
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">Filtros Avanzados</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            <Select
              label="Estado"
              value={filters.status ?? 'all'}
              onValueChange={(v) =>
                setFilters({ ...filters, status: v === 'all' ? undefined : (v as StudentFilters['status']) })
              }
              options={[
                { value: 'all', label: 'Todos' },
                { value: 'active', label: 'Activo' },
                { value: 'dropout', label: 'Desertor' },
                { value: 'inactive', label: 'Inactivo' },
                { value: 'replacement', label: 'Reemplazo' },
              ]}
            />

            <Select
              label="Nivel de Riesgo"
              value={filters.riskLevel ?? 'all'}
              onValueChange={(v) =>
                setFilters({ ...filters, riskLevel: v === 'all' ? undefined : (v as StudentFilters['riskLevel']) })
              }
              options={[
                { value: 'all', label: 'Todos' },
                { value: 'low', label: 'Bajo' },
                { value: 'medium', label: 'Medio' },
                { value: 'high', label: 'Alto' },
              ]}
            />

            <div>
              <label className="text-sm font-medium text-slate-400 mb-1 block">% Asistencia</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Mín"
                  min={0}
                  max={100}
                  value={filters.minAttendance ?? ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      minAttendance: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Máx"
                  min={0}
                  max={100}
                  value={filters.maxAttendance ?? ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      maxAttendance: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-400 mb-1 block">Horas de Conexión</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Mín"
                  min={0}
                  value={filters.minHours ?? ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      minHours: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Máx"
                  min={0}
                  value={filters.maxHours ?? ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      maxHours: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={handleClear} className="flex-1">
                Limpiar
              </Button>
              <Button variant="primary" size="sm" onClick={handleApply} className="flex-1">
                Aplicar
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
