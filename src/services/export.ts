import { AppData } from '../types/finance';
import { createBackup } from './db';

const download = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const csvEscape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const toCsv = (rows: Record<string, unknown>[]) => {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  return [headers.join(','), ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(','))].join('\n');
};

export const exportBackupJson = (data: AppData) => {
  download(JSON.stringify(createBackup(data), null, 2), `finanzas-backup-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
};

export const exportAllCsv = (data: AppData) => {
  const sections = [
    '# Movimientos', toCsv(data.movements as unknown as Record<string, unknown>[]),
    '\n# Productos', toCsv(data.products as unknown as Record<string, unknown>[]),
    '\n# Seguimiento mensual', toCsv(data.monthlyRecords as unknown as Record<string, unknown>[]),
    '\n# Objetivos', toCsv(data.goals as unknown as Record<string, unknown>[]),
  ].join('\n');
  download(sections, `finanzas-datos-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8');
};
