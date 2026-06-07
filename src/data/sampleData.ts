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
    { id: 'cat-ahorro', name: 'Ahorro', subcategories: [{ id: 'sub-reserva', name: 'Reserva' }] },
    { id: 'cat-inversion', name: 'Inversión', subcategories: [{ id: 'sub-fondos', name: 'Fondos' }, { id: 'sub-etf', name: 'ETF' }] },
    { id: 'cat-otros', name: 'Otros', subcategories: [{ id: 'sub-varios', name: 'Varios' }] },
  ];

  const products: FinancialProduct[] = [
    { id: 'prod-demo-cash', name: 'Cuenta Demo A', type: 'cuenta_remunerada', entity: 'Entidad Ficticia A', identifier: 'DEMO-CASH-001', risk: 'bajo', goal: 'colchon_seguridad', initialCapital: 1000, comment: 'Producto ficticio para mostrar efectivo o reserva.' },
    { id: 'prod-demo-monetary', name: 'Producto Demo B', type: 'fondo_monetario', entity: 'Entidad Ficticia B', identifier: 'DEMO-MON-002', risk: 'bajo', goal: 'ahorro_conservador', initialCapital: 750, comment: 'Producto ficticio para pruebas de seguimiento.' },
    { id: 'prod-demo-index', name: 'Producto Demo C', type: 'fondo_indexado', entity: 'Entidad Ficticia C', identifier: 'DEMO-IDX-003', risk: 'medio', goal: 'inversion_largo_plazo', initialCapital: 600, comment: 'Producto ficticio para pruebas de seguimiento.' },
    { id: 'prod-demo-global', name: 'Producto Demo D', type: 'etf', entity: 'Entidad Ficticia D', identifier: 'DEMO-ETF-004', risk: 'alto', goal: 'inversion_largo_plazo', initialCapital: 900, comment: 'Producto ficticio para pruebas de seguimiento.' },
  ];

  const movementBase = [
    [2026, 1, 1200, 420, 120], [2026, 2, 1200, 440, 130], [2026, 3, 1250, 460, 140],
    [2026, 4, 1250, 430, 140], [2026, 5, 1300, 480, 150], [2026, 6, 1300, 450, 150],
  ];
  const movements: Movement[] = movementBase.flatMap(([year, month, income, housing, invest]) => [
    { id: uid('mov'), date: `${year}-${String(month).padStart(2, '0')}-01`, month, year, concept: 'Ingreso ficticio mensual', amount: income, type: 'ingreso', categoryId: 'cat-otros', subcategoryId: 'sub-varios', accountOrProductId: 'prod-demo-cash' },
    { id: uid('mov'), date: `${year}-${String(month).padStart(2, '0')}-03`, month, year, concept: 'Gasto ficticio de vivienda', amount: housing, type: 'gasto', categoryId: 'cat-vivienda', subcategoryId: 'sub-alquiler' },
    { id: uid('mov'), date: `${year}-${String(month).padStart(2, '0')}-08`, month, year, concept: 'Compra ficticia de alimentación', amount: 160 + month * 3, type: 'gasto', categoryId: 'cat-alimentacion', subcategoryId: 'sub-supermercado' },
    { id: uid('mov'), date: `${year}-${String(month).padStart(2, '0')}-12`, month, year, concept: 'Ocio ficticio', amount: 70 + month * 4, type: 'gasto', categoryId: 'cat-ocio', subcategoryId: 'sub-eventos' },
    { id: uid('mov'), date: `${year}-${String(month).padStart(2, '0')}-15`, month, year, concept: 'Aportación ficticia a inversión', amount: invest, type: 'aportacion_inversion', categoryId: 'cat-inversion', subcategoryId: 'sub-fondos', accountOrProductId: month % 2 === 0 ? 'prod-demo-global' : 'prod-demo-index', comment: 'Dato ficticio; no computa como gasto real.' },
    { id: uid('mov'), date: `${year}-${String(month).padStart(2, '0')}-20`, month, year, concept: 'Traspaso ficticio entre productos', amount: 80, type: 'traspaso', categoryId: 'cat-ahorro', subcategoryId: 'sub-reserva', accountOrProductId: 'prod-demo-monetary', comment: 'Dato ficticio; traspaso interno que no altera patrimonio.' },
  ] as Movement[]);

  const monthlyRecords: MonthlyProductRecord[] = products.flatMap((product, idx) =>
    [1, 2, 3, 4, 5, 6].map((month) => {
      const contribution = product.goal === 'inversion_largo_plazo' ? (idx === 2 ? 70 : 80) : idx === 1 ? 60 : 0;
      const totalContributed = product.initialCapital + contribution * month;
      const performance = product.risk === 'alto' ? 0.009 : product.risk === 'medio' ? 0.005 : 0.0015;
      const marketValue = Math.round(totalContributed * (1 + performance * month));
      const returnEuro = marketValue - totalContributed;
      return {
        id: uid('rec'), productId: product.id, month, year: 2026, monthlyContribution: contribution,
        monthlyWithdrawal: 0, totalContributed, marketValue, returnEuro,
        returnPercentage: totalContributed === 0 ? 0 : (returnEuro / totalContributed) * 100,
        comment: 'Dato ficticio editable.',
      };
    }),
  );

  const groups: CustomGroup[] = [
    { id: 'grp-fijos', name: 'Grupo demo: gastos fijos', type: 'categoria', itemIds: ['cat-vivienda', 'cat-suscripciones'] },
    { id: 'grp-variables', name: 'Grupo demo: gastos variables', type: 'categoria', itemIds: ['cat-alimentacion', 'cat-transporte', 'cat-ocio'] },
    { id: 'grp-reserva', name: 'Grupo demo: reserva', type: 'producto', itemIds: ['prod-demo-cash', 'prod-demo-monetary'] },
    { id: 'grp-inversion', name: 'Grupo demo: productos C y D', type: 'producto', itemIds: ['prod-demo-index', 'prod-demo-global'] },
  ];

  const goals: Goal[] = [
    { id: 'goal-ahorro', name: 'Objetivo demo de ahorro mensual', type: 'ahorro_mensual', amount: 300, enabled: true },
    { id: 'goal-inversion', name: 'Objetivo demo de aportación mensual', type: 'inversion_mensual', amount: 150, enabled: true },
    { id: 'goal-alimentacion', name: 'Límite demo de alimentación', type: 'limite_categoria', amount: 220, categoryId: 'cat-alimentacion', enabled: true },
    { id: 'goal-reserva', name: 'Objetivo demo de reserva mínima', type: 'fondo_emergencia', amount: 1800, enabled: true },
    { id: 'goal-patrimonio', name: 'Objetivo demo de patrimonio', type: 'patrimonio', amount: 5000, enabled: true },
  ];

  return {
    movements, categories, products, monthlyRecords, groups, goals,
    settings: { selectedMonth: 6, selectedYear: 2026, sampleDataLoaded: true, emergencyFundProductIds: ['prod-demo-cash', 'prod-demo-monetary'], maxProductWeightPercentage: 45 },
  };
};
