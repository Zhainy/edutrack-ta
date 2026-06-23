import { Root, List, Trigger, Content } from '@radix-ui/react-tabs';
import { User, BookOpen, AlertTriangle, Settings, Info } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ProfileTab, CohortsTab, RiskTab, PreferencesTab, AboutTab } from '@/features/settings';

const TABS = [
  { value: 'profile', label: 'Perfil', icon: User },
  { value: 'cohorts', label: 'Cohortes', icon: BookOpen },
  { value: 'risk', label: 'Riesgo', icon: AlertTriangle },
  { value: 'preferences', label: 'Preferencias', icon: Settings },
  { value: 'about', label: 'Acerca de', icon: Info },
] as const;

export function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-slate-100">Configuración</h1>
      <p className="mt-1 text-sm text-slate-400">Ajustes del sistema y preferencias</p>

      <Root defaultValue="profile" className="mt-6">
        <List className="flex border-b border-slate-800 gap-1" aria-label="Configuración">
          {TABS.map((tab) => (
            <Trigger
              key={tab.value}
              value={tab.value}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors',
                'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50',
                'data-[state=active]:text-slate-100 data-[state=active]:bg-slate-800 data-[state=active]:border-b-2 data-[state=active]:border-indigo-500',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
              )}
            >
              <tab.icon size={16} strokeWidth={1.5} />
              {tab.label}
            </Trigger>
          ))}
        </List>

        {TABS.map((tab) => (
          <Content key={tab.value} value={tab.value} className="mt-6 focus-visible:outline-none">
            {tab.value === 'profile' && <ProfileTab />}
            {tab.value === 'cohorts' && <CohortsTab />}
            {tab.value === 'risk' && <RiskTab />}
            {tab.value === 'preferences' && <PreferencesTab />}
            {tab.value === 'about' && <AboutTab />}
          </Content>
        ))}
      </Root>
    </div>
  );
}
