import { Card, Select } from '@/shared/ui';
import { toast } from 'sonner';
import { useSettingsStore } from '../model/settings-store';

const DATE_FORMAT_OPTIONS = [
  { value: 'dd/MM/yyyy', label: 'DD/MM/AAAA (Chile)' },
  { value: 'yyyy-MM-dd', label: 'AAAA-MM-DD (ISO)' },
  { value: 'MM/dd/yyyy', label: 'MM/DD/AAAA (EE.UU.)' },
];

const LANGUAGE_OPTIONS = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
];

export function PreferencesTab() {
  const preferences = useSettingsStore((s) => s.preferences);
  const updatePreferences = useSettingsStore((s) => s.updatePreferences);

  function handleDateFormatChange(value: string) {
    updatePreferences({ dateFormat: value });
    toast.success('Formato de fecha actualizado');
  }

  function handleLanguageChange(value: string) {
    updatePreferences({ language: value as 'es' | 'en' });
    toast.success('Idioma actualizado');
  }

  return (
    <Card>
      <Card.Header>
        <h3 className="text-sm font-semibold text-slate-100">Preferencias</h3>
        <p className="mt-1 text-xs text-slate-500">
          Personaliza la experiencia de la aplicación.
        </p>
      </Card.Header>
      <Card.Content>
        <div className="space-y-6">
          <Select
            label="Formato de fecha"
            value={preferences.dateFormat}
            onValueChange={handleDateFormatChange}
            options={DATE_FORMAT_OPTIONS}
          />
          <Select
            label="Idioma"
            value={preferences.language}
            onValueChange={handleLanguageChange}
            options={LANGUAGE_OPTIONS}
          />
          <p className="text-xs text-slate-500">
            Los cambios se guardan automáticamente al seleccionar una opción.
          </p>
        </div>
      </Card.Content>
    </Card>
  );
}
