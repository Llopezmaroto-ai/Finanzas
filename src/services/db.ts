import { AppData, BackupData, MonthlyProductRecord } from '../types/finance';
import { createInitialData } from '../data/sampleData';

const DB_NAME = 'finanzas-personales-db';
const DB_VERSION = 1;
const STORE = 'app-state';
const KEY = 'current';

const openDatabase = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

export const loadData = async (): Promise<AppData> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(KEY);
    req.onsuccess = async () => {
      if (req.result) resolve(validateBackup(req.result));
      else {
        const seeded = createInitialData();
        await saveData(seeded);
        resolve(seeded);
      }
    };
    req.onerror = () => reject(req.error);
  });
};

export const saveData = async (data: AppData): Promise<void> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(data, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
};

export const clearData = async (): Promise<AppData> => {
  const empty = createInitialData();
  empty.movements = [];
  empty.monthlyRecords = [];
  empty.groups = [];
  empty.goals = [];
  empty.settings.sampleDataLoaded = false;
  await saveData(empty);
  return empty;
};

export const resetWithSampleData = async (): Promise<AppData> => {
  const seeded = createInitialData();
  await saveData(seeded);
  return seeded;
};

export const createBackup = (data: AppData): BackupData => ({ version: 1, exportedAt: new Date().toISOString(), ...data });

const numberOrZero = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;

const recalculateRecord = (record: MonthlyProductRecord): MonthlyProductRecord => {
  const returnEuro = record.marketValue - record.totalContributed;
  const returnPercentage = record.totalContributed === 0 ? 0 : (returnEuro / record.totalContributed) * 100;
  return { ...record, returnEuro, returnPercentage };
};

const dedupeMonthlyRecords = (records: MonthlyProductRecord[]) => {
  const byProductMonth = new Map<string, MonthlyProductRecord>();
  records.forEach((record) => {
    const key = `${record.productId}-${record.year}-${record.month}`;
    byProductMonth.set(key, recalculateRecord(record));
  });
  return [...byProductMonth.values()].sort((a, b) => (b.year - a.year) || (b.month - a.month));
};

export const validateBackup = (value: unknown): AppData => {
  const data = value as Partial<BackupData>;
  if (!data || !Array.isArray(data.movements) || !Array.isArray(data.categories) || !Array.isArray(data.products) || !Array.isArray(data.monthlyRecords)) {
    throw new Error('El archivo no parece una copia de seguridad válida.');
  }
  const defaults = createInitialData();
  const products = data.products.map((product) => ({
    ...product,
    initialCapital: Math.max(numberOrZero(product.initialCapital), 0),
  }));
  return {
    movements: data.movements.map((movement) => ({
      ...movement,
      amount: Math.max(numberOrZero(movement.amount), 0),
      month: Math.min(Math.max(numberOrZero(movement.month), 1), 12),
      year: numberOrZero(movement.year),
    })),
    categories: data.categories,
    products,
    monthlyRecords: dedupeMonthlyRecords(data.monthlyRecords.map((record) => ({
      ...record,
      month: Math.min(Math.max(numberOrZero(record.month), 1), 12),
      year: numberOrZero(record.year),
      monthlyContribution: Math.max(numberOrZero(record.monthlyContribution), 0),
      monthlyWithdrawal: Math.max(numberOrZero(record.monthlyWithdrawal), 0),
      totalContributed: Math.max(numberOrZero(record.totalContributed), 0),
      marketValue: Math.max(numberOrZero(record.marketValue), 0),
      returnEuro: numberOrZero(record.returnEuro),
      returnPercentage: numberOrZero(record.returnPercentage),
    }))),
    groups: data.groups ?? [],
    goals: (data.goals ?? []).map((goal) => ({ ...goal, amount: Math.max(numberOrZero(goal.amount), 0), enabled: goal.enabled !== false })),
    settings: { ...defaults.settings, ...data.settings },
  };
};
