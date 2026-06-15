import React, { useRef, useState, useCallback } from 'react';
import { Icons } from '../lib/icons';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance, Transaction } from '../context/FinanceContext';
import { RevisionModal } from './RevisionModal';

export interface UploadedFile {
  id: string;
  file: File;
  preview: string | null;
  name: string;
  size: string;
  type: string;
  status: 'processing' | 'done';
    extractedData?: {
      establishment: string;
      val: number;
      category: string;
      date?: string;
    };
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png';

const MOCK_ESTABLISHMENTS = ['Supermercado Dia', 'Posto Shell', 'Farmácia Pague Menos', 'Restaurante Madero', 'Uber', 'Ifood'];
const MOCK_CATEGORIES = ['Alimentação', 'Transporte', 'Saúde', 'Moradia', 'Lazer', 'Outros'];

export const Inicio: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addTransaction, currentMonthTransactions } = useFinance();
  const [pendingQueue, setPendingQueue] = useState<Array<{data: any, fileId: string}>>([]);

  const processFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    const validFiles = Array.from(fileList).filter(f => ACCEPTED_TYPES.includes(f.type));

    validFiles.forEach(async (file) => {
      const fileId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const uploadedFile: UploadedFile = {
        id: fileId,
        file,
        preview: null,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        status: 'processing'
      };

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, preview: e.target?.result as string } : f
          ));
        };
        reader.readAsDataURL(file);
      }

      setFiles(prev => [uploadedFile, ...prev]);

      try {
        const formData = new FormData();
        formData.append('receipt', file);

        const res = await fetch('http://localhost:3001/api/process-receipt', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error('Failed to process receipt');
        }

        const data = await res.json();
        const est = data.establishment;
        const cat = data.category;
        const val = data.val;
        
        let txDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('. de ', ' ');
        if (data.date) {
          const [y, m, d] = data.date.split('-');
          if (y && m && d) {
             const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
             txDate = `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
          }
        }

        setPendingQueue(prev => {
          return [...prev, { 
            data: {
              date: txDate,
              name: est,
              cat: cat,
              val: val,
              status: data.status || 'Liquidado'
            }, 
            fileId 
          }];
        });
      } catch (error) {
        console.error('Error processing file:', error);
        setFiles(prev => prev.filter(f => f.id !== fileId));
        alert('Erro ao processar o arquivo. Tente novamente.');
      }
    });
  }, []);

  const handleSaveTransaction = (editedData: { date: string; name: string; cat: string; val: number }) => {
    if (pendingQueue.length === 0) return;
    const currentItem = pendingQueue[0];
    
    const tx: Transaction = {
      id: Date.now(),
      date: editedData.date,
      name: editedData.name,
      cat: editedData.cat,
      val: editedData.val,
      status: (currentItem.data.status === 'Pendente' ? 'Pendente' : 'Liquidado') as 'Liquidado' | 'Pendente',
      iconKey: editedData.cat === 'Alimentação' ? 'Alimentacao' : editedData.cat === 'Transporte' ? 'Transporte' : editedData.cat === 'Saúde' ? 'History' : editedData.cat === 'Moradia' ? 'Inicio' : 'Outros'
    };

    addTransaction(tx);

    setFiles(prev => prev.map(f => 
      f.id === currentItem.fileId ? { 
        ...f, 
        status: 'done',
        extractedData: { establishment: editedData.name, val: editedData.val, category: editedData.cat, date: editedData.date }
      } : f
    ));

    setPendingQueue(prev => prev.slice(1));
  };

  const handleCancelTransaction = () => {
    if (pendingQueue.length === 0) return;
    const currentItem = pendingQueue[0];
    setFiles(prev => prev.filter(f => f.id !== currentItem.fileId));
    setPendingQueue(prev => prev.slice(1));
  };

  const handleSelectFiles = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };

  const currentMonthTotal = currentMonthTransactions.reduce((acc, curr) => acc + curr.val, 0);

  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pt-12 pb-24 px-6 md:px-12 max-w-7xl mx-auto"
    >
      <input 
        ref={fileInputRef}
        type="file" 
        accept={ACCEPTED_EXTENSIONS}
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="mb-12 max-w-3xl">
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-on-surface leading-[1.1] mb-6 tracking-tight">
          Adicionar Gasto
        </h1>
        <p className="text-secondary text-lg md:text-xl font-light max-w-xl">
          Apenas jogue a foto ou o PDF aqui. A Leitura Inteligente faz o resto.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Resumo Rápido para Disclosure Progressivo */}
          <div className="bg-surface-container-low p-8 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center border border-outline-variant/30">
            <div>
              <p className="text-secondary font-semibold uppercase tracking-wider text-sm mb-1">Gasto Acumulado (Este mês)</p>
              <h2 className="font-headline text-4xl font-bold text-on-surface">
                R$ {currentMonthTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>

          <div 
            onClick={files.length === 0 ? handleSelectFiles : undefined}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`bg-surface-container-lowest rounded-2xl border-2 border-dashed transition-all h-[300px] flex flex-col relative overflow-hidden ${
              isDragging 
                ? 'border-primary bg-primary/5 scale-[1.01]' 
                : 'border-outline-variant hover:border-primary/50'
            } ${files.length === 0 ? 'cursor-pointer' : ''}`}
          >
            {files.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 group pointer-events-none">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icons.Add className="text-primary" size={40} />
                </div>
                <h2 className="font-headline text-2xl font-bold mb-3 text-on-surface">Arraste a foto ou clique aqui</h2>
                <p className="text-secondary mb-8 max-w-sm">A Leitura Inteligente lê PDFs e Imagens para você não precisar digitar.</p>
              </div>
            ) : (
              <div className="flex flex-col h-full bg-surface-container-lowest z-10">
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline-variant/20 bg-surface-container-lowest sticky top-0 z-20">
                  <h3 className="font-headline font-bold text-on-surface text-lg">
                    Lidos recentemente
                  </h3>
                  <button 
                    onClick={handleSelectFiles}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
                  >
                    <Icons.Add size={16} />
                    Ler mais notas
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <AnimatePresence initial={false}>
                    {files.map((f) => (
                      <motion.div 
                        key={f.id}
                        initial={{ opacity: 0, height: 0, scale: 0.9 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        className="flex items-center gap-4 bg-surface-container p-4 rounded-xl shadow-sm border border-outline-variant/20"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-variant flex items-center justify-center flex-shrink-0">
                          {f.preview ? (
                            <img src={f.preview} alt={f.name} className="w-full h-full object-cover" />
                          ) : (
                            <Icons.Planilha size={20} className="text-primary" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-body font-bold text-on-surface text-sm truncate">{f.name}</p>
                          {f.status === 'processing' ? (
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-xs text-secondary font-medium">Leitura inteligente em andamento...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="text-xs text-tertiary font-bold">{f.extractedData?.establishment}</span>
                              <span className="text-[10px] text-secondary px-2 py-0.5 bg-surface-variant rounded-full uppercase font-bold">{f.extractedData?.category}</span>
                              {f.extractedData?.date && <span className="text-[10px] text-secondary px-2 py-0.5 border border-outline-variant/30 rounded-full">{f.extractedData.date}</span>}
                            </div>
                          )}
                        </div>

                        {f.status === 'done' && (
                          <div className="flex items-center gap-4">
                            <span className="font-headline font-bold text-lg text-on-surface">R$ {f.extractedData?.val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            <div className="w-8 h-8 bg-tertiary/20 rounded-full flex items-center justify-center text-tertiary">
                              <Icons.Check size={16} />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="relative overflow-hidden rounded-2xl aspect-square flex-grow min-h-[300px]">
            <img 
              alt="Inteligência Artificial" 
              className="absolute inset-0 w-full h-full object-cover grayscale brightness-50" 
              src="https://picsum.photos/seed/tech/600/600"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8 flex flex-col justify-end">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mb-4">
                <Icons.Language size={20} className="text-surface-container-lowest" />
              </div>
              <h4 className="text-white font-headline text-2xl font-bold mb-2">Simples assim.</h4>
              <p className="text-white/80 text-sm font-medium leading-relaxed">
                Você envia a foto, nossa Leitura Inteligente cadastra a transação no seu extrato. Sem formulários.
              </p>
            </div>
          </div>
        </div>
      </div>
      <RevisionModal
        isOpen={pendingQueue.length > 0}
        onClose={handleCancelTransaction}
        onSave={handleSaveTransaction}
        initialData={pendingQueue.length > 0 ? {
          ...pendingQueue[0].data,
          preview: files.find(f => f.id === pendingQueue[0].fileId)?.preview || null
        } : null}
      />
    </motion.main>
  );
};
