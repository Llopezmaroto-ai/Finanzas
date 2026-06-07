export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);

export const formatPercent = (value: number) =>
  `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0)}%`;

export const uid = (prefix = 'id') => `${prefix}-${crypto.randomUUID()}`;

export const safeDivide = (numerator: number, denominator: number) => (denominator === 0 ? 0 : numerator / denominator);

export const monthKey = (year: number, month: number) => `${year}-${String(month).padStart(2, '0')}`;
