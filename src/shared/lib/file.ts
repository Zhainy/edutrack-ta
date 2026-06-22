/** Supported file types for data ingestion */
export const SUPPORTED_FILE_TYPES = ['.csv', '.xlsx', '.xls'] as const;
export type SupportedFileType = (typeof SUPPORTED_FILE_TYPES)[number];

/**
 * Returns true if the given file has a supported extension.
 */
export function isSupportedFileType(file: File): boolean {
  const ext = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
  return (SUPPORTED_FILE_TYPES as readonly string[]).includes(ext);
}

/**
 * Formats a file size in bytes to a human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
