import React from 'react';
import { Icons } from '../lib/icons';
import { motion } from 'motion/react';

export const Planilha: React.FC = () => {
  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-8 py-10"
    >
      {/* Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="font-body text-xs uppercase tracking-[0.2em] text-secondary mb-2 block">Gestão de Patrimônio</span>
          <h1 className="text-5xl font-extrabold text-primary tracking-tight font-headline">Planilha Financeira</h1>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 border border-secondary/30 text-secondary font-medium rounded-lg hover:bg-surface-container-low transition-all">
            <Icons.Download size={20} />
            Exportar CSV
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-primary to-primary-container text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
            <Icons.Add size={20} />
            Adicionar Recibos
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_4px_24px_-10px_rgba(31,28,13,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-secondary mb-1">
              <Icons.Payment size={18} />
              <span className="font-body text-[10px] uppercase font-bold tracking-widest">Total Geral</span>
            </div>
            <div className="text-3xl font-bold font-headline text-primary">R$ 12.450,00</div>
          </div>
          <div className="mt-4 pt-4 border-t border-outline-variant/30">
            <div className="h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden">
              <div className="h-full bg-primary w-3/4 rounded-full"></div>
            </div>
            <span className="text-[10px] text-secondary mt-1 block">75% da meta mensal</span>
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white/50 rounded-lg">
              <Icons.Alimentacao className="text-tertiary" size={24} />
            </div>
            <span className="text-[10px] font-bold text-tertiary uppercase tracking-tighter">Variável</span>
          </div>
          <div className="mt-6">
            <p className="text-secondary font-body text-xs uppercase mb-1">Alimentação</p>
            <p className="text-2xl font-bold font-headline text-on-surface">R$ 2.850,00</p>
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white/50 rounded-lg">
              <Icons.Transporte className="text-tertiary" size={24} />
            </div>
            <span className="text-[10px] font-bold text-tertiary uppercase tracking-tighter">Logística</span>
          </div>
          <div className="mt-6">
            <p className="text-secondary font-body text-xs uppercase mb-1">Transporte</p>
            <p className="text-2xl font-bold font-headline text-on-surface">R$ 920,00</p>
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white/50 rounded-lg">
              <Icons.Outros className="text-tertiary" size={24} />
            </div>
            <span className="text-[10px] font-bold text-tertiary uppercase tracking-tighter">Diversos</span>
          </div>
          <div className="mt-6">
            <p className="text-secondary font-body text-xs uppercase mb-1">Outros</p>
            <p className="text-2xl font-bold font-headline text-on-surface">R$ 1.420,00</p>
          </div>
        </div>
      </div>

      {/* Ledger Table Section */}
      <div className="bg-surface-container-low/40 rounded-xl overflow-hidden border border-outline-variant/10">
        <div className="px-8 py-6 border-b border-outline-variant/20 flex flex-wrap gap-6 items-center justify-between">
          <div className="flex gap-6 items-center">
            <select className="bg-surface-container-low px-4 py-2 border-b-2 border-outline-variant text-sm font-medium focus:border-primary outline-none rounded-t">
              <option>Todas as Categorias</option>
              <option>Alimentação</option>
              <option>Transporte</option>
            </select>
            <select className="bg-surface-container-low px-4 py-2 border-b-2 border-outline-variant text-sm font-medium focus:border-primary outline-none rounded-t">
              <option>Período: Outubro 2024</option>
            </select>
          </div>
          <div className="flex items-center gap-3 bg-surface-container-low rounded-lg px-3 py-1.5 border border-outline-variant/10">
            <Icons.Search className="text-secondary" size={18} />
            <input className="bg-transparent border-none focus:ring-0 text-sm w-48 placeholder:text-secondary font-body" placeholder="Buscar lançamento..." type="text"/>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low/50">
              <tr>
                <th className="px-8 py-4 font-headline text-xs uppercase tracking-widest text-secondary font-bold">Data</th>
                <th className="px-6 py-4 font-headline text-xs uppercase tracking-widest text-secondary font-bold">Estabelecimento</th>
                <th className="px-6 py-4 font-headline text-xs uppercase tracking-widest text-secondary font-bold">Categoria</th>
                <th className="px-6 py-4 font-headline text-xs uppercase tracking-widest text-secondary font-bold">Valor</th>
                <th className="px-6 py-4 font-headline text-xs uppercase tracking-widest text-secondary font-bold">Status</th>
                <th className="px-8 py-4 font-headline text-xs uppercase tracking-widest text-secondary font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {[
                { date: '24 Out 2024', name: 'Pão de Açúcar', cat: 'Alimentação', val: 'R$ 482,50', status: 'Liquidado', icon: Icons.ShoppingBag },
                { date: '22 Out 2024', name: 'Uber Viagens', cat: 'Transporte', val: 'R$ 45,90', status: 'Liquidado', icon: Icons.Transporte },
                { date: '20 Out 2024', name: 'Starbucks Reserve', cat: 'Alimentação', val: 'R$ 32,00', status: 'Pendente', icon: Icons.Alimentacao },
                { date: '19 Out 2024', name: 'SmartFit', cat: 'Saúde', val: 'R$ 119,90', status: 'Liquidado', icon: Icons.History },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-surface-container-lowest/40 transition-colors group">
                  <td className="px-8 py-5 font-body text-sm text-secondary">{row.date}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-surface-variant flex items-center justify-center">
                        <row.icon className="text-primary" size={14} />
                      </div>
                      <span className="font-semibold text-on-surface">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-2 py-1 bg-surface-variant text-tertiary text-[10px] font-bold uppercase rounded">{row.cat}</span>
                  </td>
                  <td className="px-6 py-5 font-headline font-bold text-on-surface">{row.val}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5 text-xs text-secondary">
                      <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Liquidado' ? 'bg-green-600' : 'bg-orange-400'}`}></span>
                      {row.status}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-secondary hover:text-primary px-2">
                      <Icons.Edit size={16} />
                    </button>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-secondary hover:text-error px-2">
                      <Icons.Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-4 bg-surface-container-low/30 border-t border-outline-variant/10 flex justify-between items-center">
          <span className="text-xs text-secondary font-body">Mostrando 4 de 128 lançamentos</span>
          <div className="flex gap-2">
            <button className="p-1 hover:bg-surface-container-low rounded transition-colors"><Icons.ChevronLeft size={16}/></button>
            <button className="px-3 py-1 bg-primary text-white rounded text-xs font-bold">1</button>
            <button className="px-3 py-1 hover:bg-surface-container-low rounded text-xs text-secondary">2</button>
            <button className="px-3 py-1 hover:bg-surface-container-low rounded text-xs text-secondary">3</button>
            <button className="p-1 hover:bg-surface-container-low rounded transition-colors"><Icons.ChevronRight size={16}/></button>
          </div>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-surface-container-low p-8 rounded-xl">
          <h3 className="text-lg font-bold font-headline text-primary mb-6">Pacing Orçamentário</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-secondary uppercase font-body">Fixos</span>
                <span className="text-xs font-bold text-primary">R$ 4.200 / R$ 5.000</span>
              </div>
              <div className="h-2 w-full bg-surface-variant rounded-full">
                <div className="h-full bg-tertiary rounded-full" style={{ width: '84%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-secondary uppercase font-body">Lazer</span>
                <span className="text-xs font-bold text-primary">R$ 1.150 / R$ 1.200</span>
              </div>
              <div className="h-2 w-full bg-surface-variant rounded-full">
                <div className="h-full bg-primary-container rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 relative overflow-hidden rounded-xl bg-surface-variant">
          <img 
            className="w-full h-full object-cover opacity-80 mix-blend-multiply" 
            src="https://picsum.photos/seed/finance/1200/600" 
            alt="Finance"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-variant/80 to-transparent p-10 flex flex-col justify-center">
            <h2 className="text-3xl font-bold font-headline text-primary leading-tight mb-2">Seu futuro está sendo<br/>escrito agora.</h2>
            <p className="text-secondary max-w-xs font-body text-sm leading-relaxed">Continue registrando seus dados para gerar relatórios de tendência e previsibilidade patrimonial.</p>
          </div>
        </div>
      </div>
    </motion.main>
  );
};
