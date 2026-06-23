import {
  Root,
  Trigger,
  Portal,
  Content,
  Item,
  Separator,
} from '@radix-ui/react-dropdown-menu';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
  getAttendanceExportData,
  getProgressExportData,
  getRiskExportData,
  getAttendancePrintData,
  getProgressPrintData,
  getRiskPrintData,
} from '../api/export-api';
import { toCSV, downloadCSV } from '../lib/csv';
import { printReport } from '../lib/print';

interface ExportButtonProps {
  cohortId: string | null;
  cohortName?: string;
}

export function ExportButton({ cohortId, cohortName }: ExportButtonProps) {
  if (!cohortId) return null;

  const cid: string = cohortId;

  async function handleExport(kind: 'attendance' | 'progress' | 'risk', format: 'csv' | 'pdf') {
    try {
      if (format === 'csv') {
        const data =
          kind === 'attendance'
            ? await getAttendanceExportData(cid)
            : kind === 'progress'
              ? await getProgressExportData(cid)
              : await getRiskExportData(cid);

        const csv = toCSV(data.headers, data.rows);
        const filename = `${kind}-${new Date().toISOString().split('T')[0]}.csv`;
        downloadCSV(filename, csv);
      } else {
        const data =
          kind === 'attendance'
            ? await getAttendancePrintData(cid, cohortName ?? '')
            : kind === 'progress'
              ? await getProgressPrintData(cid, cohortName ?? '')
              : await getRiskPrintData(cid, cohortName ?? '');

        printReport(data.title, data.subtitle, data.tables);
      }
    } catch {
      // silent
    }
  }

  return (
    <Root>
      <Trigger
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
          'bg-slate-800 border border-slate-700 text-slate-200',
          'hover:bg-slate-700 hover:border-slate-600 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          'data-[state=open]:bg-slate-700 data-[state=open]:border-slate-600'
        )}
        aria-label="Exportar reportes"
      >
        <Download size={14} strokeWidth={1.5} />
        Exportar
        <ChevronDown size={12} strokeWidth={1.5} className="text-slate-500" />
      </Trigger>

      <Portal>
        <Content
          align="end"
          sideOffset={4}
          className={cn(
            'z-50 min-w-[200px] overflow-hidden rounded-lg',
            'bg-slate-800 border border-slate-700 shadow-xl shadow-black/40',
            'animate-fade-in'
          )}
        >
          <div className="p-1">
            <ExportItem
              icon={<FileSpreadsheet size={14} />}
              label="Asistencia CSV"
              onClick={() => handleExport('attendance', 'csv')}
            />
            <ExportItem
              icon={<FileText size={14} />}
              label="Asistencia PDF"
              onClick={() => handleExport('attendance', 'pdf')}
            />
            <Separator className="h-px bg-slate-700 my-1" />
            <ExportItem
              icon={<FileSpreadsheet size={14} />}
              label="Progreso CSV"
              onClick={() => handleExport('progress', 'csv')}
            />
            <ExportItem
              icon={<FileText size={14} />}
              label="Progreso PDF"
              onClick={() => handleExport('progress', 'pdf')}
            />
            <Separator className="h-px bg-slate-700 my-1" />
            <ExportItem
              icon={<FileSpreadsheet size={14} />}
              label="Riesgo CSV"
              onClick={() => handleExport('risk', 'csv')}
            />
            <ExportItem
              icon={<FileText size={14} />}
              label="Riesgo PDF"
              onClick={() => handleExport('risk', 'pdf')}
            />
          </div>
        </Content>
      </Portal>
    </Root>
  );
}

interface ExportItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function ExportItem({ icon, label, onClick }: ExportItemProps) {
  return (
    <Item
      onClick={onClick}
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm outline-none',
        'text-slate-200 hover:bg-slate-700 focus:bg-slate-700'
      )}
    >
      <span className="text-slate-400">{icon}</span>
      {label}
    </Item>
  );
}
