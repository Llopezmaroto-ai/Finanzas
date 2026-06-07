import { AppData, Category, CustomGroup, FinancialProduct, Goal, MonthlyProductRecord, Movement } from '../types/finance';
import { uid } from '../utils/format';

export const createInitialData = (): AppData => {
  const categories: Category[] = [
    { id: 'cat-vivienda', name: 'Vivienda', subcategories: [{ id: 'sub-alquiler', name: 'Alquiler/Hipoteca' }, { id: 'sub-suministros', name: 'Suministros' }] },
    { id: 'cat-alimentacion', name: 'Alimentación', subcategories: [{ id: 'sub-supermercado', name: 'Supermercado' }, { id: 'sub-restaurantes', name: 'Restaurantes' }] },
    { id: 'cat-transporte', name: 'Transporte', subcategories: [{ id: 'sub-combustible', name: 'Combustible' }, { id: 'sub-publico', name: 'Transporte público' }] },
    { id: 'cat-ocio', name: 'Ocio', subcategories: [{ id: 'sub-eventos', name: 'Eventos' }] },
    { id: 'cat-salud', name: 'Salud', subcategories: [{ id: 'sub-farmacia', name: 'Farmacia' }] },
    { id: 'cat-mascota', name: 'Mascota', subcategories: [{ id: 'sub-veterinario', name: 'Veterinario' }] },
    { id: 'cat-formacion', name: 'Formación', subcategories: [{ id: 'sub-cursos', name: 'Cursos' }] },
    { id: 'cat-viajes', name: 'Viajes', subcategories: [{ id: 'sub-hoteles', name: 'Hoteles' }] },
    { id: 'cat-suscripciones', name: 'Suscripciones', subcategories: [{ id: 'sub-streaming', name: 'Streaming' }] },
    { id: 'cat-ahorro', name: 'Ahorro', subcategories: [{ id: 'sub-colchon', name: 'Colchón' }] },
    { id: 'cat-inversion', name: 'Inversión', subcategories: [{ id: 'sub-fondos', name: 'Fondos' }, { id: 'sub-etf', name: 'ETF' }] },
    { id: 'cat-otros', name: 'Otros', subcategories: [{ id: 'sub-varios', name: 'Varios' }] },
  ];

  const products: FinancialProduct[] = [
    { id: 'prod-ing', name: 'ING', type: 'cuenta_remunerada', entity: 'ING', risk: 'bajo', goal: 'colchon_seguridad', initialCapital: 4200, comment: 'Cuenta diaria y fondo de emergencia.' },
    { id: 'prod-groupama', name: 'Groupama Trésorerie', type: 'fondo_monetario', entity: 'MyInvestor', identifier: 'FR0000989626', risk: 'bajo', goal: 'ahorro_conservador', initialCapital: 2500, comment: 'Ahorro conservador de baja volatilidad.' },
    { id: 'prod-indie', name: 'Fondo Indie de MyInvestor', type: 'fondo_indexado', entity: 'MyInvestor', risk: 'medio', goal: 'inversion_largo_plazo', initialCapital: 1800, comment: 'Cartera indexada diversificada.' },
    { id: 'prod-fidelity-world', name: 'Fidelity MSCI World Index Fund P-ACC-EUR', type: 'fondo_indexado', entity: 'Fidelity', identifier: 'IE00BYX5NX33', risk: 'alto', goal: 'inversion_largo_plazo', initialCapital: 3200, comment: 'Exposición global desarrollada.' },
  ];

  const movementBase = [
    [2026, 1, 2450, 910, 450], [2026, 2, 2450, 980, 500], [2026, 3, 2490, 1040, 550],
    [2026, 4, 2490, 930, 550], [2026, 5, 2520, 1120, 600], [2026, 6, 2520, 1015, 600],
  ];
  const movements: Movement[] = movementBase.flatMap(([year, month, income, housing, invest]) => [
    { id: uid('mov'), date: `${year}-${String(month).padStart(2, '0')}-01`, month, year, concept: 'Nómina', amount: income, type: 'ingreso', categoryId: 'cat-otros', subcategoryId: 'sub-varios', accountOrProductId: 'prod-ing' },
    { id: uid('mov'), date: `${year}-${String(month).padStart(2, '0')}-03`, month, year, concept: 'Vivienda y suministros', amount: housing, type: 'gasto', categoryId: 'cat-vivienda', subcategoryId: 'sub-alquiler' },
    { id: uid('mov'), date: `${year}-${String(month).padStart(2, '0')}-08`, month, year, concept: 'Supermercado mensual', amount: 310 + month * 4, type: 'gasto', categoryId: 'cat-alimentacion', subcategoryId: 'sub-supermercado' },
    { id: uid('mov'), date: `${year}-${String(month).padStart(2, '0')}-12`, month, year, concept: 'Ocio y restaurantes', amount: 165 + month * 7, type: 'gasto', categoryId: 'cat-ocio', subcategoryId: 'sub-eventos' },
    { id: uid('mov'), date: `${year}-${String(month).padStart(2, '0')}-15`, month, year, concept: 'Aportación inversión mensual', amount: invest, type: 'aportacion_inversion', categoryId: 'cat-inversion', subcategoryId: 'sub-fondos', accountOrProductId: month % 2 === 0 ? 'prod-fidelity-world' : 'prod-indie', comment: 'No computa como gasto real.' },
    { id: uid('mov'), date: `${year}-${String(month).padStart(2, '0')}-20`, month, year, concept: 'Traspaso a ahorro conservador', amount: 250, type: 'traspaso', categoryId: 'cat-ahorro', subcategoryId: 'sub-colchon', accountOrProductId: 'prod-groupama', comment: 'Traspaso interno, no altera patrimonio.' },
  ] as Movement[]);

  const monthlyRecords: MonthlyProductRecord[] = products.flatMap((product, idx) =>
    [1, 2, 3, 4, 5, 6].map((month) => {
      const contribution = product.goal === 'inversion_largo_plazo' ? (idx === 2 ? 275 : 325) : idx === 1 ? 250 : 0;
      const totalContributed = product.initialCapital + contribution * month;
      const performance = product.risk === 'alto' ? 0.012 : product.risk === 'medio' ? 0.007 : 0.0025;
      const marketValue = Math.round(totalContributed * (1 + performance * month));
      const returnEuro = marketValue - totalContributed;
      return {
        id: uid('rec'), productId: product.id, month, year: 2026, monthlyContribution: contribution,
        monthlyWithdrawal: 0, totalContributed, marketValue, returnEuro,
        returnPercentage: totalContributed === 0 ? 0 : (returnEuro / totalContributed) * 100,
        comment: 'Dato de ejemplo editable.',
      };
    }),
  );

  const groups: CustomGroup[] = [
    { id: 'grp-fijos', name: 'Gastos fijos', type: 'categoria', itemIds: ['cat-vivienda', 'cat-suscripciones'] },
    { id: 'grp-variables', name: 'Gastos variables', type: 'categoria', itemIds: ['cat-alimentacion', 'cat-transporte', 'cat-ocio'] },
    { id: 'grp-emergencia', name: 'Fondo de emergencia', type: 'producto', itemIds: ['prod-ing', 'prod-groupama'] },
    { id: 'grp-largo-plazo', name: 'Inversión a largo plazo', type: 'producto', itemIds: ['prod-indie', 'prod-fidelity-world'] },
  ];

  const goals: Goal[] = [
    { id: 'goal-ahorro', name: 'Ahorro mensual objetivo', type: 'ahorro_mensual', amount: 800, enabled: true },
    { id: 'goal-inversion', name: 'Inversión mensual objetivo', type: 'inversion_mensual', amount: 600, enabled: true },
    { id: 'goal-alimentacion', name: 'Límite alimentación', type: 'limite_categoria', amount: 420, categoryId: 'cat-alimentacion', enabled: true },
    { id: 'goal-emergencia', name: 'Fondo de emergencia mínimo', type: 'fondo_emergencia', amount: 9000, enabled: true },
    { id: 'goal-patrimonio', name: 'Patrimonio objetivo', type: 'patrimonio', amount: 25000, enabled: true },
  ];

  return {
    movements, categories, products, monthlyRecords, groups, goals,
    settings: { selectedMonth: 6, selectedYear: 2026, sampleDataLoaded: true, emergencyFundProductIds: ['prod-ing', 'prod-groupama'], maxProductWeightPercentage: 45 },
  };
};
