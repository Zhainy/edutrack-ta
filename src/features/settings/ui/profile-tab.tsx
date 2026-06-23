import {
  Root,
  Trigger,
  Value,
  Icon,
  Portal,
  Content,
  Viewport,
  Item,
  ItemText,
  ItemIndicator,
} from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { Card, Input, Button } from '@/shared/ui';
import { useProfileStore } from '../model/profile-store';
import { toast } from 'sonner';

const ROLE_OPTIONS = [
  { value: 'teacher_assistant', label: 'Teacher Assistant' },
  { value: 'instructor', label: 'Instructor' },
  { value: 'coordinator', label: 'Coordinador' },
] as const;

export function ProfileTab() {
  const name = useProfileStore((s) => s.name);
  const email = useProfileStore((s) => s.email);
  const role = useProfileStore((s) => s.role);
  const otec = useProfileStore((s) => s.otec);
  const institution = useProfileStore((s) => s.institution);
  const setName = useProfileStore((s) => s.setName);
  const setEmail = useProfileStore((s) => s.setEmail);
  const setRole = useProfileStore((s) => s.setRole);
  const setOtec = useProfileStore((s) => s.setOtec);
  const setInstitution = useProfileStore((s) => s.setInstitution);

  function handleSave() {
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
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre completo"
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-400">Rol / Cargo</label>
            <Root value={role} onValueChange={(v) => setRole(v as typeof role)}>
              <Trigger className="flex h-10 w-full items-center justify-between rounded-lg px-3 text-sm bg-slate-800/50 border border-slate-700 text-slate-100 hover:border-slate-600 transition-colors focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30">
                <Value placeholder="Seleccionar rol..." />
                <Icon asChild>
                  <ChevronDown size={16} strokeWidth={1.5} className="text-slate-500 flex-shrink-0" />
                </Icon>
              </Trigger>
              <Portal>
                <Content className="z-50 min-w-[8rem] overflow-hidden rounded-lg bg-slate-800 border border-slate-700 shadow-xl shadow-black/40 animate-fade-in">
                  <Viewport className="p-1">
                    {ROLE_OPTIONS.map((opt) => (
                      <Item
                        key={opt.value}
                        value={opt.value}
                        className="relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none text-slate-200 hover:bg-slate-700 focus:bg-slate-700 data-[state=checked]:text-indigo-400"
                      >
                        <ItemText>{opt.label}</ItemText>
                        <ItemIndicator className="absolute right-2">
                          <Check size={14} strokeWidth={1.5} />
                        </ItemIndicator>
                      </Item>
                    ))}
                  </Viewport>
                </Content>
              </Portal>
            </Root>
          </div>

          <Input
            label="OTEC"
            value={otec}
            onChange={(e) => setOtec(e.target.value)}
            placeholder="Nombre de la OTEC"
            helperText="Organismo Técnico de Capacitación al que perteneces"
          />

          <Input
            label="Institución"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="Nombre de la institución"
          />
        </div>
      </Card.Content>
      <Card.Footer className="flex justify-end">
        <Button variant="primary" onClick={handleSave}>
          Guardar Perfil
        </Button>
      </Card.Footer>
    </Card>
  );
}
