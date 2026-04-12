import React, { createContext, useContext, useState, ReactNode } from 'react';

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

interface FinanceContextData {
  transactions: Transaction[];
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  updateGoal: (id: number, data: Partial<Goal>) => void;
  deleteGoal: (id: number) => void;
  addTransaction: (tx: Transaction) => void;
  removeTransaction: (id: number) => void;
  acceptedRecommendations: string[];
  acceptRecommendation: (id: string, goalUpdate?: () => void) => void;
}

const FinanceContext = createContext<FinanceContextData>({} as FinanceContextData);

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, date: '24 Out 2024', name: 'Aluguel Apto', cat: 'Moradia', val: 2800, status: 'Liquidado', iconKey: 'Inicio' },
    { id: 2, date: '24 Out 2024', name: 'Pão de Açúcar', cat: 'Alimentação', val: 600, status: 'Liquidado', iconKey: 'ShoppingBag' },
    { id: 3, date: '22 Out 2024', name: 'Outback', cat: 'Alimentação', val: 350, status: 'Liquidado', iconKey: 'Alimentacao' },
    { id: 4, date: '21 Out 2024', name: 'Posto Ipiranga', cat: 'Transporte', val: 150, status: 'Liquidado', iconKey: 'Transporte' },
    { id: 5, date: '20 Out 2024', name: 'Uber Viagens', cat: 'Transporte', val: 300, status: 'Pendente', iconKey: 'Transporte' },
    { id: 6, date: '19 Out 2024', name: 'SmartFit', cat: 'Saúde', val: 120, status: 'Liquidado', iconKey: 'History' },
    { id: 7, date: '18 Out 2024', name: 'Farmácia', cat: 'Saúde', val: 80, status: 'Liquidado', iconKey: 'History' },
    { id: 8, date: '15 Out 2024', name: 'Ingresso.com', cat: 'Lazer', val: 100, status: 'Liquidado', iconKey: 'Outros' },
    { id: 9, date: '12 Out 2024', name: 'Ifood', cat: 'Alimentação', val: 250, status: 'Liquidado', iconKey: 'Alimentacao' },
    { id: 10, date: '10 Out 2024', name: 'Starbucks', cat: 'Alimentação', val: 100, status: 'Liquidado', iconKey: 'Alimentacao' },
    { id: 11, date: '05 Out 2024', name: 'Ticketmaster (Show)', cat: 'Lazer', val: 250, status: 'Liquidado', iconKey: 'Outros' }
  ]);

  const [goals, setGoals] = useState<Goal[]>([
    { id: 1, title: 'Alimentação', meta: 1200, color: 'bg-error', iconKey: 'Alimentacao', iconColor: 'text-secondary', iconBg: 'bg-surface-container-low', tipIconKey: 'Lightbulb', tip: '"Você poderia economizar R$ 45 este mês reduzindo pedidos de delivery nos finais de semana."' },
    { id: 2, title: 'Transporte', meta: 500, color: 'bg-tertiary', iconKey: 'Transporte', iconColor: 'text-tertiary', iconBg: 'bg-tertiary/10', tipIconKey: 'Lightbulb', tip: '"Seu gasto com transporte está 10% abaixo da meta. Excelente controle!"' },
    { id: 3, title: 'Moradia', meta: 3000, color: 'bg-primary-container', iconKey: 'Inicio', iconColor: 'text-primary', iconBg: 'bg-primary/10', tipIconKey: 'TrendingDown', tip: '"Contas de energia subiram 12% este mês. Considere revisar o uso de aparelhos de alto consumo."' },
    { id: 4, title: 'Saúde', meta: 400, color: 'bg-outline-variant', iconKey: 'History', iconColor: 'text-secondary', iconBg: 'bg-surface-container-low', tipIconKey: 'Verified', tip: '"Gastos com saúde estabilizados. Bom momento para focar no fundo de emergência."' },
    { id: 5, title: 'Lazer', meta: 600, color: 'bg-secondary', iconKey: 'Outros', iconColor: 'text-secondary', iconBg: 'bg-surface-container-low', tipIconKey: 'Lightbulb', tip: '"Aproveite experiências gratuitas na sua cidade para manter o orçamento equilibrado."' },
  ]);

  const [acceptedRecommendations, setAcceptedRecommendations] = useState<string[]>([]);

  const addGoal = (goal: Goal) => setGoals([goal, ...goals]);
  const updateGoal = (id: number, data: Partial<Goal>) => {
    setGoals(goals.map(g => g.id === id ? { ...g, ...data } : g));
  };
  const deleteGoal = (id: number) => setGoals(goals.filter(g => g.id !== id));
  
  const addTransaction = (tx: Transaction) => setTransactions([tx, ...transactions]);
  const removeTransaction = (id: number) => setTransactions(transactions.filter(t => t.id !== id));

  const acceptRecommendation = (id: string, goalUpdate?: () => void) => {
    if (goalUpdate) goalUpdate();
    setAcceptedRecommendations([...acceptedRecommendations, id]);
  };

  return (
    <FinanceContext.Provider value={{
      transactions, goals, addGoal, updateGoal, deleteGoal,
      addTransaction, removeTransaction, acceptedRecommendations, acceptRecommendation
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
