import { AppProviders } from '@/app/providers';
import { AppRouter } from '@/app/routers';

export function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
