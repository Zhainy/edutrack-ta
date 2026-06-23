export function toCSV(headers: string[], rows: string[][]): string {
  const escape = (val: string) => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const bom = '\uFEFF';
  const headerLine = headers.map(escape).join(',');
  const bodyLines = rows.map((row) => row.map(escape).join(','));
  return bom + headerLine + '\n' + bodyLines.join('\n');
}

export function downloadCSV(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
