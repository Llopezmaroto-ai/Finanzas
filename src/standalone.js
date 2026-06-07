const DB_NAME = 'finanzas-personales-db';
const STORE = 'app-state';
const KEY = 'current';
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const money = (value) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0)}%`;
const uid = (prefix) => `${prefix}-${crypto.randomUUID()}`;

function initialData() {
  const categories = [
    { id: 'cat-vivienda', name: 'Vivienda', subcategories: [{ id: 'sub-alquiler', name: 'Alquiler/Hipoteca' }] },
    { id: 'cat-alimentacion', name: 'Alimentación', subcategories: [{ id: 'sub-supermercado', name: 'Supermercado' }] },
    { id: 'cat-ocio', name: 'Ocio', subcategories: [{ id: 'sub-eventos', name: 'Eventos' }] },
    { id: 'cat-ahorro', name: 'Ahorro', subcategories: [{ id: 'sub-reserva', name: 'Reserva' }] },
    { id: 'cat-inversion', name: 'Inversión', subcategories: [{ id: 'sub-fondos', name: 'Fondos' }] },
    { id: 'cat-otros', name: 'Otros', subcategories: [{ id: 'sub-varios', name: 'Varios' }] },
  ];
  const products = [
    { id: 'prod-demo-cash', name: 'Cuenta Demo A', type: 'cuenta_remunerada', entity: 'Entidad Ficticia A', identifier: 'DEMO-CASH-001', risk: 'bajo', goal: 'colchon_seguridad', initialCapital: 1000, comment: 'Producto ficticio.' },
    { id: 'prod-demo-monetary', name: 'Producto Demo B', type: 'fondo_monetario', entity: 'Entidad Ficticia B', identifier: 'DEMO-MON-002', risk: 'bajo', goal: 'ahorro_conservador', initialCapital: 750, comment: 'Producto ficticio.' },
    { id: 'prod-demo-index', name: 'Producto Demo C', type: 'fondo_indexado', entity: 'Entidad Ficticia C', identifier: 'DEMO-IDX-003', risk: 'medio', goal: 'inversion_largo_plazo', initialCapital: 600, comment: 'Producto ficticio.' },
    { id: 'prod-demo-global', name: 'Producto Demo D', type: 'etf', entity: 'Entidad Ficticia D', identifier: 'DEMO-ETF-004', risk: 'alto', goal: 'inversion_largo_plazo', initialCapital: 900, comment: 'Producto ficticio.' },
  ];
  const base = [[2026, 1, 1200, 420, 120], [2026, 2, 1200, 440, 130], [2026, 3, 1250, 460, 140], [2026, 4, 1250, 430, 140], [2026, 5, 1300, 480, 150], [2026, 6, 1300, 450, 150]];
  const movements = base.flatMap(([year, month, income, housing, invest]) => [
    { id: uid('mov'), date: `${year}-${String(month).padStart(2, '0')}-01`, month, year, concept: 'Ingreso ficticio mensual', amount: income, type: 'ingreso', categoryId: 'cat-otros', accountOrProductId: 'prod-demo-cash' },
    { id: uid('mov'), date: `${year}-${String(month).padStart(2, '0')}-03`, month, year, concept: 'Gasto ficticio de vivienda', amount: housing, type: 'gasto', categoryId: 'cat-vivienda' },
    { id: uid('mov'), date: `${year}-${String(month).padStart(2, '0')}-08`, month, year, concept: 'Compra ficticia de alimentación', amount: 160 + month * 3, type: 'gasto', categoryId: 'cat-alimentacion' },
    { id: uid('mov'), date: `${year}-${String(month).padStart(2, '0')}-15`, month, year, concept: 'Aportación ficticia a inversión', amount: invest, type: 'aportacion_inversion', categoryId: 'cat-inversion', accountOrProductId: month % 2 ? 'prod-demo-index' : 'prod-demo-global' },
  ]);
  const monthlyRecords = products.flatMap((product, idx) => [1, 2, 3, 4, 5, 6].map((month) => {
    const contribution = product.goal === 'inversion_largo_plazo' ? (idx === 2 ? 70 : 80) : idx === 1 ? 60 : 0;
    const totalContributed = product.initialCapital + contribution * month;
    const perf = product.risk === 'alto' ? 0.009 : product.risk === 'medio' ? 0.005 : 0.0015;
    const marketValue = Math.round(totalContributed * (1 + perf * month));
    const returnEuro = marketValue - totalContributed;
    return { id: uid('rec'), productId: product.id, month, year: 2026, monthlyContribution: contribution, monthlyWithdrawal: 0, totalContributed, marketValue, returnEuro, returnPercentage: totalContributed ? (returnEuro / totalContributed) * 100 : 0, comment: 'Dato ficticio editable.' };
  }));
  return { movements, categories, products, monthlyRecords, groups: [], goals: [], settings: { selectedMonth: 6, selectedYear: 2026, sampleDataLoaded: true, emergencyFundProductIds: ['prod-demo-cash', 'prod-demo-monetary'], maxProductWeightPercentage: 45 } };
}

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.objectStoreNames.contains(STORE) || req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function loadData() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(KEY);
    req.onsuccess = async () => {
      if (req.result) resolve(req.result);
      else { const seeded = initialData(); await saveData(seeded); resolve(seeded); }
    };
    req.onerror = () => reject(req.error);
  });
}
async function saveData(data) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(data, KEY);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}
const latestRecord = (data, productId) => data.monthlyRecords.filter((r) => r.productId === productId).sort((a, b) => b.year - a.year || b.month - a.month)[0];
function summary(data) {
  const { selectedMonth: month, selectedYear: year } = data.settings;
  const movs = data.movements.filter((m) => m.month === month && m.year === year);
  const income = movs.filter((m) => m.type === 'ingreso').reduce((s, m) => s + m.amount, 0);
  const expenses = movs.filter((m) => m.type === 'gasto').reduce((s, m) => s + m.amount, 0);
  const investmentContributions = movs.filter((m) => m.type === 'aportacion_inversion').reduce((s, m) => s + m.amount, 0);
  const productValue = data.products.reduce((s, p) => s + (latestRecord(data, p.id)?.marketValue ?? p.initialCapital), 0);
  const contributed = data.products.reduce((s, p) => s + (latestRecord(data, p.id)?.totalContributed ?? p.initialCapital), 0);
  const returns = data.products.reduce((s, p) => s + (latestRecord(data, p.id)?.returnEuro ?? 0), 0);
  const realSavings = income - expenses;
  return { income, expenses, investmentContributions, productValue, returns, realSavings, savingsPercentage: income ? realSavings / income * 100 : 0, returnPercentage: contributed ? returns / contributed * 100 : 0 };
}
function download(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click(); URL.revokeObjectURL(url);
}
function render(data) {
  const s = summary(data);
  const app = document.querySelector('#root');
  app.innerHTML = `<div class="app-shell"><aside class="sidebar"><div class="brand"><span class="brand-icon">💶</span><div><strong>Finanzas</strong><span>Local · Privado</span></div></div><nav><button class="active">Dashboard</button><button>Movimientos</button><button>Productos financieros</button><button>Importar/exportar</button></nav><div class="period-card"><label>Mes<select id="month">${MONTHS.map((m, i) => `<option value="${i + 1}" ${i + 1 === data.settings.selectedMonth ? 'selected' : ''}>${m}</option>`).join('')}</select></label><label>Año<input id="year" type="number" value="${data.settings.selectedYear}"></label></div></aside><main class="content"><header class="topbar"><div><p>Resumen de ${MONTHS[data.settings.selectedMonth - 1]} ${data.settings.selectedYear}</p><h1>Dashboard</h1></div><span class="privacy">Sin backend · IndexedDB local · Exportación manual</span></header><section class="stack"><div class="stats-grid"><article class="stat-card good"><span>Ingresos del mes</span><strong>${money(s.income)}</strong></article><article class="stat-card"><span>Gastos del mes</span><strong>${money(s.expenses)}</strong></article><article class="stat-card ${s.realSavings >= 0 ? 'good' : 'bad'}"><span>Ahorro neto</span><strong>${money(s.realSavings)}</strong><small>${pct(s.savingsPercentage)}</small></article><article class="stat-card info"><span>Aportado a inversiones</span><strong>${money(s.investmentContributions)}</strong><small>No computa como gasto real</small></article><article class="stat-card info"><span>Valor productos</span><strong>${money(s.productValue)}</strong></article><article class="stat-card"><span>Rentabilidad total</span><strong>${money(s.returns)}</strong><small>${pct(s.returnPercentage)}</small></article></div><div class="charts-grid"><div class="chart-card"><h3>Productos financieros</h3><div class="donut-list">${data.products.map((p) => `<div class="donut-row"><span class="dot"></span><span>${p.name}</span><strong>${money(latestRecord(data, p.id)?.marketValue ?? p.initialCapital)}</strong><small>${p.risk}</small></div>`).join('')}</div></div><div class="chart-card"><h3>Movimientos recientes</h3><div class="table-wrap"><table><tbody>${data.movements.slice(0, 10).map((m) => `<tr><td>${m.date}</td><td>${m.concept}</td><td>${m.type}</td><td>${money(m.amount)}</td></tr>`).join('')}</tbody></table></div></div></div><div class="actions"><button id="json">⬇️ Exportar copia JSON</button><button id="csv">⬇️ Exportar CSV</button><label class="upload">⬆️ Importar JSON<input id="import" type="file" accept="application/json"></label><button id="reset" class="danger">Restaurar demo</button></div></section></main></div>`;
  document.querySelector('#month').onchange = async (e) => { data.settings.selectedMonth = Number(e.target.value); await saveData(data); render(data); };
  document.querySelector('#year').onchange = async (e) => { data.settings.selectedYear = Number(e.target.value); await saveData(data); render(data); };
  document.querySelector('#json').onclick = () => download(JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), ...data }, null, 2), 'finanzas-backup.json', 'application/json');
  document.querySelector('#csv').onclick = () => download(data.movements.map((m) => [m.date, m.concept, m.type, m.amount].join(',')).join('\n'), 'finanzas-movimientos.csv', 'text/csv;charset=utf-8');
  document.querySelector('#reset').onclick = async () => { if (confirm('Restaurar datos ficticios de demostración?')) { data = initialData(); await saveData(data); render(data); } };
  document.querySelector('#import').onchange = async (e) => { const file = e.target.files?.[0]; if (!file) return; data = JSON.parse(await file.text()); await saveData(data); render(data); };
}
loadData().then(render).catch((error) => { document.querySelector('#root').textContent = `No se pudo cargar la app: ${error.message}`; });
