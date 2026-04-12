import React, { useState } from 'react';
import { Icons } from '../lib/icons';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance, Transaction } from '../context/FinanceContext';

const parseDateForInput = (dateStr: string) => {
  const months: Record<string, string> = { Jan: '01', Fev: '02', Mar: '03', Abr: '04', Mai: '05', Jun: '06', Jul: '07', Ago: '08', Set: '09', Out: '10', Nov: '11', Dez: '12' };
  const parts = dateStr.split(' ');
  if (parts.length === 3) {
    const d = parts[0].padStart(2, '0');
    const m = months[parts[1]] || '01';
    const y = parts[2];
    return `${y}-${m}-${d}`;
  }
  return dateStr;
};

const formatDateFromInput = (dateStr: string) => {
  if (!dateStr.includes('-')) return dateStr;
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const [y, m, d] = dateStr.split('-');
  return `${parseInt(d, 10).toString().padStart(2, '0')} ${months[parseInt(m, 10) - 1]} ${y}`;
};

export const Planilha: React.FC = () => {
  const { transactions, goals, removeTransaction, updateTransaction } = useFinance();
  const [statusFilter, setStatusFilter] = useState('all'); // all, pago, pendente
  const [categoryFilter, setCategoryFilter] = useState('Todas as Categorias');
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Transaction>>({});
  const [deletingRowId, setDeletingRowId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Ensuring we compute totalGasto consistently from goals as Metas.tsx does
  const enrichedGoals = goals.map(goal => {
    const categoryTransactions = transactions.filter(t => t.cat.toLowerCase() === goal.title.toLowerCase());
    const val = categoryTransactions.reduce((acc, curr) => acc + curr.val, 0);
    return { ...goal, val };
  });

  const totalGasto = enrichedGoals.reduce((acc, curr) => acc + curr.val, 0);
  const totalMeta = enrichedGoals.reduce((acc, curr) => acc + curr.meta, 0);
  const totalProgress = totalMeta > 0 ? (totalGasto / totalMeta) * 100 : 0;

  const filteredData = transactions.filter(item => {
    if (categoryFilter !== 'Todas as Categorias' && item.cat !== categoryFilter) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pago') return item.status === 'Liquidado';
    if (statusFilter === 'pendente') return item.status === 'Pendente';
    return true;
  });

  const ITEMS_PER_PAGE = 6;
  const maxPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > maxPages || newPage === currentPage) return;
    setSlideDirection(newPage > currentPage ? 'left' : 'right');
    setCurrentPage(newPage);
  };

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
          <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-primary to-primary-container text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
            <Icons.Download size={20} />
            Exportar CSV
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
            <div className="text-3xl font-bold font-headline text-primary">R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="mt-4 pt-4 border-t border-outline-variant/30">
            <div className="h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${Math.min(totalProgress, 100)}%` }}></div>
            </div>
            <span className="text-[10px] text-secondary mt-1 block">{Math.round(totalProgress)}% da meta mensal</span>
          </div>
        </div>

        {goals.slice(0, 3).map((goal, i) => {
          const catTransactions = transactions.filter(t => t.cat.toLowerCase() === goal.title.toLowerCase());
          const catTotal = catTransactions.reduce((acc, curr) => acc + curr.val, 0);
          const CatIcon = Icons[goal.iconKey as keyof typeof Icons] || Icons.Outros;
          return (
            <div key={i} className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className={`p-2 bg-white/50 rounded-lg`}>
                  <CatIcon className={goal.iconColor} size={24} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-tighter ${goal.iconColor}`}>{goal.title}</span>
              </div>
              <div className="mt-6">
                <p className="text-secondary font-body text-xs uppercase mb-1">Total</p>
                <p className="text-2xl font-bold font-headline text-on-surface">R$ {catTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ledger Table Section */}
      <div className="bg-surface-container-low/40 rounded-xl overflow-hidden border border-outline-variant/10">
        <div className="px-8 py-6 border-b border-outline-variant/20 flex flex-wrap gap-6 items-center justify-between">
          <div className="flex gap-6 items-center">
            <select 
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-surface-container-low px-4 py-2 border-b-2 border-outline-variant text-sm font-medium focus:border-primary outline-none rounded-t"
            >
              <option value="Todas as Categorias">Todas as Categorias</option>
              {goals.map(g => <option key={g.id} value={g.title}>{g.title}</option>)}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`font-body text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors ${statusFilter === 'all' ? 'bg-secondary/20 text-on-surface' : 'text-secondary hover:text-on-surface'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('pago')}
                className={`font-body text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors ${statusFilter === 'pago' ? 'bg-primary/20 text-primary' : 'text-secondary hover:text-on-surface'}`}
              >
                Concluídos
              </button>
              <button
                onClick={() => setStatusFilter('pendente')} className={`font-body text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors ${statusFilter === 'pendente' ? 'bg-error/20 text-error' : 'text-secondary hover:text-on-surface'}`}
              >
                Pendentes
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-surface-container-low rounded-lg px-3 py-1.5 border border-outline-variant/10">
            <Icons.Search className="text-secondary" size={18} />
            <input className="bg-transparent border-none focus:ring-0 text-sm w-48 placeholder:text-secondary font-body" placeholder="Buscar lançamento..." type="text" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low/50">
              <tr>
                <th className="px-8 py-4 font-headline text-xs uppercase tracking-widest text-secondary font-bold">Data</th>
                <th className="px-6 py-4 font-headline text-xs uppercase tracking-widest text-secondary font-bold">Descrição</th>
                <th className="px-6 py-4 font-headline text-xs uppercase tracking-widest text-secondary font-bold">Categoria</th>
                <th className="px-6 py-4 font-headline text-xs uppercase tracking-widest text-secondary font-bold">Valor</th>
                <th className="px-6 py-4 font-headline text-xs uppercase tracking-widest text-secondary font-bold">Status</th>
                <th className="px-8 py-4 font-headline text-xs uppercase tracking-widest text-secondary font-bold text-right">
                  Ações
                  <button
                    onClick={() => {
                      if (editingRowId !== null) setEditingRowId(null);
                      setIsCreatingNew(true);
                      setCurrentPage(1);
                      setSlideDirection('left');
                      setEditDraft({ date: '', name: '', cat: goals[0]?.title || '', val: 0, status: 'Pendente', iconKey: 'Outros' });
                    }}
                    className="ml-2 text-primary hover:text-primary-container transition-colors inline-flex align-middle"
                    title="Adicionar Lançamento"
                  >
                    <Icons.Add size={16} />
                  </button>
                </th>
              </tr>
            </thead>
            <AnimatePresence mode="wait" custom={slideDirection}>
              <motion.tbody
                key={currentPage}
                custom={slideDirection}
                initial={(dir: string) => ({ x: dir === 'left' ? 50 : -50, opacity: 0 })}
                animate={{ x: 0, opacity: 1 }}
                exit={(dir: string) => ({ x: dir === 'left' ? -50 : 50, opacity: 0 })}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="divide-y divide-outline-variant/10"
              >
                {isCreatingNew && (
                  <tr className="hover:bg-surface-container-lowest/40 transition-colors group">
                    <td className="px-8 py-5 font-body text-sm text-secondary">
                      <input type="date" className="bg-surface px-2 py-1 rounded border border-outline-variant text-sm w-32 outline-none focus:border-primary" value={parseDateForInput(editDraft.date || '')} onChange={e => setEditDraft({ ...editDraft, date: formatDateFromInput(e.target.value) })} />
                    </td>
                    <td className="px-6 py-5">
                      <input type="text" className="bg-surface px-2 py-1 rounded border border-outline-variant font-semibold text-on-surface w-full outline-none focus:border-primary" value={editDraft.name || ''} onChange={e => setEditDraft({ ...editDraft, name: e.target.value })} />
                    </td>
                    <td className="px-6 py-5">
                      <select className="bg-surface px-2 py-1 rounded border border-outline-variant text-[10px] font-bold uppercase outline-none focus:border-primary" value={editDraft.cat || goals[0]?.title} onChange={e => setEditDraft({ ...editDraft, cat: e.target.value })}>
                        {goals.map(g => <option key={g.id} value={g.title}>{g.title}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-5 font-headline font-bold text-on-surface">
                      <div className="flex items-center gap-1">
                        - R$ <input type="number" className="bg-surface px-2 py-1 rounded border border-outline-variant font-headline font-bold text-on-surface w-24 outline-none focus:border-primary" value={editDraft.val || 0} onChange={e => setEditDraft({ ...editDraft, val: Number(e.target.value) })} step="0.01" />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <select className="bg-surface px-2 py-1 text-xs font-bold uppercase rounded border border-outline-variant outline-none focus:border-primary" value={editDraft.status || 'Pendente'} onChange={e => setEditDraft({ ...editDraft, status: e.target.value as 'Liquidado' | 'Pendente' })}>
                        <option value="Liquidado">Liquidado</option><option value="Pendente">Pendente</option>
                      </select>
                    </td>
                    <td className="px-8 py-5 text-right flex justify-end gap-2 items-center">
                      <button onClick={() => { addTransaction({ id: Date.now(), date: editDraft.date || formatDateFromInput(new Date().toISOString().split('T')[0]), name: editDraft.name || 'Novo Lançamento', cat: editDraft.cat || goals[0]?.title || 'Geral', val: editDraft.val || 0, status: (editDraft.status as 'Liquidado' | 'Pendente') || 'Pendente', iconKey: editDraft.iconKey || 'Outros' }); setIsCreatingNew(false); }} className="text-primary hover:text-primary-container px-2 transition-colors"><Icons.Check size={20} /></button>
                      <button onClick={() => setIsCreatingNew(false)} className="text-secondary hover:text-error px-2 transition-colors"><Icons.Close size={20} /></button>
                    </td>
                  </tr>
                )}
                {paginatedData.map((row) => {
                  const RowIcon = Icons[row.iconKey as keyof typeof Icons] || Icons.Outros;
                  return (
                    <tr key={row.id} className="hover:bg-surface-container-lowest/40 transition-colors group">
                      {editingRowId === row.id ? (
                        <>
                          <td className="px-8 py-5 font-body text-sm text-secondary">
                            <input
                              type="date"
                              className="bg-surface px-2 py-1 rounded border border-outline-variant text-sm w-32 outline-none focus:border-primary"
                              value={parseDateForInput(editDraft.date || row.date)}
                              onChange={e => setEditDraft({ ...editDraft, date: formatDateFromInput(e.target.value) })}
                            />
                          </td>
                          <td className="px-6 py-5">
                            <input
                              type="text"
                              className="bg-surface px-2 py-1 rounded border border-outline-variant font-semibold text-on-surface w-full outline-none focus:border-primary"
                              value={editDraft.name ?? row.name}
                              onChange={e => setEditDraft({ ...editDraft, name: e.target.value })}
                            />
                          </td>
                          <td className="px-6 py-5">
                            <select
                              className="bg-surface px-2 py-1 rounded border border-outline-variant text-[10px] font-bold uppercase outline-none focus:border-primary"
                              value={editDraft.cat ?? row.cat}
                              onChange={e => setEditDraft({ ...editDraft, cat: e.target.value })}
                            >
                              {goals.map(g => <option key={g.id} value={g.title}>{g.title}</option>)}
                            </select>
                          </td>
                          <td className="px-6 py-5 font-headline font-bold text-on-surface">
                            <div className="flex items-center gap-1">
                              - R$ <input
                                type="number"
                                className="bg-surface px-2 py-1 rounded border border-outline-variant font-headline font-bold text-on-surface w-24 outline-none focus:border-primary"
                                value={editDraft.val ?? row.val}
                                onChange={e => setEditDraft({ ...editDraft, val: Number(e.target.value) })}
                                step="0.01"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <select
                              className="bg-surface px-2 py-1 text-xs font-bold uppercase rounded border border-outline-variant outline-none focus:border-primary"
                              value={editDraft.status ?? row.status}
                              onChange={e => setEditDraft({ ...editDraft, status: e.target.value as 'Liquidado' | 'Pendente' })}
                            >
                              <option value="Liquidado">Liquidado</option>
                              <option value="Pendente">Pendente</option>
                            </select>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button
                              onClick={() => {
                                if (editingRowId !== null) {
                                  updateTransaction(editingRowId, editDraft);
                                  setEditingRowId(null);
                                }
                              }}
                              className="text-primary hover:text-primary-container px-2 transition-colors"
                            >
                              <Icons.Check size={20} />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-8 py-5 font-body text-sm text-secondary">{row.date}</td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-surface-variant flex items-center justify-center">
                                <RowIcon className="text-primary" size={14} />
                              </div>
                              <span className="font-semibold text-on-surface">{row.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="px-2 py-1 bg-surface-variant text-tertiary text-[10px] font-bold uppercase rounded">{row.cat}</span>
                          </td>
                          <td className="px-6 py-5 font-headline font-bold text-on-surface">
                            <span className="">
                              - R$ {row.val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-1.5 text-xs text-secondary font-bold uppercase tracking-wider">
                              <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Liquidado' ? 'bg-primary' : 'bg-error'}`}></span>
                              {row.status}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right flex justify-end gap-2 items-center">
                            {editingRowId === null && (
                              <>
                                <button
                                  onClick={() => { setEditingRowId(row.id); setEditDraft(row); }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-secondary hover:text-primary px-2"
                                >
                                  <Icons.Edit size={16} />
                                </button>
                                <button
                                  onClick={() => setDeletingRowId(row.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-secondary hover:text-error px-2"
                                >
                                  <Icons.Trash size={16} />
                                </button>
                              </>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
                {paginatedData.length === 0 && !isCreatingNew && (
                  <tr>
                    <td colSpan={6} className="px-8 py-10 text-center text-sm font-body text-secondary">Nenhum lançamento encontrado.</td>
                  </tr>
                )}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>

        <div className="px-8 py-4 bg-surface-container-low/30 border-t border-outline-variant/10 flex justify-between items-center overflow-hidden">
          <span className="text-xs text-secondary font-body">Mostrando {paginatedData.length} de {filteredData.length} lançamentos</span>
          <div className="flex gap-2 items-center relative h-10 w-48 justify-center shrink-0">
            {currentPage > 1 && (
              <button onClick={() => changePage(currentPage - 1)} className="absolute left-0 p-1 hover:bg-surface-container-low rounded-full transition-colors z-10 bg-surface/50 backdrop-blur">
                <Icons.ChevronLeft size={16} />
              </button>
            )}

            <div className="flex gap-3 overflow-hidden px-8 items-center flex-1 justify-center relative w-full h-full">
              <AnimatePresence mode="popLayout" custom={slideDirection}>
                {currentPage > 1 && (
                  <motion.button
                    key={`p-${currentPage - 1}`}
                    custom={slideDirection}
                    initial={(dir: string) => ({ x: dir === 'left' ? 30 : -30, opacity: 0 })}
                    animate={{ x: 0, opacity: 0.5 }}
                    exit={(dir: string) => ({ x: dir === 'left' ? -30 : 30, opacity: 0 })}
                    transition={{ duration: 0.3 }}
                    onClick={() => changePage(currentPage - 1)}
                    className="px-2 py-1 bg-surface-variant text-secondary rounded text-xs font-bold"
                  >
                    {currentPage - 1}
                  </motion.button>
                )}
                <motion.button
                  key={`c-${currentPage}`}
                  custom={slideDirection}
                  initial={(dir: string) => ({ x: dir === 'left' ? 30 : -30, opacity: 0 })}
                  animate={{ x: 0, opacity: 1 }}
                  exit={(dir: string) => ({ x: dir === 'left' ? -30 : 30, opacity: 0 })}
                  transition={{ duration: 0.3 }}
                  className="px-3 py-1 bg-primary text-white rounded text-xs font-bold shadow flex-shrink-0"
                >
                  {currentPage}
                </motion.button>
                {currentPage < maxPages && (
                  <motion.button
                    key={`n-${currentPage + 1}`}
                    custom={slideDirection}
                    initial={(dir: string) => ({ x: dir === 'left' ? 30 : -30, opacity: 0 })}
                    animate={{ x: 0, opacity: 0.5 }}
                    exit={(dir: string) => ({ x: dir === 'left' ? -30 : 30, opacity: 0 })}
                    transition={{ duration: 0.3 }}
                    onClick={() => changePage(currentPage + 1)}
                    className="px-2 py-1 bg-surface-variant text-secondary rounded text-xs font-bold"
                  >
                    {currentPage + 1}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {currentPage < maxPages && (
              <button onClick={() => changePage(currentPage + 1)} className="absolute right-0 p-1 hover:bg-surface-container-low rounded-full transition-colors z-10 bg-surface/50 backdrop-blur">
                <Icons.ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-surface-container-low p-8 rounded-xl">
          <h3 className="text-lg font-bold font-headline text-primary mb-6">Pacing Orçamentário</h3>
          <div className="space-y-6">
            {goals.slice(0, 3).map(goal => {
              const spent = transactions.filter(t => t.cat.toLowerCase() === goal.title.toLowerCase()).reduce((a, c) => a + c.val, 0);
              const progress = goal.meta > 0 ? Math.min((spent / goal.meta) * 100, 100) : 0;
              return (
                <div key={goal.id}>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-secondary uppercase font-body">{goal.title}</span>
                    <span className="text-xs font-bold text-primary">R$ {spent.toLocaleString('pt-BR')} / R$ {goal.meta.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                    <div className={`h-full ${spent > goal.meta ? 'bg-error' : 'bg-tertiary'} rounded-full`} style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="md:col-span-2 relative overflow-hidden rounded-xl bg-surface-variant">
          <img
            className="w-full h-full object-cover opacity-80 mix-blend-multiply transition-transform duration-700 hover:scale-105"
            src="https://picsum.photos/seed/finance/1200/600"
            alt="Finance"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-variant/90 to-transparent p-10 flex flex-col justify-center">
            <h2 className="text-3xl font-bold font-headline text-primary leading-tight mb-2">Seu futuro está sendo<br />escrito agora.</h2>
            <p className="text-secondary max-w-xs font-body text-sm leading-relaxed">Continue registrando seus dados para gerar relatórios de tendência e previsibilidade patrimonial.</p>
          </div>
        </div>
      </div>

      {deletingRowId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setDeletingRowId(null)}
        >
          <div
            className="bg-surface-container-lowest p-8 rounded-xl shadow-2xl max-w-sm w-full mx-4 border border-outline-variant/20 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-6">
                <Icons.Warning size={32} />
              </div>
              <h3 className="font-headline text-xl font-bold text-on-surface mb-3">Excluir Lançamento</h3>
              <p className="font-body text-secondary text-sm mb-8 leading-relaxed">
                Tem certeza que deseja excluir essa transação permanentemente? Essa ação não poderá ser desfeita.
              </p>
              <div className="flex gap-4 w-full">
                <button
                  onClick={() => setDeletingRowId(null)}
                  className="flex-1 py-3 px-4 font-bold text-secondary bg-surface-container-low hover:bg-surface-variant rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    removeTransaction(deletingRowId);
                    setDeletingRowId(null);
                  }}
                  className="flex-1 py-3 px-4 font-bold text-white bg-error hover:opacity-90 rounded-lg shadow-sm shadow-error/20 transition-all active:scale-95"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.main>
  );
};
