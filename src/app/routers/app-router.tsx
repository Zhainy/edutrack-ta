import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/widgets/layout/main-layout';
import { DashboardPage } from '@/pages/dashboard';
import { StudentsPage } from '@/pages/students';
import { StudentDetailPage } from '@/pages/students/[id]';
import { IngestionPage } from '@/pages/ingestion';
import { AnalyticsPage } from '@/pages/analytics';
import { CrmPage } from '@/pages/crm';
import { SettingsPage } from '@/pages/settings';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/students/:id" element={<StudentDetailPage />} />
        <Route path="/ingestion" element={<IngestionPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/crm" element={<CrmPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
