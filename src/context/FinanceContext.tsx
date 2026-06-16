import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { isMonthMatch } from '../utils/date';
import { generateLocalInsights, generateLocalRecommendations } from '../utils/insightsAlgorithm';

export interface Transaction {
  id: number;
  date: string;
  name: string;
  cat: string;
  val: number;
  status: 'Liquidado' | 'Pendente';
  iconKey: string;
}

export interface Goal {
  id: number;
  title: string;
  meta: number;
  color: string;
  iconKey: string;
  iconColor: string;
  iconBg: string;
  tipIconKey: string;
  tip: string;
}

export interface AIInsight {
  title: string;
  description: string;
  type: 'warning' | 'opportunity' | 'info';
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  suggestedValue: number;
  priority: 'high' | 'medium';
}

interface SelectedMonth {
  month: number;
  year: number;
}

interface FinanceContextData {
  transactions: Transaction[];
  currentMonthTransactions: Transaction[];
  goals: Goal[];
  aiInsights: AIInsight[];
  aiRecommendations: AIRecommendation[];
  isLoadingInsights: boolean;
  selectedMonth: SelectedMonth;
  setSelectedMonth: (month: SelectedMonth) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: number, data: Partial<Goal>) => void;
  deleteGoal: (id: number) => void;
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (id: number, data: Partial<Transaction>) => void;
  removeTransaction: (id: number) => void;
  acceptedRecommendations: string[];
  acceptRecommendation: (id: string, goalData?: Omit<Goal, 'id'>) => void;
  refreshInsights: () => void;
  refreshData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextData>({} as FinanceContextData);

export const useFinance = () => useContext(FinanceContext);

const API_URL = 'http://localhost:3001/api';

const MOCK_GOALS: Goal[] = [
  { id: 1, title: 'Gastos Obrigatórios', meta: 803, color: '#C83C2C', iconKey: 'Inicio', iconColor: 'text-primary', iconBg: 'bg-primary/10', tipIconKey: 'Idea', tip: 'Despesas essenciais do dia a dia' },
  { id: 2, title: 'Comida', meta: 800, color: '#6B5A4E', iconKey: 'Alimentacao', iconColor: 'text-secondary', iconBg: 'bg-secondary/10', tipIconKey: 'Idea', tip: 'Configure sua nova meta para começar a acompanhar.' },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 1, date: '16 Jun 2026', name: 'Mercado', cat: 'Gastos Obrigatórios', val: 150, status: 'Liquidado', iconKey: 'Inicio' },
  { id: 2, date: '16 Jun 2026', name: 'Uber', cat: 'Gastos Obrigatórios', val: 50, status: 'Liquidado', iconKey: 'Inicio' },
  { id: 3, date: '15 Jun 2026', name: 'Farmácia', cat: 'Saúde', val: 120, status: 'Liquidado', iconKey: 'History' },
  { id: 4, date: '04 Jun 2026', name: 'DROGARIA SANTA LUZIA', cat: 'Saúde', val: 169.99, status: 'Pendente', iconKey: 'History' },
  { id: 5, date: '15 Jun 2026', name: 'DROGARIA SANTA LUZIA (2/3)', cat: 'Saúde', val: 169.99, status: 'Pendente', iconKey: 'History' },
  { id: 6, date: '04 Jun 2026', name: 'DROGARIA SANTA LUZIA', cat: 'Saúde', val: 169.99, status: 'Liquidado', iconKey: 'History' },
  { id: 7, date: '12 Jun 2026', name: 'Restaurante', cat: 'Comida', val: 500, status: 'Liquidado', iconKey: 'Alimentacao' },
];

export const FinanceProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<SelectedMonth>({ month: now.getMonth(), year: now.getFullYear() });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [acceptedRecommendations, setAcceptedRecommendations] = useState<string[]>([]);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/transactions`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
        return data;
      }
    } catch (e) {
      console.error("Failed to fetch transactions:", e);
      setTransactions(MOCK_TRANSACTIONS);
      return MOCK_TRANSACTIONS;
    }
    return [];
  }, []);

  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/goals`);
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      }
    } catch (e) {
      console.error("Failed to fetch goals:", e);
      setGoals(MOCK_GOALS);
    }
  }, []);

  React.useEffect(() => {
    const init = async () => {
      await fetchTransactions();
      await fetchGoals();
    };
    init();
  }, [fetchTransactions, fetchGoals]);

  const addGoal = async (goal: Omit<Goal, 'id'>) => {
    try {
      const res = await fetch(`${API_URL}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal)
      });
      if (res.ok) {
        const saved = await res.json();
        setGoals(prev => [saved, ...prev]);
      }
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  };

  const updateGoal = async (id: number, data: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
    try {
      await fetch(`${API_URL}/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  const deleteGoal = async (id: number) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    try {
      await fetch(`${API_URL}/goals/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const addTransaction = async (tx: Transaction) => {
    const tempId = Date.now();
    setTransactions(prev => [{...tx, id: tempId}, ...prev]);
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx)
      });
      if (res.ok) {
        const savedTx = await res.json();
        setTransactions(prev => prev.map(t => t.id === tempId ? savedTx : t));
      }
    } catch (error) {
      console.error("Error adding tx:", error);
    }
  };

  const updateTransaction = async (id: number, data: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    try {
      await fetch(`${API_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error("Error updating tx:", error);
    }
  };

  const removeTransaction = async (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    try {
      await fetch(`${API_URL}/transactions/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error("Error deleting tx:", error);
    }
  };

  const acceptRecommendation = async (id: string, goalData?: Omit<Goal, 'id'>) => {
    if (goalData) {
      await addGoal(goalData);
    }
    setAcceptedRecommendations(prev => [...prev, id]);
  };

  const currentMonthTransactions = transactions.filter(t => isMonthMatch(t.date, selectedMonth.month, selectedMonth.year));

  const aiInsights = useMemo(() => {
    return generateLocalInsights(currentMonthTransactions, goals);
  }, [currentMonthTransactions, goals]);

  const aiRecommendations = useMemo(() => {
    return generateLocalRecommendations(currentMonthTransactions, goals, acceptedRecommendations);
  }, [currentMonthTransactions, goals, acceptedRecommendations]);

  const isLoadingInsights = false;
  const refreshInsights = () => {};

  const refreshData = useCallback(async () => {
    await fetchTransactions();
    await fetchGoals();
  }, [fetchTransactions, fetchGoals]);

  return (
    <FinanceContext.Provider value={{
      transactions, currentMonthTransactions, goals, aiInsights, aiRecommendations, isLoadingInsights,
      selectedMonth, setSelectedMonth,
      addGoal, updateGoal, deleteGoal,
      addTransaction, updateTransaction, removeTransaction,
      acceptedRecommendations, acceptRecommendation, refreshInsights,
      refreshData
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
