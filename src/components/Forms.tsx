import type React from 'react';
import { Category, FinancialProduct, Goal, Movement, MovementType, MonthlyProductRecord } from '../types/finance';
import { calculateRecord } from '../utils/calculations';
import { uid } from '../utils/format';

export const MovementForm = ({ categories, products, onAdd }: { categories: Category[]; products: FinancialProduct[]; onAdd: (movement: Movement) => void }) => {
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const date = String(form.get('date'));
    const parsed = new Date(`${date}T00:00:00`);
    onAdd({
      id: uid('mov'), date, month: parsed.getMonth() + 1, year: parsed.getFullYear(),
      concept: String(form.get('concept')), amount: Number(form.get('amount')), type: String(form.get('type')) as MovementType,
      categoryId: String(form.get('categoryId')), subcategoryId: String(form.get('subcategoryId') || ''),
      accountOrProductId: String(form.get('accountOrProductId') || ''), comment: String(form.get('comment') || ''),
    });
    event.currentTarget.reset();
  };
  return <form className="grid-form" onSubmit={submit}>
    <input name="date" type="date" required />
    <input name="concept" placeholder="Concepto" required />
    <input name="amount" type="number" min="0.01" step="0.01" placeholder="Importe" required />
    <select name="type" defaultValue="gasto"><option value="ingreso">Ingreso</option><option value="gasto">Gasto</option><option value="ahorro">Ahorro</option><option value="aportacion_inversion">Aportación inversión</option><option value="traspaso">Traspaso</option></select>
    <select name="categoryId" required>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
    <select name="subcategoryId"><option value="">Subcategoría</option>{categories.flatMap((c) => c.subcategories.map((s) => <option key={s.id} value={s.id}>{c.name} · {s.name}</option>))}</select>
    <select name="accountOrProductId"><option value="">Cuenta/producto</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
    <input name="comment" placeholder="Comentario" />
    <button type="submit">Añadir movimiento</button>
  </form>;
};

export const ProductRecordForm = ({ products, records, onAdd }: { products: FinancialProduct[]; records: MonthlyProductRecord[]; onAdd: (record: MonthlyProductRecord) => void }) => {
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const productId = String(form.get('productId'));
    const month = Number(form.get('month'));
    const year = Number(form.get('year'));
    const monthlyContribution = Number(form.get('monthlyContribution') || 0);
    const monthlyWithdrawal = Number(form.get('monthlyWithdrawal') || 0);
    const previous = records
      .filter((record) => record.productId === productId && (record.year < year || (record.year === year && record.month < month)))
      .sort((a, b) => (b.year - a.year) || (b.month - a.month))[0];
    const product = products.find((item) => item.id === productId);
    const manualTotal = Number(form.get('totalContributed') || 0);
    const baseContributed = previous?.totalContributed ?? product?.initialCapital ?? 0;
    const record = calculateRecord({
      id: uid('rec'), productId, month, year, monthlyContribution, monthlyWithdrawal,
      totalContributed: manualTotal || Math.max(baseContributed + monthlyContribution - monthlyWithdrawal, 0), marketValue: Number(form.get('marketValue') || 0),
      returnEuro: 0, returnPercentage: 0, comment: String(form.get('comment') || ''),
    });
    onAdd(record);
    event.currentTarget.reset();
  };
  return <form className="grid-form" onSubmit={submit}>
    <select name="productId" required>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
    <input name="month" type="number" min="1" max="12" placeholder="Mes" required />
    <input name="year" type="number" min="2000" placeholder="Año" required />
    <input name="monthlyContribution" type="number" min="0" step="0.01" placeholder="Aportación mes" />
    <input name="monthlyWithdrawal" type="number" min="0" step="0.01" placeholder="Retiradas mes" />
    <input name="totalContributed" type="number" min="0" step="0.01" placeholder="Capital aportado total (auto si vacío)" />
    <input name="marketValue" type="number" min="0" step="0.01" placeholder="Valor mercado" required />
    <input name="comment" placeholder="Comentario" />
    <button type="submit">Guardar seguimiento</button>
  </form>;
};

export const GoalForm = ({ categories, onAdd }: { categories: Category[]; onAdd: (goal: Goal) => void }) => {
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onAdd({ id: uid('goal'), name: String(form.get('name')), type: String(form.get('type')) as Goal['type'], amount: Number(form.get('amount')), categoryId: String(form.get('categoryId') || ''), enabled: true });
    event.currentTarget.reset();
  };
  return <form className="grid-form" onSubmit={submit}>
    <input name="name" placeholder="Nombre del objetivo" required />
    <select name="type"><option value="ahorro_mensual">Ahorro mensual</option><option value="inversion_mensual">Inversión mensual</option><option value="limite_categoria">Límite por categoría</option><option value="fondo_emergencia">Fondo emergencia</option><option value="patrimonio">Patrimonio</option><option value="inversion_largo_plazo">Inversión largo plazo</option></select>
    <input name="amount" type="number" min="0" step="0.01" placeholder="Importe objetivo" required />
    <select name="categoryId"><option value="">Categoría si aplica</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
    <button type="submit">Añadir objetivo</button>
  </form>;
};
