import React from 'react';
import { Icons } from '../lib/icons';
import { motion } from 'motion/react';

export const Metas: React.FC = () => {
  return (
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
        <div className="bg-surface-container-low p-1 rounded-lg flex gap-1 self-start md:self-auto">
          {['7d', '10d', '15d'].map((d) => (
            <button key={d} className="px-4 py-2 text-sm font-medium rounded text-secondary hover:bg-surface-container-high transition-colors">{d}</button>
          ))}
          <button className="px-4 py-2 text-sm font-bold rounded bg-surface-container-lowest text-primary shadow-sm">30d</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {[
            { title: 'Alimentação', status: 'Acima do Orçamento', val: 'R$ 1.450', meta: 'R$ 1.200', progress: '100%', color: 'bg-error', icon: Icons.Alimentacao, iconColor: 'text-secondary', iconBg: 'bg-surface-container-low', tipIcon: Icons.Lightbulb, tip: '"Você poderia economizar R$ 45 este mês reduzindo pedidos de delivery nos finais de semana."' },
            { title: 'Transporte', status: 'Dentro do Orçamento', val: 'R$ 320', meta: 'R$ 500', progress: '64%', color: 'bg-tertiary', icon: Icons.Transporte, iconColor: 'text-tertiary', iconBg: 'bg-tertiary/10', tipIcon: Icons.Lightbulb, tip: '"Seu gasto com transporte está 36% abaixo da meta. Excelente controle!"' },
            { title: 'Moradia', status: 'Próximo ao Limite', val: 'R$ 2.100', meta: 'R$ 2.200', progress: '95%', color: 'bg-primary-container', icon: Icons.Inicio, iconColor: 'text-primary', iconBg: 'bg-primary/10', tipIcon: Icons.TrendingDown, tip: '"Contas de energia subiram 12% este mês. Considere revisar o uso de aparelhos de alto consumo."' },
          ].map((cat, i) => (
            <div key={i} className="bg-surface-container-lowest p-8 rounded-xl relative overflow-hidden group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${cat.iconBg} flex items-center justify-center ${cat.iconColor}`}>
                    <cat.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-headline font-semibold text-on-surface">{cat.title}</h3>
                    <span className={`text-xs font-body uppercase tracking-widest ${cat.color === 'bg-error' ? 'text-error' : 'text-secondary'}`}>{cat.status}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-headline font-bold text-primary">{cat.val}</div>
                  <div className="text-sm text-secondary opacity-60">Meta: {cat.meta}</div>
                </div>
              </div>
              <div className="w-full bg-surface-container-low h-2.5 rounded-full mb-4">
                <div className={`${cat.color} h-full rounded-full`} style={{ width: cat.progress }}></div>
              </div>
              <div className="bg-surface-container-low p-4 rounded-lg flex items-start gap-3 border-l-4 border-primary">
                <cat.tipIcon className="text-primary mt-0.5" size={16} />
                <p className="text-sm text-secondary italic">{cat.tip}</p>
              </div>
            </div>
          ))}

          <section className="pt-8">
            <div className="flex items-center gap-3 mb-6">
              <Icons.Add className="text-primary" size={24} />
              <h2 className="text-2xl font-headline font-bold text-on-surface">Recomendações da IA para suas Metas</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-primary/10 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Icons.Metas size={24} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-secondary bg-surface-container-low px-2 py-1 rounded">Prioritário</span>
                </div>
                <h4 className="text-lg font-headline font-bold text-on-surface mb-2">Reforço do Fundo de Emergência</h4>
                <p className="text-sm text-secondary mb-6">Com base no seu saldo atual, sugerimos alocar R$ 200 extras este mês para atingir sua meta de segurança 2 meses antes.</p>
                <button className="w-full py-2.5 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primary-container transition-colors flex items-center justify-center gap-2">
                  <Icons.Check size={18} />
                  Aceitar Meta
                </button>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-tertiary/10 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-lg bg-tertiary/10 text-tertiary">
                    <Icons.Alimentacao size={24} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-secondary bg-surface-container-low px-2 py-1 rounded">Otimização</span>
                </div>
                <h4 className="text-lg font-headline font-bold text-on-surface mb-2">Economize R$ 100 em Jantares</h4>
                <p className="text-sm text-secondary mb-6">Seus gastos com restaurantes aumentaram. Reduzir um jantar fora por semana economizará R$ 100 para sua próxima viagem.</p>
                <button className="w-full py-2.5 bg-tertiary text-white font-bold text-sm rounded-lg hover:bg-tertiary-container transition-colors flex items-center justify-center gap-2">
                  <Icons.Check size={18} />
                  Aceitar Meta
                </button>
              </div>
            </div>
          </section>
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
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 to-transparent flex items-end p-6">
              <div>
                <span className="text-[10px] font-body font-bold text-primary-container uppercase tracking-widest mb-1 block">Artigo Recomendado</span>
                <h4 className="text-white font-headline font-bold text-lg leading-tight">A Arte de Acumular: Estratégias para o Próximo Trimestre</h4>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest/80 backdrop-blur-md p-6 rounded-xl border border-outline-variant/20 shadow-lg">
            <h4 className="font-headline font-bold text-on-surface mb-4">Ações Rápidas</h4>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center p-4 bg-primary text-white rounded-lg hover:bg-primary-container transition-all">
                <Icons.Add className="mb-2" size={20} />
                <span className="text-xs font-bold uppercase">Novo Gasto</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-surface-container-low text-secondary rounded-lg hover:bg-surface-variant transition-all">
                <Icons.Metas className="mb-2" size={20} />
                <span className="text-xs font-bold uppercase">Meta Extra</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.main>
  );
};
