import React, { useState } from 'react';
import { Icons } from '../lib/icons';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../context/FinanceContext';

export const Metas: React.FC = () => {
  const { 
    goals, currentMonthTransactions: transactions, addGoal, updateGoal, deleteGoal, 
    acceptedRecommendations, acceptRecommendation,
    aiRecommendations, isLoadingInsights
  } = useFinance();
  // States para os modais
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalFormData, setGoalFormData] = useState({ id: 0, title: '', meta: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<number | null>(null);

  const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  // Derivações do Dashboard total e metas enriquecidas
  const enrichedGoals = goals.map(goal => {
    const categoryTransactions = transactions.filter(t => t.cat.toLowerCase() === goal.title.toLowerCase());
    const val = categoryTransactions.reduce((acc, curr) => acc + curr.val, 0);
    const rawProgress = goal.meta > 0 ? (val / goal.meta) * 100 : 0;
    
    let status = 'Dentro do Orçamento';
    let dynamicColor = goal.color;
    
    if (val > goal.meta) {
      status = 'Acima do Orçamento';
      dynamicColor = 'bg-error';
    } else if (rawProgress >= 90) {
      status = 'Próximo ao Limite';
      dynamicColor = 'bg-primary-container';
    }

    return {
      ...goal,
      val,
      progress: Math.min(rawProgress, 100),
      status,
      color: dynamicColor
    };
  });

  const totalGasto = transactions.reduce((acc, curr) => acc + curr.val, 0);
  const totalMeta = enrichedGoals.reduce((acc, curr) => acc + curr.meta, 0);
  const totalProgress = totalMeta > 0 ? (totalGasto / totalMeta) * 100 : 0;
  const isOverBudget = totalGasto > totalMeta;

  const openNewGoalModal = () => {
    setGoalFormData({ id: 0, title: '', meta: '' });
    setIsGoalModalOpen(true);
  };

  const openEditGoalModal = (goal: any) => {
    setGoalFormData({ id: goal.id, title: goal.title, meta: String(goal.meta) });
    setIsGoalModalOpen(true);
  };

  const saveGoal = () => {
    if (!goalFormData.title || !goalFormData.meta) return;
    
    if (goalFormData.id === 0) {
      addGoal({
        id: Date.now(),
        title: goalFormData.title,
        meta: Number(goalFormData.meta),
        color: 'bg-tertiary',
        iconKey: 'Metas',
        iconColor: 'text-tertiary',
        iconBg: 'bg-tertiary/10',
        tipIconKey: 'Lightbulb',
        tip: '"Configure sua nova meta para começar a acompanhar."'
      });
    } else {
      updateGoal(goalFormData.id, {
        title: goalFormData.title,
        meta: Number(goalFormData.meta)
      });
    }
    setIsGoalModalOpen(false);
  };

  const requestDelete = (id: number) => {
    setGoalToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (goalToDelete !== null) {
      deleteGoal(goalToDelete);
      setGoalToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleAcceptAIRecommendation = (rec: any) => {
    acceptRecommendation(rec.title, {
      title: rec.title,
      meta: rec.suggestedValue,
      color: rec.priority === 'high' ? 'bg-primary' : 'bg-tertiary',
      iconKey: 'Metas',
      iconColor: rec.priority === 'high' ? 'text-primary' : 'text-tertiary',
      iconBg: rec.priority === 'high' ? 'bg-primary/10' : 'bg-tertiary/10',
      tipIconKey: 'Verified',
      tip: '"Recomendação da IA aplicada. Meta criada com sucesso!"'
    });
  };

  return (
    <>
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-8 py-10 space-y-10"
      >
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-on-surface tracking-tight">Orçamento e Metas</h1>
            <p className="text-secondary mt-2 text-lg">Gerencie seu patrimônio com elegância e precisão.</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">

            <button 
              onClick={openNewGoalModal}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-primary to-primary-container text-surface-container-lowest font-semibold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98] whitespace-nowrap"
            >
              <Icons.Add size={20} />
              Nova Meta
            </button>
          </div>
        </header>

        {/* Sumário Geral */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-full text-primary">
              <Icons.Payment size={28} />
            </div>
            <div>
              <p className="text-sm font-body uppercase tracking-widest text-secondary mb-1">Gasto Atual / Meta Total</p>
              <div className="flex items-end gap-3">
                <span className={`text-3xl font-headline font-bold ${isOverBudget ? 'text-error' : 'text-primary'}`}>
                  {formatCurrency(totalGasto)}
                </span>
                <span className="text-xl font-headline font-semibold text-secondary opacity-60 mb-0.5">
                  / {formatCurrency(totalMeta)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex-grow md:max-w-xl w-full">
            <div className="flex justify-between text-xs font-bold uppercase mb-2">
              <span className="text-secondary">Progresso do Orçamento Mensal</span>
              <span className={isOverBudget ? 'text-error' : 'text-secondary'}>{Math.round(totalProgress)}%</span>
            </div>
            <div className="w-full bg-surface-container-low h-3 rounded-full overflow-hidden">
               <div 
                 className={`h-full rounded-full transition-all duration-500 relative ${isOverBudget ? 'bg-error' : 'bg-primary'}`} 
                 style={{ width: `${Math.min(totalProgress, 100)}%` }}
               >
                 {isOverBudget && (
                    <div className="absolute inset-0 bg-white/20 style-stripes rounded-full"></div>
                 )}
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {enrichedGoals.map((cat) => {
              const CatIcon = Icons[cat.iconKey as keyof typeof Icons] || Icons.Metas;
              const TipIcon = Icons[cat.tipIconKey as keyof typeof Icons] || Icons.Lightbulb;
              
              return (
                <div key={cat.id} className="bg-surface-container-lowest p-8 rounded-xl relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full ${cat.iconBg} flex items-center justify-center ${cat.iconColor}`}>
                        <CatIcon size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-headline font-semibold text-on-surface">{cat.title}</h3>
                        <span className={`text-xs font-body uppercase tracking-widest ${cat.color === 'bg-error' ? 'text-error' : 'text-secondary'}`}>{cat.status}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <div className="text-2xl font-headline font-bold text-primary">{formatCurrency(cat.val)}</div>
                        <div className="text-sm text-secondary opacity-60">Meta: {formatCurrency(cat.meta)}</div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditGoalModal(cat)} className="p-2 text-secondary hover:text-primary bg-surface-container-low rounded-lg transition-colors">
                          <Icons.Edit size={16} />
                        </button>
                        <button onClick={() => requestDelete(cat.id)} className="p-2 text-secondary hover:text-error bg-surface-container-low rounded-lg transition-colors">
                          <Icons.Trash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-surface-container-low h-2.5 rounded-full mb-4">
                    <div className={`${cat.color} h-full rounded-full transition-all`} style={{ width: `${Math.min(cat.progress, 100)}%` }}></div>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-lg flex items-start gap-3 border-l-4 border-primary">
                    <TipIcon className="text-primary mt-0.5" size={16} />
                    <p className="text-sm text-secondary italic">{cat.tip}</p>
                  </div>
                </div>
              );
            })}

            {(!isLoadingInsights && aiRecommendations.length > 0) && (
              <section className="pt-8">
                <div className="flex items-center gap-3 mb-6">
                  <Icons.Add className="text-primary" size={24} />
                  <h2 className="text-2xl font-headline font-bold text-on-surface">Recomendações da IA para suas Metas</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {aiRecommendations.filter(rec => !acceptedRecommendations.includes(rec.title)).map((rec, i) => (
                    <div key={i} className={`bg-surface-container-lowest p-6 rounded-xl border hover:shadow-md transition-shadow ${rec.priority === 'high' ? 'border-primary/20' : 'border-tertiary/20'}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-2 rounded-lg ${rec.priority === 'high' ? 'bg-primary/10 text-primary' : 'bg-tertiary/10 text-tertiary'}`}>
                          <Icons.Metas size={24} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-secondary bg-surface-container-low px-2 py-1 rounded">
                          {rec.priority === 'high' ? 'Prioritário' : 'Otimização'}
                        </span>
                      </div>
                      <h4 className="text-lg font-headline font-bold text-on-surface mb-2">{rec.title}</h4>
                      <p className="text-sm text-secondary mb-6">{rec.description}</p>
                      <button onClick={() => handleAcceptAIRecommendation(rec)} className={`w-full py-2.5 font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 text-surface-container-lowest ${rec.priority === 'high' ? 'bg-primary hover:bg-primary-container' : 'bg-tertiary hover:bg-tertiary-container'}`}>
                        <Icons.Check size={18} />
                        Aceitar Meta de R$ {rec.suggestedValue}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-surface-dim p-8 rounded-xl text-center space-y-4">
              <h3 className="font-headline font-bold text-on-surface opacity-80 uppercase tracking-widest text-sm">Health Score</h3>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle className="text-surface-container-low" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="8"></circle>
                  <circle className="text-primary" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray="552.92" strokeDashoffset="88.46" strokeLinecap="round" strokeWidth="12"></circle>
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-6xl font-headline font-bold text-on-surface">84</span>
                  <span className="text-sm font-body text-secondary font-medium uppercase">ESTÁVEL</span>
                </div>
              </div>
              <p className="text-secondary text-sm px-4">Sua saúde financeira está acima da média de perfis similares. Continue diversificando!</p>
            </div>

            <div className="relative h-64 rounded-xl overflow-hidden shadow-xl group">
              <img 
                alt="Financial Journal" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                src="https://picsum.photos/seed/journal/600/400"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex items-end p-6">
                <div>
                  <span className="text-[10px] font-body font-bold text-primary-container uppercase tracking-widest mb-1 block">Artigo Recomendado</span>
                  <h4 className="text-white font-headline font-bold text-lg leading-tight">A Arte de Acumular: Estratégias para o Próximo Trimestre</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.main>

      {/* Modais flutuantes */}
      <AnimatePresence>
        {isGoalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-dim/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest p-6 rounded-2xl shadow-xl w-full max-w-sm border border-outline-variant/20"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-headline font-bold text-on-surface">
                  {goalFormData.id === 0 ? 'Nova Meta' : 'Editar Meta'}
                </h2>
                <button onClick={() => setIsGoalModalOpen(false)} className="text-secondary hover:text-primary transition-colors">
                  <Icons.Close size={20} />
                </button>
              </div>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-bold font-body text-secondary mb-1">CATEGORIA / NOME DA META</label>
                  <input 
                    type="text" 
                    value={goalFormData.title}
                    onChange={(e) => setGoalFormData({...goalFormData, title: e.target.value})}
                    className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary px-3 py-2 outline-none rounded-t text-sm font-medium"
                    placeholder="Ex: Lazer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold font-body text-secondary mb-1">VALOR DA META (R$)</label>
                  <input 
                    type="number" 
                    value={goalFormData.meta}
                    onChange={(e) => setGoalFormData({...goalFormData, meta: e.target.value})}
                    className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary px-3 py-2 outline-none rounded-t text-sm font-medium"
                    placeholder="Ex: 500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setIsGoalModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-secondary hover:bg-surface-container-low rounded-lg transition-colors">
                  Cancelar
                </button>
                <button onClick={saveGoal} className="px-5 py-2.5 text-sm font-bold bg-primary text-surface-container-lowest rounded-lg hover:bg-primary-container transition-colors shadow-sm">
                  Salvar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-dim/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest p-6 rounded-2xl shadow-xl w-full max-w-sm border border-error/20"
            >
              <div className="flex items-center gap-3 text-error mb-4">
                <div className="p-2 bg-error/10 rounded-full">
                  <Icons.Warning size={24} />
                </div>
                <h2 className="text-xl font-headline font-bold">Excluir Meta</h2>
              </div>
              <p className="text-secondary text-sm mb-8 leading-relaxed">
                Tem certeza que deseja apagar esta meta? Todos os lançamentos vinculados manterão a categoria, mas você perderá o controle do orçamento associado.
              </p>
              
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-secondary hover:bg-surface-container-low rounded-lg transition-colors">
                  Cancelar
                </button>
                <button onClick={confirmDelete} className="px-5 py-2.5 text-sm font-bold bg-error text-surface-container-lowest rounded-lg hover:bg-error/90 transition-colors shadow-sm">
                  Excluir Meta
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
