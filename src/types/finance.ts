export type MovementType = 'ingreso' | 'gasto' | 'ahorro' | 'aportacion_inversion' | 'traspaso';
export type ProductType = 'cuenta_remunerada' | 'fondo_monetario' | 'fondo_indexado' | 'etf' | 'acciones' | 'efectivo' | 'otro';
export type RiskLevel = 'bajo' | 'medio' | 'alto';
export type ProductGoal = 'colchon_seguridad' | 'ahorro_conservador' | 'inversion_largo_plazo' | 'otro';
export type GroupType = 'categoria' | 'producto';
export type GoalType = 'ahorro_mensual' | 'inversion_mensual' | 'limite_categoria' | 'fondo_emergencia' | 'patrimonio' | 'inversion_largo_plazo';

export interface Movement {
  id: string;
  date: string;
  month: number;
  year: number;
  concept: string;
  amount: number;
  type: MovementType;
  categoryId: string;
  subcategoryId?: string;
  accountOrProductId?: string;
  comment?: string;
}

export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
}

export interface FinancialProduct {
  id: string;
  name: string;
  type: ProductType;
  entity: string;
  identifier?: string;
  risk: RiskLevel;
  goal: ProductGoal;
  initialCapital: number;
  comment?: string;
}

export interface MonthlyProductRecord {
  id: string;
  productId: string;
  month: number;
  year: number;
  monthlyContribution: number;
  monthlyWithdrawal: number;
  totalContributed: number;
  marketValue: number;
  returnEuro: number;
  returnPercentage: number;
  comment?: string;
}

export interface CustomGroup {
  id: string;
  name: string;
  type: GroupType;
  itemIds: string[];
}

export interface Goal {
  id: string;
  name: string;
  type: GoalType;
  amount: number;
  categoryId?: string;
  productId?: string;
  enabled: boolean;
}

export interface AppSettings {
  selectedMonth: number;
  selectedYear: number;
  sampleDataLoaded: boolean;
  emergencyFundProductIds: string[];
  maxProductWeightPercentage: number;
}

export interface BackupData {
  version: number;
  exportedAt: string;
  movements: Movement[];
  categories: Category[];
  products: FinancialProduct[];
  monthlyRecords: MonthlyProductRecord[];
  groups: CustomGroup[];
  goals: Goal[];
  settings: AppSettings;
}

export interface AppData extends Omit<BackupData, 'version' | 'exportedAt'> {}

export interface MonthlySummary {
  income: number;
  expenses: number;
  realSavings: number;
  savingsPercentage: number;
  investmentContributions: number;
  totalProductValue: number;
  totalReturnEuro: number;
  totalReturnPercentage: number;
  estimatedNetWorth: number;
}
