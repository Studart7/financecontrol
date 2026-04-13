import React, { useState, useMemo, useRef } from 'react';
import { Icons } from '../lib/icons';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../context/FinanceContext';
import type { UploadedFile } from './Inicio';

export interface ConfirmedFile {
  fileName: string;
  establishment: string;
  value: number;
  category: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: UploadedFile[];
  onComplete: (confirmed: ConfirmedFile[]) => void;
}

// Fake data generators
const FAKE_ESTABLISHMENTS = [
  'Whole Foods Market', 'Posto Shell BR-101', 'Uber Eats', 'iFood Delivery',
  'Farmácia São João', 'Mercado Livre', 'Netflix Assinatura', 'Cinema Cinemark',
  'Padaria Real', 'Amazon.com.br', 'Zara Brasil', 'Starbucks Coffee',
  'Restaurante Outback', 'Drogaria Araújo', 'Lojas Americanas'
];

const FAKE_CATEGORIES = ['Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Moradia'];

const FAKE_DATES_DISPLAY = [
  '24 Out 2024', '15 Nov 2024', '03 Dez 2024', '12 Jan 2025',
  '28 Fev 2025', '07 Mar 2025', '19 Abr 2025', '22 Mai 2025'
];

// Map categories to icon keys used by the app
const CATEGORY_ICON_MAP: Record<string, string> = {
  'Alimentação': 'Alimentacao',
  'Transporte': 'Transporte',
  'Saúde': 'History',
  'Lazer': 'Outros',
  'Moradia': 'Inicio',
};

interface FakeExtractedData {
  date: string;
  value: string;
  numericValue: number;
  establishment: string;
  category: string;
  confidence: number;
}

function generateFakeData(): FakeExtractedData {
  const numericValue = Math.round(Math.random() * 900 + 10);
  const value = numericValue.toFixed(2).replace('.', ',');
  const confidence = Math.floor(Math.random() * 15) + 85;
  return {
    date: FAKE_DATES_DISPLAY[Math.floor(Math.random() * FAKE_DATES_DISPLAY.length)],
    value,
    numericValue,
    establishment: FAKE_ESTABLISHMENTS[Math.floor(Math.random() * FAKE_ESTABLISHMENTS.length)],
    category: FAKE_CATEGORIES[Math.floor(Math.random() * FAKE_CATEGORIES.length)],
    confidence,
  };
}

export const RevisionModal: React.FC<ModalProps> = ({ isOpen, onClose, files, onComplete }) => {
  const { addTransaction } = useFinance();
  const [currentIndex, setCurrentIndex] = useState(0);
  const confirmedRef = useRef<ConfirmedFile[]>([]);

  const dateRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<HTMLInputElement>(null);
  const establishmentRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);

  const filesData = useMemo(() => {
    return files.map(() => generateFakeData());
  }, [files]);

  const totalFiles = files.length;
  const currentFile = files[currentIndex];
  const currentData = filesData[currentIndex];

  const finishFlow = () => {
    onComplete([...confirmedRef.current]);
    confirmedRef.current = [];
    setCurrentIndex(0);
    onClose();
  };

  const handleConfirm = () => {
    const date = dateRef.current?.value || currentData.date;
    const rawValue = valueRef.current?.value || currentData.value;
    const numericVal = parseFloat(rawValue.replace(',', '.')) || currentData.numericValue;
    const establishment = establishmentRef.current?.value || currentData.establishment;
    const category = categoryRef.current?.value || currentData.category;

    addTransaction({
      id: Date.now() + currentIndex,
      date,
      name: establishment,
      cat: category,
      val: numericVal,
      status: 'Liquidado',
      iconKey: CATEGORY_ICON_MAP[category] || 'ShoppingBag',
    });

    confirmedRef.current.push({
      fileName: currentFile.name,
      establishment,
      value: numericVal,
      category,
    });

    if (currentIndex < totalFiles - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishFlow();
    }
  };

  const handleDiscard = () => {
    if (currentIndex < totalFiles - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishFlow();
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      confirmedRef.current = [];
    }
  }, [isOpen]);

  if (!currentFile || !currentData) return null;

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
                  {totalFiles > 1 && (
                    <p className="font-body text-sm text-primary font-semibold mt-1">
                      Arquivo {currentIndex + 1} de {totalFiles}
                    </p>
                  )}
                </div>
                <button onClick={onClose} className="text-secondary hover:text-primary transition-colors p-2">
                  <Icons.Close size={24} />
                </button>
              </div>

              {totalFiles > 1 && (
                <div className="mb-8">
                  <div className="h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentIndex + 1) / totalFiles) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-10"
                >
                  <div className="lg:col-span-5 space-y-4">
                    <div className="relative bg-surface-container-low rounded-lg p-3 overflow-hidden aspect-[3/4] flex items-center justify-center shadow-inner group">
                      {currentFile.preview ? (
                        <img alt={currentFile.name} className="w-full h-full object-cover rounded opacity-90 brightness-105 contrast-100 transition-transform duration-500 group-hover:scale-110" src={currentFile.preview} />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center gap-4">
                          <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Icons.Planilha size={48} className="text-primary" />
                          </div>
                          <div>
                            <p className="font-headline font-bold text-on-surface text-lg">{currentFile.name}</p>
                            <p className="text-sm text-secondary mt-1">{currentFile.size}</p>
                          </div>
                        </div>
                      )}
                      {currentFile.preview && (
                        <>
                          <div className="absolute top-[28%] left-[22%] w-[35%] h-[4%] bg-primary/20 border border-primary/50 rounded-sm"></div>
                          <div className="absolute top-[35%] left-[22%] w-[50%] h-[5%] bg-tertiary/20 border border-tertiary/50 rounded-sm"></div>
                          <div className="absolute top-[62%] right-[18%] w-[20%] h-[6%] bg-primary/20 border border-primary/50 rounded-sm"></div>
                        </>
                      )}
                      <div className="absolute top-4 left-4 bg-surface-container-lowest/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                        <Icons.Language size={14} className="text-primary" />
                        <span className="text-[10px] font-bold font-headline text-on-surface uppercase tracking-tight">Visualização do Recibo</span>
                      </div>
                    </div>
                    <p className="font-body text-xs text-secondary italic text-center px-4">
                      {currentFile.preview ? 'Passe o mouse para dar zoom nos detalhes do comprovante.' : 'Documento PDF — a pré-visualização não está disponível.'}
                    </p>
                  </div>

                  <div className="lg:col-span-7 flex flex-col h-full">
                    <div className="bg-surface-container-low p-6 md:p-8 rounded-lg flex-grow">
                      <h3 className="font-headline text-lg font-bold mb-6 text-on-surface flex items-center gap-3">
                        <Icons.Add className="text-primary" size={20} />
                        Dados Extraídos pela IA
                      </h3>
                      <form className="space-y-5" onSubmit={e => e.preventDefault()}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <label className="font-body text-[10px] text-secondary uppercase font-bold tracking-widest ml-1">Data</label>
                            <div className="bg-surface-container-low border-b-2 border-outline-variant focus-within:border-primary transition-all p-3 flex items-center gap-3 rounded-t">
                              <Icons.Inicio size={16} className="text-secondary" />
                              <input ref={dateRef} className="bg-transparent border-none p-0 w-full focus:ring-0 text-on-surface font-body font-medium outline-none" type="text" defaultValue={currentData.date} key={`date-${currentIndex}`} />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-body text-[10px] text-secondary uppercase font-bold tracking-widest ml-1">Valor</label>
                            <div className="bg-surface-container-low border-b-2 border-outline-variant focus-within:border-primary transition-all p-3 flex items-center gap-1 rounded-t">
                              <span className="font-bold text-primary mr-1">R$</span>
                              <input ref={valueRef} className="bg-transparent border-none p-0 w-full focus:ring-0 text-on-surface font-body font-bold text-lg outline-none" type="text" defaultValue={currentData.value} key={`val-${currentIndex}`} />
                              <Icons.Payment size={16} className="text-secondary" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-body text-[10px] text-secondary uppercase font-bold tracking-widest ml-1">Estabelecimento</label>
                          <div className="bg-surface-container-low border-b-2 border-outline-variant focus-within:border-primary transition-all p-3 flex items-center gap-3 rounded-t">
                            <Icons.Store size={16} className="text-secondary" />
                            <input ref={establishmentRef} className="bg-transparent border-none p-0 w-full focus:ring-0 text-on-surface font-body font-medium outline-none" type="text" defaultValue={currentData.establishment} key={`est-${currentIndex}`} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-body text-[10px] text-secondary uppercase font-bold tracking-widest ml-1">Categoria</label>
                          <div className="bg-surface-container-low border-b-2 border-outline-variant focus-within:border-primary transition-all p-3 flex items-center gap-3 rounded-t relative">
                            <Icons.ShoppingBag size={16} className="text-secondary" />
                            <select ref={categoryRef} className="bg-transparent border-none p-0 w-full focus:ring-0 text-on-surface font-body font-medium appearance-none cursor-pointer pr-8 outline-none" defaultValue={currentData.category} key={`cat-${currentIndex}`}>
                              {FAKE_CATEGORIES.map(cat => (<option key={cat}>{cat}</option>))}
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
                            <span className="text-2xl font-headline font-bold text-tertiary">{currentData.confidence}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden">
                          <div className="h-full bg-tertiary rounded-full transition-all duration-500" style={{ width: `${currentData.confidence}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                      <button onClick={handleConfirm} className="bg-gradient-to-br from-primary to-primary-container text-surface-container-lowest font-headline font-bold py-4 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95">
                        <Icons.Check size={20} />
                        {currentIndex < totalFiles - 1 ? 'Confirmar e Próximo' : 'Confirmar Transação'}
                      </button>
                      <button onClick={handleDiscard} className="bg-transparent text-secondary font-headline font-bold py-4 rounded-lg flex items-center justify-center gap-2 border border-secondary/30 hover:bg-surface-container-low transition-all active:scale-95">
                        <Icons.Trash size={20} />
                        Descartar Recibo
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
