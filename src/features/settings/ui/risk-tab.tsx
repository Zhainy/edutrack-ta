import { useState } from 'react';
import { Card, Input, Button } from '@/shared/ui';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useSettingsStore, type RiskThresholds } from '../model/settings-store';

interface EditableThresholds extends RiskThresholds {
  inactivity: { critical: number };
  totalScore: { high: number; medium: number };
}

export function RiskTab() {
  const saved = useSettingsStore((s) => s.riskThresholds);
  const updateRiskThresholds = useSettingsStore((s) => s.updateRiskThresholds);
  const resetRiskThresholds = useSettingsStore((s) => s.resetRiskThresholds);
  const [form, setForm] = useState<EditableThresholds>({ ...saved });

  const isDirty = JSON.stringify(form) !== JSON.stringify(saved);

  function handleSave() {
    updateRiskThresholds(form);
    toast.success('Umbrales de riesgo guardados');
  }

  function handleReset() {
    resetRiskThresholds();
    setForm(useSettingsStore.getState().riskThresholds);
    toast.success('Umbrales restablecidos a valores por defecto');
  }

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Umbrales de Riesgo</h3>
            <p className="mt-1 text-xs text-slate-500">
              Configura los límites para los niveles de riesgo (bajo/medio/alto).
            </p>
          </div>
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw size={14} />} onClick={handleReset}>
            Restablecer
          </Button>
        </div>
      </Card.Header>
      <Card.Content>
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
              Horas de Dedicación
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Crítico (&lt; %)"
                type="number"
                min={0}
                max={100}
                value={String(form.hours.critical)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    hours: { ...form.hours, critical: Number(e.target.value) },
                  })
                }
              />
              <Input
                label="Advertencia (&lt; %)"
                type="number"
                min={0}
                max={100}
                value={String(form.hours.warning)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    hours: { ...form.hours, warning: Number(e.target.value) },
                  })
                }
              />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
              Asistencia
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Crítico (&lt; %)"
                type="number"
                min={0}
                max={100}
                value={String(form.attendance.critical)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    attendance: { ...form.attendance, critical: Number(e.target.value) },
                  })
                }
              />
              <Input
                label="Advertencia (&lt; %)"
                type="number"
                min={0}
                max={100}
                value={String(form.attendance.warning)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    attendance: { ...form.attendance, warning: Number(e.target.value) },
                  })
                }
              />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
              Actividades Completadas
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Crítico (&lt; %)"
                type="number"
                min={0}
                max={100}
                value={String(form.activities.critical)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    activities: { ...form.activities, critical: Number(e.target.value) },
                  })
                }
              />
              <Input
                label="Advertencia (&lt; %)"
                type="number"
                min={0}
                max={100}
                value={String(form.activities.warning)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    activities: { ...form.activities, warning: Number(e.target.value) },
                  })
                }
              />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
              Inactividad
            </h4>
            <div className="grid grid-cols-2 gap-4 max-w-xs">
              <Input
                label="Crítico (&gt; días)"
                type="number"
                min={0}
                value={String(form.inactivity.critical)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    inactivity: { critical: Number(e.target.value) },
                  })
                }
              />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
              Puntaje Total
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Riesgo alto (&gt;= %)"
                type="number"
                min={0}
                max={100}
                value={String(form.totalScore.high)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    totalScore: { ...form.totalScore, high: Number(e.target.value) },
                  })
                }
              />
              <Input
                label="Riesgo medio (&gt;= %)"
                type="number"
                min={0}
                max={100}
                value={String(form.totalScore.medium)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    totalScore: { ...form.totalScore, medium: Number(e.target.value) },
                  })
                }
              />
            </div>
          </div>
        </div>
      </Card.Content>
      <Card.Footer className="flex justify-end">
        <Button variant="primary" disabled={!isDirty} onClick={handleSave}>
          Guardar umbrales
        </Button>
      </Card.Footer>
    </Card>
  );
}
