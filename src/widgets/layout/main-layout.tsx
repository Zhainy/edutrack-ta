import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Header } from './header';

export function MainLayout() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
