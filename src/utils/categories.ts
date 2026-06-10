import { Transaction, Goal } from '../context/FinanceContext';

export const STANDARD_CATEGORIES = [
  'Alimentação',
  'Moradia',
  'Transporte',
  'Lazer',
  'Saúde',
  'Educação',
  'Geral',
  'Outros'
];

export const getAllCategories = (transactions: Transaction[], goals: Goal[]) => {
  const set = new Set<string>();
  STANDARD_CATEGORIES.forEach(c => set.add(c));
  goals.forEach(g => set.add(g.title));
  transactions.forEach(t => {
    if (t.cat) set.add(t.cat);
  });
  return Array.from(set);
};
