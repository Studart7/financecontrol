import React from 'react';
import { Icons } from '../lib/icons';
import { motion, AnimatePresence } from 'motion/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RevisionModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-surface w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border border-outline-variant/30 relative z-10"
          >
            <div className="p-6 md:p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="font-body text-xs text-secondary uppercase tracking-widest mb-1">Processamento de IA</p>
                  <h2 className="font-headline text-2xl md:text-3xl font-bold text-on-surface">Revisão de Transação</h2>
                </div>
                <button onClick={onClose} className="text-secondary hover:text-primary transition-colors p-2">
                  <Icons.Close size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-5 space-y-4">
                  <div className="relative bg-surface-container-low rounded-lg p-3 overflow-hidden aspect-[3/4] flex items-center justify-center shadow-inner group">
                    <img 
                      alt="Recibo" 
                      className="w-full h-full object-cover rounded opacity-90 brightness-105 contrast-100 transition-transform duration-500 group-hover:scale-110" 
                      src="https://picsum.photos/seed/receipt/600/800"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-[28%] left-[22%] w-[35%] h-[4%] bg-primary/20 border border-primary/50 rounded-sm"></div>
                    <div className="absolute top-[35%] left-[22%] w-[50%] h-[5%] bg-tertiary/20 border border-tertiary/50 rounded-sm"></div>
                    <div className="absolute top-[62%] right-[18%] w-[20%] h-[6%] bg-primary/20 border border-primary/50 rounded-sm"></div>
                    <div className="absolute top-4 left-4 bg-surface-container-lowest/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                      <Icons.Language size={14} className="text-primary" />
                      <span className="text-[10px] font-bold font-headline text-on-surface uppercase tracking-tight">Visualização do Recibo</span>
                    </div>
                  </div>
                  <p className="font-body text-xs text-secondary italic text-center px-4">Passe o mouse para dar zoom nos detalhes do comprovante.</p>
                </div>

                <div className="lg:col-span-7 flex flex-col h-full">
                  <div className="bg-surface-container-low p-6 md:p-8 rounded-lg flex-grow">
                    <h3 className="font-headline text-lg font-bold mb-6 text-on-surface flex items-center gap-3">
                      <Icons.Add className="text-primary" size={20} />
                      Dados Extraídos pela IA
                    </h3>
                    <form className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="font-body text-[10px] text-secondary uppercase font-bold tracking-widest ml-1">Data</label>
                          <div className="bg-surface-container-low border-b-2 border-outline-variant focus-within:border-primary transition-all p-3 flex items-center gap-3 rounded-t">
                            <Icons.Inicio size={16} className="text-secondary" />
                            <input className="bg-transparent border-none p-0 w-full focus:ring-0 text-on-surface font-body font-medium" type="text" defaultValue="24 Out, 2023"/>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-body text-[10px] text-secondary uppercase font-bold tracking-widest ml-1">Valor</label>
                          <div className="bg-surface-container-low border-b-2 border-outline-variant focus-within:border-primary transition-all p-3 flex items-center gap-1 rounded-t">
                            <span className="font-bold text-primary mr-1">R$</span>
                            <input className="bg-transparent border-none p-0 w-full focus:ring-0 text-on-surface font-body font-bold text-lg" type="text" defaultValue="142,50"/>
                            <Icons.Payment size={16} className="text-secondary" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-body text-[10px] text-secondary uppercase font-bold tracking-widest ml-1">Estabelecimento</label>
                        <div className="bg-surface-container-low border-b-2 border-outline-variant focus-within:border-primary transition-all p-3 flex items-center gap-3 rounded-t">
                          <Icons.Store size={16} className="text-secondary" />
                          <input className="bg-transparent border-none p-0 w-full focus:ring-0 text-on-surface font-body font-medium" type="text" defaultValue="Whole Foods Market"/>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-body text-[10px] text-secondary uppercase font-bold tracking-widest ml-1">Categoria</label>
                        <div className="bg-surface-container-low border-b-2 border-outline-variant focus-within:border-primary transition-all p-3 flex items-center gap-3 rounded-t relative">
                          <Icons.ShoppingBag size={16} className="text-secondary" />
                          <select className="bg-transparent border-none p-0 w-full focus:ring-0 text-on-surface font-body font-medium appearance-none cursor-pointer pr-8">
                            <option>Supermercado</option>
                            <option>Lazer</option>
                            <option>Transporte</option>
                            <option>Saúde</option>
                          </select>
                        </div>
                      </div>
                    </form>

                    <div className="mt-8 pt-8 border-t border-outline-variant/30">
                      <div className="flex justify-between items-end mb-3">
                        <div>
                          <h4 className="font-headline text-[11px] font-bold text-on-surface uppercase tracking-tight">Confiança do OCR</h4>
                          <p className="font-body text-[10px] text-secondary">Precisão alta baseada no modelo v4.2</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-headline font-bold text-tertiary">98%</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden">
                        <div className="h-full bg-tertiary rounded-full" style={{ width: '98%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    <button onClick={onClose} className="bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold py-4 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95">
                      <Icons.Check size={20} />
                      Confirmar Transação
                    </button>
                    <button onClick={onClose} className="bg-transparent text-secondary font-headline font-bold py-4 rounded-lg flex items-center justify-center gap-2 border border-secondary/30 hover:bg-surface-container-low transition-all active:scale-95">
                      <Icons.Trash size={20} />
                      Descartar Recibo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
