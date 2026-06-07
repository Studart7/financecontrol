import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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
  title: string;
  description: string;
  suggestedValue: number;
  priority: 'high' | 'medium';
}

interface FinanceContextData {
  transactions: Transaction[];
  goals: Goal[];
  aiInsights: AIInsight[];
  aiRecommendations: AIRecommendation[];
  isLoadingInsights: boolean;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: number, data: Partial<Goal>) => void;
  deleteGoal: (id: number) => void;
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (id: number, data: Partial<Transaction>) => void;
  removeTransaction: (id: number) => void;
  acceptedRecommendations: string[];
  acceptRecommendation: (id: string, goalData?: Omit<Goal, 'id'>) => void;
  refreshInsights: () => void;
}

const FinanceContext = createContext<FinanceContextData>({} as FinanceContextData);

export const useFinance = () => useContext(FinanceContext);

const API_URL = 'http://localhost:3001/api';

export const FinanceProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
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
    }
  }, []);

  const fetchInsights = useCallback(async (txList: Transaction[]) => {
    setIsLoadingInsights(true);
    try {
      const res = await fetch(`${API_URL}/ai/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: txList.map(t => ({ date: t.date, name: t.name, cat: t.cat, val: t.val })) })
      });
      if (res.ok) {
        const data = await res.json();
        setAiInsights(data.insights || []);
        setAiRecommendations(data.recommendations || []);
      }
    } catch (e) {
      console.error("Failed to fetch AI insights:", e);
    } finally {
      setIsLoadingInsights(false);
    }
  }, []);

  const refreshInsights = useCallback(() => {
    fetchInsights(transactions);
  }, [transactions, fetchInsights]);

  React.useEffect(() => {
    const init = async () => {
      const txData = await fetchTransactions();
      await fetchGoals();
      fetchInsights(txData);
    };
    init();
  }, [fetchTransactions, fetchGoals, fetchInsights]);

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

  return (
    <FinanceContext.Provider value={{
      transactions, goals, aiInsights, aiRecommendations, isLoadingInsights,
      addGoal, updateGoal, deleteGoal,
      addTransaction, updateTransaction, removeTransaction,
      acceptedRecommendations, acceptRecommendation, refreshInsights
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
