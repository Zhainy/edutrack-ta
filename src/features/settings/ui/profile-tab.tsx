import { useState } from 'react';
import { Card, Input, Button } from '@/shared/ui';
import { useSettingsStore, type TaProfile } from '../model/settings-store';
import { toast } from 'sonner';

export function ProfileTab() {
  const profile = useSettingsStore((s) => s.profile);
  const updateProfile = useSettingsStore((s) => s.updateProfile);
  const [form, setForm] = useState<TaProfile>(profile);

  const isDirty =
    form.name !== profile.name ||
    form.email !== profile.email ||
    form.role !== profile.role ||
    form.phone !== profile.phone;

  function handleSave() {
    updateProfile(form);
    toast.success('Perfil guardado correctamente');
  }

  return (
    <Card>
      <Card.Header>
        <h3 className="text-sm font-semibold text-slate-100">Datos del Teacher Assistant</h3>
        <p className="mt-1 text-xs text-slate-500">
          Esta información se guarda localmente en tu navegador.
        </p>
      </Card.Header>
      <Card.Content>
        <div className="space-y-4">
          <Input
            label="Nombre completo"
            placeholder="Ej: Juan Pérez"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="Ej: juan@ejemplo.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Rol / Cargo"
            placeholder="Ej: Teacher Assistant"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
          <Input
            label="Teléfono"
            placeholder="Ej: +56 9 1234 5678"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
      </Card.Content>
      <Card.Footer className="flex justify-end">
        <Button variant="primary" disabled={!isDirty} onClick={handleSave}>
          Guardar perfil
        </Button>
      </Card.Footer>
    </Card>
  );
}
