import { AppData, FinancialProduct, MonthlyProductRecord, MonthlySummary } from '../types/finance';
import { safeDivide } from './format';

export const latestRecordForProduct = (records: MonthlyProductRecord[], productId: string, year?: number, month?: number) =>
  records
    .filter((record) => record.productId === productId && (!year || record.year < year || (record.year === year && (!month || record.month <= month))))
    .sort((a, b) => (b.year - a.year) || (b.month - a.month))[0];

export const getSummary = (data: AppData, year: number, month: number): MonthlySummary => {
  const movements = data.movements.filter((m) => m.year === year && m.month === month);
  const income = movements.filter((m) => m.type === 'ingreso').reduce((sum, m) => sum + m.amount, 0);
  const expenses = movements.filter((m) => m.type === 'gasto').reduce((sum, m) => sum + m.amount, 0);
  const investmentContributions = movements.filter((m) => m.type === 'aportacion_inversion').reduce((sum, m) => sum + m.amount, 0);
  const productSnapshots = data.products.map((product) => {
    const record = latestRecordForProduct(data.monthlyRecords, product.id, year, month);
    return {
      value: record?.marketValue ?? product.initialCapital,
      contributed: record?.totalContributed ?? product.initialCapital,
      returnEuro: record?.returnEuro ?? 0,
    };
  });
  const totalProductValue = productSnapshots.reduce((sum, p) => sum + p.value, 0);
  const totalContributed = productSnapshots.reduce((sum, p) => sum + p.contributed, 0);
  const totalReturnEuro = productSnapshots.reduce((sum, p) => sum + p.returnEuro, 0);
  const realSavings = income - expenses;
  return {
    income,
    expenses,
    realSavings,
    savingsPercentage: safeDivide(realSavings, income) * 100,
    investmentContributions,
    totalProductValue,
    totalReturnEuro,
    totalReturnPercentage: safeDivide(totalReturnEuro, totalContributed) * 100,
    estimatedNetWorth: totalProductValue,
  };
};

export const monthlySeries = (data: AppData, year: number) => Array.from({ length: 12 }, (_, index) => {
  const month = index + 1;
  const summary = getSummary(data, year, month);
  return { month, ...summary };
});

export const categoryTotals = (data: AppData, year: number, month: number) =>
  data.categories.map((category) => ({
    id: category.id,
    name: category.name,
    total: data.movements
      .filter((m) => m.year === year && m.month === month && m.type === 'gasto' && m.categoryId === category.id)
      .reduce((sum, m) => sum + m.amount, 0),
  })).filter((item) => item.total > 0);

export const productDistribution = (data: AppData, year: number, month: number) => {
  const total = data.products.reduce((sum, p) => sum + (latestRecordForProduct(data.monthlyRecords, p.id, year, month)?.marketValue ?? p.initialCapital), 0);
  return data.products.map((product) => {
    const record = latestRecordForProduct(data.monthlyRecords, product.id, year, month);
    const value = record?.marketValue ?? product.initialCapital;
    return { product, value, weight: safeDivide(value, total) * 100, record };
  });
};

export const groupTotals = (data: AppData, year: number, month: number) => {
  const expenseTotal = categoryTotals(data, year, month).reduce((sum, c) => sum + c.total, 0);
  const productTotal = productDistribution(data, year, month).reduce((sum, p) => sum + p.value, 0);
  return data.groups.map((group) => {
    const total = group.type === 'categoria'
      ? data.movements.filter((m) => m.year === year && m.month === month && m.type === 'gasto' && group.itemIds.includes(m.categoryId)).reduce((sum, m) => sum + m.amount, 0)
      : productDistribution(data, year, month).filter((p) => group.itemIds.includes(p.product.id)).reduce((sum, p) => sum + p.value, 0);
    const base = group.type === 'categoria' ? expenseTotal : productTotal;
    return { group, total, percentage: safeDivide(total, base) * 100 };
  });
};

export const calculateRecord = (record: MonthlyProductRecord): MonthlyProductRecord => {
  const netContributed = record.totalContributed;
  const returnEuro = record.marketValue - netContributed;
  return { ...record, returnEuro, returnPercentage: safeDivide(returnEuro, netContributed) * 100 };
};

export const productLabel = (product?: FinancialProduct) => product ? `${product.name} (${product.entity})` : 'Sin producto';

export const buildAlerts = (data: AppData, year: number, month: number) => {
  const current = getSummary(data, year, month);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const previous = getSummary(data, prevYear, prevMonth);
  const alerts: string[] = [];
  if (current.expenses > previous.expenses && previous.expenses > 0) alerts.push('Los gastos superan los del mes anterior.');
  if (current.realSavings < previous.realSavings && previous.income > 0) alerts.push('El ahorro neto ha bajado respecto al mes anterior.');
  data.goals.filter((g) => g.enabled && g.type === 'limite_categoria' && g.categoryId).forEach((goal) => {
    const spent = data.movements.filter((m) => m.year === year && m.month === month && m.type === 'gasto' && m.categoryId === goal.categoryId).reduce((sum, m) => sum + m.amount, 0);
    if (spent > goal.amount) alerts.push(`La categoría con límite "${goal.name}" supera el objetivo.`);
  });
  data.products.forEach((product) => {
    const now = latestRecordForProduct(data.monthlyRecords, product.id, year, month);
    const prev = latestRecordForProduct(data.monthlyRecords, product.id, prevYear, prevMonth);
    if (now && prev && now.marketValue < prev.marketValue) alerts.push(`${product.name} baja de valor respecto al mes anterior.`);
  });
  productDistribution(data, year, month).forEach(({ product, weight }) => {
    if (weight > data.settings.maxProductWeightPercentage) alerts.push(`${product.name} pesa demasiado sobre el total (${weight.toFixed(1)}%).`);
  });
  const emergencyGoal = data.goals.find((g) => g.enabled && g.type === 'fondo_emergencia');
  if (emergencyGoal) {
    const emergencyValue = productDistribution(data, year, month).filter((p) => data.settings.emergencyFundProductIds.includes(p.product.id)).reduce((sum, p) => sum + p.value, 0);
    if (emergencyValue < emergencyGoal.amount) alerts.push('El fondo de emergencia está por debajo del mínimo definido.');
  }
  return alerts;
};

export const validationWarnings = (data: AppData, year = data.settings.selectedYear, month = data.settings.selectedMonth) => {
  const warnings: string[] = [];
  data.movements.forEach((m) => {
    if (!Number.isFinite(m.amount) || m.amount === 0) warnings.push(`Movimiento "${m.concept}" con importe vacío o cero.`);
    if (m.amount < 0) warnings.push(`Movimiento "${m.concept}" tiene importe negativo; usa el tipo correcto y valor positivo.`);
    if (!m.categoryId) warnings.push(`Movimiento "${m.concept}" sin categoría.`);
    if (m.type === 'ahorro') warnings.push(`El movimiento de ahorro "${m.concept}" se trata como asignación interna: no suma patrimonio por sí mismo.`);
    if (m.type === 'aportacion_inversion' && !m.accountOrProductId) warnings.push(`La aportación a inversión "${m.concept}" no tiene producto asociado.`);
    if (m.type === 'traspaso') warnings.push(`Revisa el traspaso "${m.concept}": no se incluye en ahorro ni patrimonio para evitar duplicidades.`);
  });
  const keys = new Set<string>();
  data.products.forEach((product) => {
    if (!latestRecordForProduct(data.monthlyRecords, product.id, year, month)) warnings.push(`${product.name} no tiene valor mensual hasta el periodo seleccionado; se usa su capital inicial como estimación.`);
  });
  data.monthlyRecords.forEach((r) => {
    const key = `${r.productId}-${r.year}-${r.month}`;
    if (keys.has(key)) warnings.push('Hay meses duplicados para un producto financiero.');
    keys.add(key);
    if (!Number.isFinite(r.marketValue)) warnings.push('Hay un producto sin valor mensual válido.');
    if (r.totalContributed < 0 || r.marketValue < 0) warnings.push('Hay registros de producto con importes negativos.');
  });
  return [...new Set(warnings)];
};
