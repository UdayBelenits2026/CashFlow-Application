export type CsvValue = string | number;

/** Triggers a browser download of the given rows as a CSV file. */
export function downloadCsv(headers: string[], rows: CsvValue[][], filename: string): void {
  if (!rows.length) return;
  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
