import React from 'react';
import { Icons } from '../lib/icons';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-8 py-10 space-y-10"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-body text-xs uppercase tracking-[0.2em] text-secondary opacity-70">Painel Executivo</span>
          <h1 className="font-headline text-5xl font-extrabold text-on-surface tracking-tight mt-1">Resumo Financeiro</h1>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-low px-6 py-2 rounded font-body text-sm font-semibold text-secondary hover:bg-surface-variant transition-colors">Exportar PDF</button>
          <button className="bg-gradient-to-br from-primary to-primary-container px-6 py-2 rounded font-body text-sm font-semibold text-white hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm">
            <Icons.Add size={18} />
            Nova Transação
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 bg-surface-container-lowest p-8 rounded-xl shadow-[0_32px_64px_-15px_rgba(31,28,13,0.06)] relative overflow-hidden flex flex-col justify-between min-h-[320px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="relative z-10">
            <p className="font-body text-sm font-bold text-secondary uppercase tracking-widest mb-4">Total Gasto no Período</p>
            <div className="flex items-baseline gap-4">
              <h2 className="font-headline text-6xl font-bold text-primary tracking-tighter">R$ 4.250,00</h2>
              <div className="flex items-center gap-1 text-tertiary bg-surface-container-low px-2 py-1 rounded-full text-xs font-bold">
                <Icons.TrendingDown size={14} />
                12%
              </div>
            </div>
            <p className="text-secondary font-body mt-2 max-w-md">Seus gastos estão abaixo da média dos últimos 3 meses. Continue assim para atingir sua meta de reserva de emergência.</p>
          </div>
          <div className="relative z-10 mt-8">
            <div className="flex justify-between items-end mb-2">
              <span className="font-body text-xs font-bold text-secondary">Progresso do Orçamento Mensal</span>
              <span className="font-body text-sm font-bold text-primary">68% UTILIZADO</span>
            </div>
            <div className="w-full h-3 bg-surface-container-low rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-tertiary to-tertiary-container rounded-full" style={{ width: '68%' }}></div>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 bg-surface-container-low p-8 rounded-xl space-y-6">
          <h3 className="font-headline text-xl font-semibold text-on-surface">Insights do Mês</h3>
          <div className="space-y-4">
            {[
              { title: 'Aumento em Refeições', desc: 'Gastos com alimentação fora de casa subiram 25% esta semana.', icon: Icons.Warning, color: 'text-error', border: 'border-error' },
              { title: 'Oportunidade de Poupança', desc: 'Sua conta de energia está 15% menor que o previsto. Deseja investir o excedente?', icon: Icons.TrendingDown, color: 'text-tertiary', border: 'border-tertiary' },
              { title: 'Meta de Lazer Atingida', desc: 'Você economizou o suficiente para sua próxima viagem cultural.', icon: Icons.Verified, color: 'text-primary', border: 'border-primary' },
            ].map((insight, i) => (
              <div key={i} className={`flex gap-4 p-4 bg-surface-container-lowest rounded-lg border-l-4 ${insight.border} shadow-sm`}>
                <insight.icon className={insight.color} size={20} />
                <div>
                  <p className="font-body text-sm font-bold text-on-surface">{insight.title}</p>
                  <p className="text-xs text-secondary mt-1">{insight.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm flex flex-col md:flex-row gap-8 items-center">
          <div className="w-48 h-48 relative flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 32 32">
              <circle cx="16" cy="16" fill="transparent" r="12" stroke="#95433b" strokeDasharray="35 65" strokeDashoffset="0" strokeWidth="8"></circle>
              <circle cx="16" cy="16" fill="transparent" r="12" stroke="#7a5336" strokeDasharray="25 75" strokeDashoffset="-35" strokeWidth="8"></circle>
              <circle cx="16" cy="16" fill="transparent" r="12" stroke="#6e5a56" strokeDasharray="15 85" strokeDashoffset="-60" strokeWidth="8"></circle>
              <circle cx="16" cy="16" fill="transparent" r="12" stroke="#d7c3b6" strokeDasharray="15 85" strokeDashoffset="-75" strokeWidth="8"></circle>
              <circle cx="16" cy="16" fill="transparent" r="12" stroke="#eae2cb" strokeDasharray="10 90" strokeDashoffset="-90" strokeWidth="8"></circle>
              <circle cx="16" cy="16" fill="white" r="8"></circle>
            </svg>
            <div className="flex flex-col items-center relative z-10">
              <span className="font-headline text-2xl font-bold text-on-surface">5</span>
              <span className="font-body text-[10px] uppercase text-secondary">Categorias</span>
            </div>
          </div>
          <div className="flex-1 w-full space-y-4">
            <h3 className="font-headline text-lg font-semibold mb-2">Distribuição de Gastos</h3>
            <div className="space-y-3">
              {[
                { label: 'Moradia', val: '35%', color: 'bg-primary' },
                { label: 'Alimentação', val: '25%', color: 'bg-tertiary' },
                { label: 'Transporte', val: '15%', color: 'bg-secondary' },
                { label: 'Saúde', val: '15%', color: 'bg-outline-variant' },
                { label: 'Outros', val: '10%', color: 'bg-surface-variant' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="font-body text-sm text-on-surface">{item.label}</span>
                  </div>
                  <span className="font-body font-bold text-on-surface">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-headline text-lg font-semibold">Gasto vs Meta</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-[10px] font-body text-secondary uppercase">Gasto</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-surface-variant rounded-full"></div>
                <span className="text-[10px] font-body text-secondary uppercase">Meta</span>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {[
              { label: 'Mercado', val: 'R$ 1.200 / R$ 1.000', progress: '100%', meta: '80%' },
              { label: 'Lazer', val: 'R$ 450 / R$ 600', progress: '75%', meta: '100%' },
              { label: 'Educação', val: 'R$ 800 / R$ 800', progress: '100%', meta: '100%' },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-body uppercase text-secondary mb-1">
                  <span>{item.label}</span>
                  <span className="text-primary font-bold">{item.val}</span>
                </div>
                <div className="relative h-2 bg-surface-container-low rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-surface-variant z-0 rounded-full" style={{ width: item.meta }}></div>
                  <div className="absolute inset-y-0 left-0 bg-primary z-10 rounded-full" style={{ width: item.progress }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Média Diária', val: 'R$ 141,66', icon: Icons.Inicio },
          { label: 'Maior Gasto (Dia)', val: 'R$ 589,00', icon: Icons.ShoppingBag, border: 'border-b-2 border-primary' },
          { label: 'Freq. Transações', val: '2.4 / dia', icon: Icons.History },
          { label: 'Economia Projetada', val: 'R$ 320,00', icon: Icons.Metas, color: 'text-tertiary' },
        ].map((card, i) => (
          <div key={i} className={`bg-surface-container-low p-6 rounded-lg flex flex-col gap-2 ${card.border || ''}`}>
            <card.icon className={card.color || 'text-secondary'} size={20} />
            <span className="font-body text-xs font-bold text-secondary uppercase opacity-70">{card.label}</span>
            <span className="font-headline text-xl font-bold text-on-surface">{card.val}</span>
          </div>
        ))}
      </div>
    </motion.main>
  );
};
