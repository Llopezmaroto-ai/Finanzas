import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { DonutList, MiniBarChart, palette } from './components/Charts';
import { GoalForm, MovementForm, ProductRecordForm } from './components/Forms';
import { StatCard } from './components/StatCard';
import { loadData, saveData, clearData, resetWithSampleData, validateBackup } from './services/db';
import { exportAllCsv, exportBackupJson } from './services/export';
import { AppData, Category, CustomGroup, FinancialProduct } from './types/finance';
import { buildAlerts, categoryTotals, getSummary, groupTotals, monthlySeries, productDistribution, validationWarnings } from './utils/calculations';
import { formatCurrency, formatPercent, MONTHS, uid } from './utils/format';

type Section = 'dashboard' | 'movimientos' | 'categorias' | 'productos' | 'seguimiento' | 'agrupaciones' | 'objetivos' | 'informes' | 'configuracion' | 'importar-exportar';
const sections: { id: Section; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' }, { id: 'movimientos', label: 'Movimientos' }, { id: 'categorias', label: 'Categorías' },
  { id: 'productos', label: 'Productos financieros' }, { id: 'seguimiento', label: 'Seguimiento mensual' }, { id: 'agrupaciones', label: 'Agrupaciones' },
  { id: 'objetivos', label: 'Objetivos' }, { id: 'informes', label: 'Informes' }, { id: 'configuracion', label: 'Configuración' }, { id: 'importar-exportar', label: 'Importar/exportar' },
];

export const App = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [section, setSection] = useState<Section>('dashboard');
  const [message, setMessage] = useState('');

  useEffect(() => { loadData().then(setData).catch((error) => setMessage(error.message)); }, []);
  useEffect(() => { if (data) saveData(data).catch((error) => setMessage(`No se pudo guardar en IndexedDB: ${error.message}`)); }, [data]);

  const selected = data?.settings ?? { selectedMonth: new Date().getMonth() + 1, selectedYear: new Date().getFullYear(), sampleDataLoaded: false, emergencyFundProductIds: [], maxProductWeightPercentage: 45 };
  const summary = useMemo(() => data ? getSummary(data, selected.selectedYear, selected.selectedMonth) : null, [data, selected.selectedMonth, selected.selectedYear]);
  const previousSummary = useMemo(() => data ? getSummary(data, selected.selectedMonth === 1 ? selected.selectedYear - 1 : selected.selectedYear, selected.selectedMonth === 1 ? 12 : selected.selectedMonth - 1) : null, [data, selected.selectedMonth, selected.selectedYear]);

  if (!data || !summary || !previousSummary) return <main className="loading"><span>💶</span> Cargando finanzas privadas…</main>;

  const update = (patch: Partial<AppData>) => setData({ ...data, ...patch });
  const monthName = MONTHS[selected.selectedMonth - 1];
  const series = monthlySeries(data, selected.selectedYear);
  const alerts = buildAlerts(data, selected.selectedYear, selected.selectedMonth);
  const warnings = validationWarnings(data, selected.selectedYear, selected.selectedMonth);
  const productsDistribution = productDistribution(data, selected.selectedYear, selected.selectedMonth);
  const categoriesDistribution = categoryTotals(data, selected.selectedYear, selected.selectedMonth);

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-icon">💶</span><div><strong>Finanzas</strong><span>Local · Privado</span></div></div>
      <nav>{sections.map((item) => <button className={section === item.id ? 'active' : ''} key={item.id} onClick={() => setSection(item.id)}>{item.label}</button>)}</nav>
      <div className="period-card">
        <label>Mes<select value={selected.selectedMonth} onChange={(e) => setData({ ...data, settings: { ...data.settings, selectedMonth: Number(e.target.value) } })}>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select></label>
        <label>Año<input type="number" value={selected.selectedYear} onChange={(e) => setData({ ...data, settings: { ...data.settings, selectedYear: Number(e.target.value) } })} /></label>
      </div>
    </aside>
    <main className="content">
      <header className="topbar"><div><p>Resumen de {monthName} {selected.selectedYear}</p><h1>{sections.find((s) => s.id === section)?.label}</h1></div><span className="privacy">Sin backend · IndexedDB local · Exportación manual</span></header>
      {message && <div className="notice">{message}<button onClick={() => setMessage('')}>Cerrar</button></div>}
      {section === 'dashboard' && <Dashboard data={data} summary={summary} previousSummary={previousSummary} series={series} alerts={alerts} warnings={warnings} productsDistribution={productsDistribution} categoriesDistribution={categoriesDistribution} />}
      {section === 'movimientos' && <Movements data={data} update={update} />}
      {section === 'categorias' && <Categories data={data} update={update} />}
      {section === 'productos' && <Products data={data} update={update} />}
      {section === 'seguimiento' && <Tracking data={data} update={update} />}
      {section === 'agrupaciones' && <Groups data={data} update={update} />}
      {section === 'objetivos' && <Goals data={data} update={update} summary={summary} />}
      {section === 'informes' && <Reports data={data} summary={summary} />}
      {section === 'configuracion' && <Settings data={data} setData={setData} />}
      {section === 'importar-exportar' && <ImportExport data={data} setData={setData} setMessage={setMessage} />}
    </main>
  </div>;
};

const Dashboard = ({ data, summary, previousSummary, series, alerts, warnings, productsDistribution, categoriesDistribution }: any) => <section className="stack">
  <div className="stats-grid">
    <StatCard title="Ingresos del mes" value={formatCurrency(summary.income)} detail={`Mes anterior: ${formatCurrency(previousSummary.income)}`} tone="good" />
    <StatCard title="Gastos del mes" value={formatCurrency(summary.expenses)} detail={`Mes anterior: ${formatCurrency(previousSummary.expenses)}`} tone={summary.expenses > previousSummary.expenses ? 'bad' : 'neutral'} />
    <StatCard title="Ahorro neto" value={formatCurrency(summary.realSavings)} detail={formatPercent(summary.savingsPercentage)} tone={summary.realSavings >= 0 ? 'good' : 'bad'} />
    <StatCard title="Aportado a inversiones" value={formatCurrency(summary.investmentContributions)} detail="No computa como gasto real" tone="info" />
    <StatCard title="Valor productos" value={formatCurrency(summary.totalProductValue)} detail="Último valor registrado" />
    <StatCard title="Rentabilidad total" value={formatCurrency(summary.totalReturnEuro)} detail={formatPercent(summary.totalReturnPercentage)} tone={summary.totalReturnEuro >= 0 ? 'good' : 'bad'} />
    <StatCard title="Patrimonio estimado" value={formatCurrency(summary.estimatedNetWorth)} detail="Efectivo + ahorro + inversión" tone="info" />
    <StatCard title="Comparación ahorro" value={formatCurrency(summary.realSavings - previousSummary.realSavings)} detail="Frente al mes anterior" />
  </div>
  <div className="alerts-grid"><Panel title="Alertas informativas" items={alerts} icon={<span>⚠️</span>} /><Panel title="Validaciones" items={warnings.slice(0, 8)} icon={<span>⚠️</span>} /></div>
  <div className="charts-grid">
    <MiniBarChart title="Evolución mensual de ingresos" data={series.map((s: any) => ({ label: MONTHS[s.month - 1].slice(0, 3), value: s.income }))} color="#16a34a" />
    <MiniBarChart title="Evolución mensual de gastos" data={series.map((s: any) => ({ label: MONTHS[s.month - 1].slice(0, 3), value: s.expenses }))} color="#dc2626" />
    <MiniBarChart title="Evolución mensual del ahorro" data={series.map((s: any) => ({ label: MONTHS[s.month - 1].slice(0, 3), value: Math.max(s.realSavings, 0) }))} color="#2563eb" />
    <MiniBarChart title="Evolución del patrimonio" data={series.map((s: any) => ({ label: MONTHS[s.month - 1].slice(0, 3), value: s.estimatedNetWorth }))} color="#7c3aed" />
    <DonutList title="Distribución de gastos por categoría" data={categoriesDistribution.map((c: any, i: number) => ({ label: c.name, value: c.total, color: palette[i % palette.length] }))} />
    <DonutList title="Distribución de productos financieros" data={productsDistribution.map((p: any, i: number) => ({ label: p.product.name, value: p.value, color: palette[i % palette.length] }))} />
    <MiniBarChart title="Evolución de rentabilidad" data={series.map((s: any) => ({ label: MONTHS[s.month - 1].slice(0, 3), value: Math.max(s.totalReturnEuro, 0) }))} color="#0f766e" />
  </div>
  <GroupSummary data={data} />
</section>;

const Panel = ({ title, items, icon }: { title: string; items: string[]; icon: React.ReactNode }) => <div className="panel"><h3>{icon}{title}</h3>{items.length ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="muted">Sin avisos.</p>}</div>;

const Movements = ({ data, update }: { data: AppData; update: (patch: Partial<AppData>) => void }) => <section className="stack">
  <h2>Registrar movimiento mensual</h2><MovementForm categories={data.categories} products={data.products} onAdd={(movement) => update({ movements: [movement, ...data.movements] })} />
  <DataTable headers={['Fecha', 'Concepto', 'Tipo', 'Categoría', 'Producto', 'Importe', 'Comentario']} rows={data.movements.map((m) => [m.date, m.concept, m.type, data.categories.find((c) => c.id === m.categoryId)?.name ?? 'Sin categoría', data.products.find((p) => p.id === m.accountOrProductId)?.name ?? '-', formatCurrency(m.amount), m.comment ?? ''])} onDelete={(index) => update({ movements: data.movements.filter((_, i) => i !== index) })} />
</section>;

const Categories = ({ data, update }: { data: AppData; update: (patch: Partial<AppData>) => void }) => {
  const add = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); update({ categories: [...data.categories, { id: uid('cat'), name: String(form.get('name')), subcategories: String(form.get('subcategories')).split(',').filter(Boolean).map((name) => ({ id: uid('sub'), name: name.trim() })) }] }); event.currentTarget.reset(); };
  return <section className="stack"><h2>Categorías editables</h2><form className="inline-form" onSubmit={add}><input name="name" placeholder="Nueva categoría" required /><input name="subcategories" placeholder="Subcategorías separadas por coma" /><button>Añadir</button></form><div className="card-grid">{data.categories.map((category) => <article className="entity-card" key={category.id}><input value={category.name} onChange={(e) => update({ categories: data.categories.map((c) => c.id === category.id ? { ...c, name: e.target.value } : c) })} /><p>{category.subcategories.map((s) => s.name).join(' · ') || 'Sin subcategorías'}</p><button className="danger" onClick={() => { if (data.movements.some((m) => m.categoryId === category.id) || data.groups.some((g) => g.itemIds.includes(category.id))) { window.alert('No se puede eliminar: la categoría está usada por movimientos o agrupaciones.'); return; } update({ categories: data.categories.filter((c) => c.id !== category.id) }); }}>Eliminar</button></article>)}</div></section>;
};

const Products = ({ data, update }: { data: AppData; update: (patch: Partial<AppData>) => void }) => {
  const add = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const f = new FormData(event.currentTarget); const product: FinancialProduct = { id: uid('prod'), name: String(f.get('name')), type: f.get('type') as any, entity: String(f.get('entity')), identifier: String(f.get('identifier') || ''), risk: f.get('risk') as any, goal: f.get('goal') as any, initialCapital: Number(f.get('initialCapital') || 0), comment: String(f.get('comment') || '') }; update({ products: [...data.products, product] }); event.currentTarget.reset(); };
  return <section className="stack"><h2>Productos financieros</h2><form className="grid-form" onSubmit={add}><input name="name" placeholder="Nombre" required /><select name="type"><option value="cuenta_remunerada">Cuenta remunerada</option><option value="fondo_monetario">Fondo monetario</option><option value="fondo_indexado">Fondo indexado</option><option value="etf">ETF</option><option value="acciones">Acciones</option><option value="efectivo">Efectivo</option><option value="otro">Otro</option></select><input name="entity" placeholder="Entidad" required /><input name="identifier" placeholder="ISIN/identificador" /><select name="risk"><option value="bajo">Bajo</option><option value="medio">Medio</option><option value="alto">Alto</option></select><select name="goal"><option value="colchon_seguridad">Colchón seguridad</option><option value="ahorro_conservador">Ahorro conservador</option><option value="inversion_largo_plazo">Inversión largo plazo</option><option value="otro">Otro</option></select><input name="initialCapital" type="number" min="0" step="0.01" placeholder="Capital inicial" /><input name="comment" placeholder="Comentario" /><button>Añadir producto</button></form><div className="card-grid">{data.products.map((p) => <article className="entity-card" key={p.id}><h3>{p.name}</h3><p>{p.entity} · {p.type} · riesgo {p.risk}</p><strong>{formatCurrency(p.initialCapital)}</strong><small>{p.identifier || 'Sin identificador'} · {p.goal}</small><button className="danger" onClick={() => { if (data.movements.some((m) => m.accountOrProductId === p.id) || data.monthlyRecords.some((r) => r.productId === p.id) || data.groups.some((g) => g.itemIds.includes(p.id))) { window.alert('No se puede eliminar: el producto está usado por movimientos, seguimientos o agrupaciones.'); return; } update({ products: data.products.filter((x) => x.id !== p.id), settings: { ...data.settings, emergencyFundProductIds: data.settings.emergencyFundProductIds.filter((id) => id !== p.id) } }); }}>Eliminar</button></article>)}</div></section>;
};

const Tracking = ({ data, update }: { data: AppData; update: (patch: Partial<AppData>) => void }) => <section className="stack"><h2>Seguimiento mensual de productos</h2><ProductRecordForm products={data.products} records={data.monthlyRecords} onAdd={(record) => update({ monthlyRecords: [record, ...data.monthlyRecords.filter((r) => !(r.productId === record.productId && r.year === record.year && r.month === record.month))] })} /><DataTable headers={['Producto', 'Mes', 'Año', 'Aportación', 'Retirada', 'Capital aportado', 'Valor mercado', 'Rent. €', 'Rent. %']} rows={data.monthlyRecords.map((r) => [data.products.find((p) => p.id === r.productId)?.name ?? 'Producto eliminado', MONTHS[r.month - 1], r.year, formatCurrency(r.monthlyContribution), formatCurrency(r.monthlyWithdrawal), formatCurrency(r.totalContributed), formatCurrency(r.marketValue), formatCurrency(r.returnEuro), formatPercent(r.returnPercentage)])} onDelete={(index) => update({ monthlyRecords: data.monthlyRecords.filter((_, i) => i !== index) })} /></section>;

const Groups = ({ data, update }: { data: AppData; update: (patch: Partial<AppData>) => void }) => {
  const add = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const f = new FormData(event.currentTarget); const type = String(f.get('type')) as CustomGroup['type']; const itemIds = Array.from(f.getAll('itemIds')).map(String); update({ groups: [...data.groups, { id: uid('grp'), name: String(f.get('name')), type, itemIds }] }); };
  return <section className="stack"><h2>Agrupaciones personalizadas</h2><form className="group-form" onSubmit={add}><input name="name" placeholder="Nombre del grupo" required /><select name="type"><option value="categoria">Categorías</option><option value="producto">Productos</option></select><div className="checkbox-grid">{[...data.categories.map((c) => ({ id: c.id, label: c.name })), ...data.products.map((p) => ({ id: p.id, label: p.name }))].map((item) => <label key={item.id}><input type="checkbox" name="itemIds" value={item.id} />{item.label}</label>)}</div><button>Crear agrupación</button></form><GroupSummary data={data} /><div className="card-grid">{data.groups.map((g) => <article className="entity-card" key={g.id}><h3>{g.name}</h3><p>{g.type} · {g.itemIds.length} elementos</p><button className="danger" onClick={() => update({ groups: data.groups.filter((x) => x.id !== g.id) })}>Eliminar</button></article>)}</div></section>;
};

const GroupSummary = ({ data }: { data: AppData }) => <div className="panel"><h3>Totales por agrupación</h3><div className="table-wrap"><table><tbody>{groupTotals(data, data.settings.selectedYear, data.settings.selectedMonth).map(({ group, total, percentage }) => <tr key={group.id}><td>{group.name}</td><td>{group.type}</td><td>{formatCurrency(total)}</td><td>{formatPercent(percentage)}</td></tr>)}</tbody></table></div></div>;

const Goals = ({ data, update, summary }: { data: AppData; update: (patch: Partial<AppData>) => void; summary: any }) => <section className="stack"><h2>Objetivos y comparación real</h2><GoalForm categories={data.categories} onAdd={(goal) => update({ goals: [...data.goals, goal] })} /><div className="card-grid">{data.goals.map((goal) => { const real = goal.type === 'ahorro_mensual' ? summary.realSavings : goal.type === 'inversion_mensual' ? summary.investmentContributions : goal.type === 'patrimonio' ? summary.estimatedNetWorth : goal.type === 'limite_categoria' ? data.movements.filter((m) => m.year === data.settings.selectedYear && m.month === data.settings.selectedMonth && m.categoryId === goal.categoryId && m.type === 'gasto').reduce((s, m) => s + m.amount, 0) : summary.totalProductValue; return <article className="entity-card" key={goal.id}><h3>{goal.name}</h3><p>{goal.type}</p><progress max={goal.amount || 1} value={Math.min(real, goal.amount || 1)} /><strong>{formatCurrency(real)} / {formatCurrency(goal.amount)}</strong><button className="danger" onClick={() => update({ goals: data.goals.filter((g) => g.id !== goal.id) })}>Eliminar</button></article>; })}</div></section>;

const Reports = ({ data, summary }: { data: AppData; summary: any }) => <section className="stack"><h2>Informe mensual</h2><div className="report-grid"><ReportBlock title="Ingresos" value={summary.income} /><ReportBlock title="Gastos" value={summary.expenses} /><ReportBlock title="Ahorro" value={summary.realSavings} detail={formatPercent(summary.savingsPercentage)} /><ReportBlock title="Inversiones" value={summary.investmentContributions} /><ReportBlock title="Patrimonio" value={summary.estimatedNetWorth} /><ReportBlock title="Rentabilidad" value={summary.totalReturnEuro} detail={formatPercent(summary.totalReturnPercentage)} /></div><GroupSummary data={data} /><h2>Resumen anual {data.settings.selectedYear}</h2><DataTable headers={['Mes', 'Ingresos', 'Gastos', 'Ahorro', '% ahorro', 'Patrimonio', 'Rentabilidad']} rows={monthlySeries(data, data.settings.selectedYear).map((s) => [MONTHS[s.month - 1], formatCurrency(s.income), formatCurrency(s.expenses), formatCurrency(s.realSavings), formatPercent(s.savingsPercentage), formatCurrency(s.estimatedNetWorth), formatCurrency(s.totalReturnEuro)])} /></section>;
const ReportBlock = ({ title, value, detail }: { title: string; value: number; detail?: string }) => <div className="report-block"><span>{title}</span><strong>{formatCurrency(value)}</strong>{detail && <small>{detail}</small>}</div>;

const Settings = ({ data, setData }: { data: AppData; setData: (d: AppData) => void }) => <section className="stack"><h2>Configuración</h2><div className="panel"><label>Concentración máxima por producto (%)<input type="number" min="1" max="100" value={data.settings.maxProductWeightPercentage} onChange={(e) => setData({ ...data, settings: { ...data.settings, maxProductWeightPercentage: Number(e.target.value) } })} /></label><p className="muted">Datos guardados en IndexedDB del navegador. No se envían datos a servidores externos. Antes de acciones destructivas se descarga una copia JSON de recuperación.</p><ul><li>La app no contiene llamadas fetch ni endpoints externos.</li><li>El patrimonio se calcula desde productos, no sumando movimientos, para evitar duplicar traspasos o aportaciones.</li><li>Si un producto no tiene seguimiento mensual, se usa su capital inicial y se muestra una validación.</li></ul><button onClick={async () => { if (!window.confirm('Se reemplazarán tus datos actuales por datos de ejemplo. Se descargará antes una copia JSON.')) return; exportBackupJson(data); setData(await resetWithSampleData()); }}>Restaurar datos de ejemplo</button><button className="danger" onClick={async () => { if (!window.confirm('Se borrarán movimientos, seguimientos, agrupaciones y objetivos. Se descargará antes una copia JSON.')) return; exportBackupJson(data); setData(await clearData()); }}>Borrar datos de ejemplo y registros</button></div></section>;

const ImportExport = ({ data, setData, setMessage }: { data: AppData; setData: (d: AppData) => void; setMessage: (m: string) => void }) => {
  const importFile = async (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; try { const imported = validateBackup(JSON.parse(await file.text())); if (!window.confirm('Importar reemplazará los datos actuales. Se descargará antes una copia JSON de recuperación. ¿Continuar?')) return; exportBackupJson(data); setData(imported); setMessage('Copia de seguridad importada correctamente.'); } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo importar el archivo.'); } finally { event.target.value = ''; } };
  return <section className="stack"><h2>Importar y exportar datos</h2><div className="actions"><button onClick={() => exportBackupJson(data)}><span>⬇️</span> Exportar copia JSON</button><button onClick={() => exportAllCsv(data)}><span>⬇️</span> Exportar CSV</button><label className="upload"><span>⬆️</span> Importar JSON<input type="file" accept="application/json" onChange={importFile} /></label></div><p className="muted">Guarda el JSON como copia de seguridad privada. El CSV sirve para análisis externo en hojas de cálculo.</p></section>;
};

const DataTable = ({ headers, rows, onDelete }: { headers: string[]; rows: (string | number)[][]; onDelete?: (index: number) => void }) => <div className="table-wrap"><table><thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}{onDelete && <th>Acción</th>}</tr></thead><tbody>{rows.map((row, index) => <tr key={`${index}-${row.join('-')}`}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}{onDelete && <td><button className="danger small" onClick={() => onDelete(index)}>Eliminar</button></td>}</tr>)}</tbody></table></div>;
