/**
 * Detects file type by extension.
 * Returns 'csv', 'xlsx', or null if unsupported.
 */
export function detectFileType(fileName: string): 'csv' | 'xlsx' | null {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'csv') return 'csv';
  if (ext === 'xlsx' || ext === 'xls') return 'xlsx';
  return null;
}
